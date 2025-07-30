-- Проверка структуры таблицы users
-- Выполнить в Supabase SQL Editor

-- 1. Проверить существующие колонки
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Проверить есть ли updated_at
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name IN ('created_at', 'updated_at');

-- 3. Посмотреть на данные (если есть)
SELECT 
    id, 
    username, 
    email, 
    created_at,
    -- updated_at -- эта колонка может отсутствовать
    role,
    status
FROM users 
LIMIT 5; 