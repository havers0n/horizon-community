-- Скрипт для получения UUID пользователя для тестирования уведомлений
-- Выполните этот запрос в Supabase SQL Editor

-- Получить всех пользователей с их UUID
SELECT 
  id as user_id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Получить конкретного пользователя по email
-- SELECT 
--   id as user_id,
--   email,
--   created_at
-- FROM auth.users 
-- WHERE email = 'your-email@example.com';

-- После получения UUID, замените 'test-user-id' в миграциях на реальный UUID
-- Пример: 'test-user-id' -> '550e8400-e29b-41d4-a716-446655440000'
