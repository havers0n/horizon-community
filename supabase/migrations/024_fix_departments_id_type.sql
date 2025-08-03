-- Исправление типа ID в таблице departments
-- Меняем SERIAL (INTEGER) на UUID для соответствия RPC функции

-- Сначала создаем временную таблицу с правильной структурой
CREATE TABLE IF NOT EXISTS common.departments_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[] DEFAULT '{}'
);

-- Копируем данные из старой таблицы, генерируя новые UUID
INSERT INTO common.departments_new (name, full_name, logo_url, description, gallery)
SELECT name, full_name, logo_url, description, gallery
FROM common.departments;

-- Удаляем старую таблицу
DROP TABLE IF EXISTS common.departments;

-- Переименовываем новую таблицу
ALTER TABLE common.departments_new RENAME TO departments;

-- Обновляем RPC функцию для работы с новой структурой
DROP FUNCTION IF EXISTS public.get_all_departments();

CREATE OR REPLACE FUNCTION public.get_all_departments()
RETURNS TABLE (
  id UUID,
  name TEXT,
  full_name TEXT,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[]
) 
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.full_name,
    d.logo_url,
    d.description,
    d.gallery
  FROM common.departments d
  ORDER BY d.name;
END;
$$;

-- Предоставляем права на выполнение функции всем пользователям
GRANT EXECUTE ON FUNCTION public.get_all_departments() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_departments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_departments() TO service_role;

-- Добавляем комментарий к функции
COMMENT ON FUNCTION public.get_all_departments() IS 
'Безопасная RPC функция для получения списка всех департаментов из схемы common. 
Функция использует SECURITY INVOKER для выполнения с правами вызывающего пользователя,
что позволяет RLS политикам работать корректно.'; 