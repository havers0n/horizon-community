-- Добавление поля updated_at в таблицу users
-- Миграция: 004_add_updated_at_to_users.sql

-- 1. Добавляем колонку updated_at
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Обновляем существующие записи (устанавливаем updated_at = created_at)
UPDATE users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- 3. Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Создаем триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Добавляем комментарий к таблице
COMMENT ON COLUMN users.updated_at IS 'Время последнего обновления записи пользователя'; 