-- Исправление таблицы users - добавление поля updated_at
-- Выполнить в Supabase SQL Editor

-- 1. Добавить колонку updated_at
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Обновить существующие записи (установить updated_at = created_at для существующих записей)
UPDATE users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 3. Создать триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Создать триггер (если его еще нет)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Проверить результат
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- 6. Проверить данные
SELECT 
    id, 
    username, 
    email, 
    created_at,
    updated_at,
    role,
    status
FROM users 
LIMIT 5; 