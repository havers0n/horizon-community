-- Миграция для настройки прав доступа к схеме common
-- Проблема: PostgREST не может получить доступ к схеме common

-- 1. Включаем RLS для всех таблиц в схеме common
ALTER TABLE common.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE common.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE common.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE common.vehicles ENABLE ROW LEVEL SECURITY;

-- 2. Создаем политики для чтения департаментов (публичный доступ)
CREATE POLICY "Allow public read access to departments" ON common.departments
    FOR SELECT USING (true);

-- 3. Создаем политики для чтения персонажей (только владельцы)
CREATE POLICY "Allow users to read their own characters" ON common.characters
    FOR SELECT USING (auth.uid()::text = owner_id::text);

-- 4. Создаем политики для чтения юнитов (публичный доступ)
CREATE POLICY "Allow public read access to units" ON common.units
    FOR SELECT USING (true);

-- 5. Создаем политики для чтения транспорта (только владельцы)
CREATE POLICY "Allow users to read their own vehicles" ON common.vehicles
    FOR SELECT USING (auth.uid()::text = owner_id::text);

-- 6. Настраиваем права для анонимного пользователя
GRANT USAGE ON SCHEMA common TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA common TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA common TO anon;

-- 7. Настраиваем права для аутентифицированного пользователя
GRANT USAGE ON SCHEMA common TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA common TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA common TO authenticated;

-- 8. Настраиваем права для service_role
GRANT USAGE ON SCHEMA common TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA common TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA common TO service_role;

-- 9. Настраиваем права для postgrest
GRANT USAGE ON SCHEMA common TO postgrest;
GRANT SELECT ON ALL TABLES IN SCHEMA common TO postgrest;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA common TO postgrest;

-- 10. Обновляем конфигурацию PostgREST для включения схемы common
-- Это нужно сделать в настройках Supabase Dashboard или через SQL
-- ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';
-- ALTER DATABASE postgres SET "app.settings.default_role" TO 'anon';

-- 11. Создаем функцию для проверки прав доступа
CREATE OR REPLACE FUNCTION common.check_user_permission(user_id text, resource_type text, resource_id text)
RETURNS boolean AS $$
BEGIN
    -- Базовая проверка - пользователь аутентифицирован
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Для департаментов - публичный доступ
    IF resource_type = 'department' THEN
        RETURN true;
    END IF;
    
    -- Для персонажей - только владелец
    IF resource_type = 'character' THEN
        RETURN EXISTS (
            SELECT 1 FROM common.characters 
            WHERE id::text = resource_id AND owner_id::text = user_id
        );
    END IF;
    
    -- Для транспорта - только владелец
    IF resource_type = 'vehicle' THEN
        RETURN EXISTS (
            SELECT 1 FROM common.vehicles 
            WHERE id::text = resource_id AND owner_id::text = user_id
        );
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Создаем представление для департаментов с правильными правами
CREATE OR REPLACE VIEW public.departments_view AS
SELECT * FROM common.departments;

-- 13. Настраиваем права для представления
GRANT SELECT ON public.departments_view TO anon;
GRANT SELECT ON public.departments_view TO authenticated;
GRANT SELECT ON public.departments_view TO service_role;
GRANT SELECT ON public.departments_view TO postgrest; 