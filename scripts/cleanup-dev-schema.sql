-- ===========================================
-- СКРИПТ ОЧИСТКИ DEV_SCHEMA И ТЕСТОВЫХ ДАННЫХ
-- ===========================================

-- Удаляем все таблицы в dev_schema
DROP SCHEMA IF EXISTS dev_schema CASCADE;

-- Удаляем тестовые данные из production таблиц
DELETE FROM mdt.bolos WHERE type = 'test_type';
DELETE FROM mdt.bolos WHERE description LIKE '%тест%' OR description LIKE '%test%';

-- Очищаем тестовые записи из users (если есть)
DELETE FROM public.users WHERE username LIKE '%test%' OR email LIKE '%test%';

-- Проверяем, что dev_schema удален
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'dev_schema';

-- Проверяем количество оставшихся BOLO
SELECT COUNT(*) as total_bolos FROM mdt.bolos;

-- Проверяем количество активных пользователей
SELECT COUNT(*) as total_users FROM public.users WHERE status = 'active'; 