-- ФИНАЛЬНАЯ, ИСПРАВЛЕННАЯ ВЕРСИЯ RPC-ФУНКЦИИ
-- Создание RPC функции для безопасного доступа к departments
-- Эта функция позволяет получать список департаментов без прямого доступа к схеме common

-- Сначала удаляем старую версию, если она есть
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
  -- Простой SELECT из защищенной схемы common
  -- RLS политика на departments уже разрешает публичное чтение (FOR SELECT USING (true))
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