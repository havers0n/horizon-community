-- Простой SQL скрипт для исправления таблицы users
-- Выполнить в Supabase SQL Editor

-- 1. Добавляем колонку updated_at
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Обновляем существующие записи
UPDATE users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 3. Создаем функцию для автоматического обновления
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Создаем триггер
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Проверяем результат
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