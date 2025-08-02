-- Миграция 020: Создание доверенных RPC функций с SECURITY DEFINER
-- Эта миграция создает RPC функции, которые выполняются с правами service_user
-- и обходят RLS политики для безопасного доступа к данным

-- ===== ОСНОВНЫЕ RPC ФУНКЦИИ ДЛЯ ПЕРСОНАЖЕЙ =====

-- Создание нового персонажа
CREATE OR REPLACE FUNCTION public.create_new_character(p_data JSONB)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  -- Внутри SECURITY DEFINER auth.uid() всегда NULL
  -- Берем owner_id из переданных данных (проверяется в middleware)
  
  RETURN QUERY INSERT INTO common.characters (
    owner_id, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender,
    phone_number,
    address,
    occupation,
    ssn,
    licenses,
    medical_info,
    mugshot_url,
    flags
  )
  VALUES (
    (p_data->>'owner_id')::UUID,
    p_data->>'first_name',
    p_data->>'last_name',
    (p_data->>'date_of_birth')::DATE,
    p_data->>'gender',
    p_data->>'phone_number',
    p_data->>'address',
    p_data->>'occupation',
    p_data->>'ssn',
    p_data->'licenses',
    p_data->'medical_info',
    p_data->>'mugshot_url',
    COALESCE(p_data->'flags', '[]'::JSONB)
  )
  RETURNING *;
END;
$$;

-- Получение персонажа по ID
CREATE OR REPLACE FUNCTION public.get_character_by_id(p_character_id UUID)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE id = p_character_id;
END;
$$;

