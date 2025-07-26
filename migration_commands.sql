-- ===========================================
-- МИГРАЦИЯ: ExtendUsersAndCharacters
-- Добавление недостающих полей из SnailyCAD
-- ===========================================

-- === НОВЫЕ ПОЛЯ ДЛЯ ТАБЛИЦЫ USERS ===
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_2fa" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_dark_theme" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sound_settings" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_token" text;
ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_api_token_unique" UNIQUE("api_token");

-- === НОВЫЕ ПОЛЯ ДЛЯ ТАБЛИЦЫ CHARACTERS ===
-- Демографические поля
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "gender" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "ethnicity" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "height" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "weight" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "hair_color" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "eye_color" text;

-- Контактные поля
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "phone_number" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "postal" text;

-- Профессиональные поля
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "occupation" text;

-- Статусные поля
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "dead" boolean DEFAULT false;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "date_of_dead" date;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "missing" boolean DEFAULT false;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "arrested" boolean DEFAULT false;

-- Офицерские поля
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "callsign" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "callsign2" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "suspended" boolean DEFAULT false;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "whitelist_status" text DEFAULT 'PENDING';
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "radio_channel_id" text;

-- === КОММЕНТАРИИ ДЛЯ ДОКУМЕНТАЦИИ ===
COMMENT ON COLUMN "users"."has_2fa" IS 'Двухфакторная аутентификация (из SnailyCAD)';
COMMENT ON COLUMN "users"."is_dark_theme" IS 'Темная тема интерфейса (из SnailyCAD)';
COMMENT ON COLUMN "users"."sound_settings" IS 'Настройки звука пользователя (из SnailyCAD)';
COMMENT ON COLUMN "users"."api_token" IS 'API токен для внешних интеграций (из SnailyCAD)';

COMMENT ON COLUMN "characters"."gender" IS 'Пол персонажа (из SnailyCAD)';
COMMENT ON COLUMN "characters"."ethnicity" IS 'Этническая принадлежность (из SnailyCAD)';
COMMENT ON COLUMN "characters"."height" IS 'Рост персонажа (из SnailyCAD)';
COMMENT ON COLUMN "characters"."weight" IS 'Вес персонажа (из SnailyCAD)';
COMMENT ON COLUMN "characters"."hair_color" IS 'Цвет волос (из SnailyCAD)';
COMMENT ON COLUMN "characters"."eye_color" IS 'Цвет глаз (из SnailyCAD)';
COMMENT ON COLUMN "characters"."phone_number" IS 'Номер телефона (из SnailyCAD)';
COMMENT ON COLUMN "characters"."postal" IS 'Почтовый индекс (из SnailyCAD)';
COMMENT ON COLUMN "characters"."occupation" IS 'Профессия (из SnailyCAD)';
COMMENT ON COLUMN "characters"."dead" IS 'Статус смерти персонажа (из SnailyCAD)';
COMMENT ON COLUMN "characters"."date_of_dead" IS 'Дата смерти (из SnailyCAD)';
COMMENT ON COLUMN "characters"."missing" IS 'Статус пропажи (из SnailyCAD)';
COMMENT ON COLUMN "characters"."arrested" IS 'Статус ареста (из SnailyCAD)';
COMMENT ON COLUMN "characters"."callsign" IS 'Позывной офицера (из SnailyCAD)';
COMMENT ON COLUMN "characters"."callsign2" IS 'Дополнительный позывной (из SnailyCAD)';
COMMENT ON COLUMN "characters"."suspended" IS 'Статус приостановки (из SnailyCAD)';
COMMENT ON COLUMN "characters"."whitelist_status" IS 'Статус белого списка (из SnailyCAD)';
COMMENT ON COLUMN "characters"."radio_channel_id" IS 'ID радиоканала (из SnailyCAD)';

-- === ПРОВЕРКА РЕЗУЛЬТАТА ===
-- Проверяем, что поля добавлены
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('has_2fa', 'is_dark_theme', 'sound_settings', 'api_token')
ORDER BY column_name;

SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN ('gender', 'ethnicity', 'height', 'weight', 'hair_color', 'eye_color', 'phone_number', 'postal', 'occupation', 'dead', 'date_of_dead', 'missing', 'arrested', 'callsign', 'callsign2', 'suspended', 'whitelist_status', 'radio_channel_id')
ORDER BY column_name; 