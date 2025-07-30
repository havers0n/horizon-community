-- Миграция для добавления недостающих полей в таблицу users
-- Добавляем поля, которые используются в коде, но отсутствуют в схеме БД

BEGIN;

-- Добавляем недостающие поля в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_2fa boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_dark_theme boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sound_settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cad_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_access_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_refresh_token text;

-- Добавляем уникальные индексы для токенов
CREATE UNIQUE INDEX IF NOT EXISTS users_api_token_unique ON users(api_token) WHERE api_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_cad_token_unique ON users(cad_token) WHERE cad_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_unique ON users(discord_id) WHERE discord_id IS NOT NULL;

-- Добавляем комментарии для документации
COMMENT ON COLUMN users.has_2fa IS 'Двухфакторная аутентификация пользователя';
COMMENT ON COLUMN users.is_dark_theme IS 'Предпочтение темной темы интерфейса';
COMMENT ON COLUMN users.sound_settings IS 'Настройки звука пользователя (JSON)';
COMMENT ON COLUMN users.api_token IS 'API токен для внешних интеграций';
COMMENT ON COLUMN users.cad_token IS 'Токен для авторизации из игры (CAD)';
COMMENT ON COLUMN users.discord_id IS 'Discord ID пользователя';
COMMENT ON COLUMN users.discord_access_token IS 'Discord access token для интеграции';
COMMENT ON COLUMN users.discord_refresh_token IS 'Discord refresh token для интеграции';

-- Обновляем существующие записи (устанавливаем значения по умолчанию)
UPDATE users 
SET 
    has_2fa = false,
    is_dark_theme = false,
    sound_settings = '{}'::jsonb
WHERE has_2fa IS NULL OR is_dark_theme IS NULL OR sound_settings IS NULL;

-- Проверяем, что все поля добавлены корректно
DO $$
DECLARE
    missing_columns text[] := ARRAY[]::text[];
    col text;
BEGIN
    FOR col IN SELECT unnest(ARRAY[
        'has_2fa', 'is_dark_theme', 'sound_settings', 
        'api_token', 'cad_token', 'discord_id', 
        'discord_access_token', 'discord_refresh_token'
    ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Не удалось добавить колонки: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Все недостающие поля успешно добавлены в таблицу users';
    END IF;
END $$;

COMMIT; 