-- Получение персонажей по владельцу
CREATE OR REPLACE FUNCTION public.get_characters_with_filters(
  p_owner_id UUID DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_occupation TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE (p_owner_id IS NULL OR owner_id = p_owner_id)
    AND (p_gender IS NULL OR gender = p_gender)
    AND (p_occupation IS NULL OR occupation = p_occupation)
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Получение персонажей текущего пользователя
CREATE OR REPLACE FUNCTION public.get_my_characters(p_user_id UUID)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE owner_id = p_user_id ORDER BY created_at DESC;
END;
$$;

-- Обновление персонажа
CREATE OR REPLACE FUNCTION public.update_character(p_character_id UUID, p_updates JSONB)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  character_exists BOOLEAN;
BEGIN
  -- Проверяем, что персонаж существует
  SELECT EXISTS(SELECT 1 FROM common.characters WHERE id = p_character_id) INTO character_exists;
  
  IF NOT character_exists THEN
    RETURN; -- Возвращаем пустой результат, если персонаж не найден
  END IF;

  RETURN QUERY 
  UPDATE common.characters 
  SET 
    first_name = COALESCE(p_updates->>'first_name', first_name),
    last_name = COALESCE(p_updates->>'last_name', last_name),
    date_of_birth = COALESCE((p_updates->>'date_of_birth')::DATE, date_of_birth),
    gender = COALESCE(p_updates->>'gender', gender),
    phone_number = COALESCE(p_updates->>'phone_number', phone_number),
    address = COALESCE(p_updates->>'address', address),
    occupation = COALESCE(p_updates->>'occupation', occupation),
    ssn = COALESCE(p_updates->>'ssn', ssn),
    licenses = COALESCE(p_updates->'licenses', licenses),
    medical_info = COALESCE(p_updates->'medical_info', medical_info),
    mugshot_url = COALESCE(p_updates->>'mugshot_url', mugshot_url),
    flags = CASE 
      WHEN p_updates ? 'flags' THEN 
        (SELECT array_agg(elem) FROM jsonb_array_elements_text(p_updates->'flags'))
      ELSE flags 
    END,
    updated_at = NOW()
  WHERE id = p_character_id
  RETURNING *;
END;
$$;

-- Удаление персонажа
CREATE OR REPLACE FUNCTION public.delete_character(p_character_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  DELETE FROM common.characters WHERE id = p_character_id;
  RETURN FOUND;
END;
$$;

-- Получение всех персонажей
CREATE OR REPLACE FUNCTION public.get_all_characters(p_limit INTEGER DEFAULT 100, p_offset INTEGER DEFAULT 0)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Поиск персонажей
CREATE OR REPLACE FUNCTION public.search_characters(p_query TEXT, p_limit INTEGER DEFAULT 10)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE 
    first_name ILIKE '%' || p_query || '%' OR
    last_name ILIKE '%' || p_query || '%' OR
    ssn ILIKE '%' || p_query || '%'
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$;

-- ===== СТАТИСТИЧЕСКИЕ RPC ФУНКЦИИ =====

-- Подсчет всех персонажей
CREATE OR REPLACE FUNCTION public.get_character_count()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result FROM common.characters;
  RETURN count_result;
END;
$$;

-- Подсчет персонажей по владельцу
CREATE OR REPLACE FUNCTION public.get_character_count_by_owner(p_owner_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result FROM common.characters WHERE owner_id = p_owner_id;
  RETURN count_result;
END;
$$;

-- Подсчет персонажей по полу
CREATE OR REPLACE FUNCTION public.get_character_count_by_gender(p_gender TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result FROM common.characters WHERE gender = p_gender;
  RETURN count_result;
END;
$$;

-- ===== БИЗНЕС-ЛОГИКА RPC ФУНКЦИИ =====

-- Передача владения персонажем
CREATE OR REPLACE FUNCTION public.transfer_character_ownership(p_character_id UUID, p_new_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  UPDATE common.characters 
  SET owner_id = p_new_owner_id, updated_at = NOW()
  WHERE id = p_character_id;
  RETURN FOUND;
END;
$$;

-- Получение персонажей по возрастному диапазону
CREATE OR REPLACE FUNCTION public.get_characters_by_age_range(p_min_age INTEGER, p_max_age INTEGER)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE date_of_birth IS NOT NULL
    AND EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN p_min_age AND p_max_age
  ORDER BY created_at DESC;
END;
$$;

-- Получение персонажей по году рождения
CREATE OR REPLACE FUNCTION public.get_characters_by_birth_year(p_year INTEGER)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE EXTRACT(YEAR FROM date_of_birth) = p_year
  ORDER BY created_at DESC;
END;
$$;

-- Получение персонажей по месяцу рождения
CREATE OR REPLACE FUNCTION public.get_characters_by_birth_month(p_month INTEGER)
RETURNS SETOF common.characters 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE EXTRACT(MONTH FROM date_of_birth) = p_month
  ORDER BY created_at DESC;
END;
$$;

-- ===== ДОПОЛНИТЕЛЬНЫЕ RPC ФУНКЦИИ =====

-- Получение персонажа с профилем владельца
CREATE OR REPLACE FUNCTION public.get_character_with_profile(p_character_id UUID)
RETURNS TABLE(
  id UUID,
  owner_id UUID,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  phone_number TEXT,
  address TEXT,
  occupation TEXT,
  ssn TEXT,
  licenses JSONB,
  medical_info JSONB,
  mugshot_url TEXT,
  flags JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profile_id UUID,
  profile_username TEXT,
  profile_email TEXT,
  profile_role TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    c.*,
    p.id as profile_id,
    p.username as profile_username,
    p.email as profile_email,
    p.role as profile_role
  FROM common.characters c
  LEFT JOIN public.profiles p ON c.owner_id = p.id
  WHERE c.id = p_character_id;
END;
$$;

-- Получение персонажей с профилями владельцев
CREATE OR REPLACE FUNCTION public.get_characters_with_profiles(p_owner_id UUID)
RETURNS TABLE(
  id UUID,
  owner_id UUID,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  phone_number TEXT,
  address TEXT,
  occupation TEXT,
  ssn TEXT,
  licenses JSONB,
  medical_info JSONB,
  mugshot_url TEXT,
  flags JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profile_id UUID,
  profile_username TEXT,
  profile_email TEXT,
  profile_role TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    c.*,
    p.id as profile_id,
    p.username as profile_username,
    p.email as profile_email,
    p.role as profile_role
  FROM common.characters c
  LEFT JOIN public.profiles p ON c.owner_id = p.id
  WHERE c.owner_id = p_owner_id
  ORDER BY c.created_at DESC;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ЛИЦЕНЗИЯМИ =====

-- Получение лицензий персонажа
CREATE OR REPLACE FUNCTION public.get_character_licenses(p_character_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  licenses_result JSONB;
BEGIN
  SELECT licenses INTO licenses_result FROM common.characters WHERE id = p_character_id;
  RETURN licenses_result;
END;
$$;

-- Обновление лицензий персонажа
CREATE OR REPLACE FUNCTION public.update_character_licenses(p_character_id UUID, p_new_licenses JSONB)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  updated_licenses JSONB;
BEGIN
  UPDATE common.characters 
  SET licenses = p_new_licenses, updated_at = NOW()
  WHERE id = p_character_id
  RETURNING licenses INTO updated_licenses;
  RETURN updated_licenses;
END;
$$;

-- ===== ФУНКЦИИ ДЛЯ РАБОТЫ С МЕДИЦИНСКОЙ ИНФОРМАЦИЕЙ =====

-- Получение медицинской информации персонажа
CREATE OR REPLACE FUNCTION public.get_character_medical_info(p_character_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  medical_info_result JSONB;
BEGIN
  SELECT medical_info INTO medical_info_result FROM common.characters WHERE id = p_character_id;
  RETURN medical_info_result;
END;
$$;

-- Обновление медицинской информации персонажа
CREATE OR REPLACE FUNCTION public.update_character_medical_info(p_character_id UUID, p_new_medical_info JSONB)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
DECLARE
  updated_medical_info JSONB;
BEGIN
  UPDATE common.characters 
  SET medical_info = p_new_medical_info, updated_at = NOW()
  WHERE id = p_character_id
  RETURNING medical_info INTO updated_medical_info;
  RETURN updated_medical_info;
END;
$$;

-- ===== RPC ФУНКЦИИ ДЛЯ MDT СИСТЕМЫ =====

-- =================================================================
-- ФИНАЛЬНЫЙ СКРИПТ RPC-ФУНКЦИИ ДЛЯ BOLO (Версия 3.0 - Исправленная)
-- =================================================================

-- ===== Шаг 1: Очистка старых версий =====
DROP FUNCTION IF EXISTS public.get_active_bolos_with_author();
DROP TYPE IF EXISTS public.bolo_with_author;

-- ===== Шаг 2: Создание нового композитного типа =====
-- Этот тип будет "контейнером" для результата нашего JOIN'а
CREATE TYPE public.bolo_with_author AS (
  id UUID,
  type TEXT,
  reason TEXT,
  status TEXT,
  location TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  subject_name TEXT,
  subject_description TEXT,
  vehicle_plate TEXT,
  vehicle_description TEXT,
  author_character_id UUID,
  author_full_name TEXT -- Добавляем поле для полного имени автора
);

-- ===== Шаг 3: Создание новой RPC-функции =====
CREATE OR REPLACE FUNCTION public.get_active_bolos_with_author() 
RETURNS SETOF public.bolo_with_author -- Возвращаем наш новый тип
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, common, mdt AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    b.id,
    b.type,
    b.reason,
    b.status,
    b.location,
    b.priority,
    b.created_at,
    b.subject_name,
    b.subject_description,
    b.vehicle_plate,
    b.vehicle_description,
    b.author_character_id,
    c.first_name || ' ' || c.last_name AS author_full_name -- Соединяем имя и фамилию
  FROM mdt.bolos AS b
  -- Правильный JOIN: связываем UUID с UUID
  LEFT JOIN common.characters AS c ON b.author_character_id = c.id
  WHERE b.status = 'active'
  ORDER BY b.created_at DESC;
END;
$$;

-- ===== Шаг 4: Выдача прав на выполнение =====
GRANT EXECUTE ON FUNCTION public.get_active_bolos_with_author() TO authenticated;

-- ===== ГРАНТЫ ПРАВ ДЛЯ RPC ФУНКЦИЙ =====

-- Даем право аутентифицированным пользователям вызывать RPC функции
GRANT EXECUTE ON FUNCTION public.create_new_character(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_characters_with_filters(UUID, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_characters(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_character(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_character(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_characters(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_characters(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_count_by_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_count_by_gender(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_character_ownership(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_characters_by_age_range(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_characters_by_birth_year(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_characters_by_birth_month(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_with_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_characters_with_profiles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_licenses(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_character_licenses(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_character_medical_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_character_medical_info(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_bolos_with_author() TO authenticated;

-- ===== МЕТАДАННЫЕ МИГРАЦИИ =====

INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES (
  '020_create_trusted_rpc_functions',
  ARRAY[
    'Created trusted RPC functions with SECURITY DEFINER',
    'Added service_user role support',
    'Granted execute permissions to authenticated users'
  ],
  'Create Trusted RPC Functions'
); 