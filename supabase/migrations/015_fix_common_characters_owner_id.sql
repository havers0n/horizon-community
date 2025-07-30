-- Миграция для исправления owner_id в common.characters
-- Проблема: owner_id имеет тип UUID, но должен быть INTEGER для ссылки на public.users.id

BEGIN;

-- Проверяем, существует ли таблица common.characters
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'common' 
        AND table_name = 'characters'
    ) THEN
        -- Удаляем существующие ограничения, если они есть
        ALTER TABLE common.characters 
        DROP CONSTRAINT IF EXISTS characters_owner_id_fkey;
        
        -- Проверяем, есть ли данные в таблице
        IF EXISTS (SELECT 1 FROM common.characters LIMIT 1) THEN
            RAISE NOTICE 'Внимание: таблица common.characters содержит данные. Убедитесь, что owner_id содержит корректные INTEGER значения.';
        END IF;
        
        -- Изменяем тип колонки с UUID на INTEGER
        -- Используем безопасное преобразование через text
        ALTER TABLE common.characters 
        ALTER COLUMN owner_id TYPE INTEGER USING owner_id::text::integer;
        
        -- Добавляем правильное ограничение на public.users
        ALTER TABLE common.characters 
        ADD CONSTRAINT characters_owner_id_fkey 
        FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Успешно исправлен тип owner_id в common.characters';
    ELSE
        RAISE NOTICE 'Таблица common.characters не существует, пропускаем миграцию';
    END IF;
END $$;

COMMIT; 