-- Скрипт для создания тестовых пользователей
-- Используйте этот скрипт для создания тестовых пользователей в локальной базе данных

-- Создаем департаменты для тестирования
INSERT INTO departments (name, full_name, description) VALUES
('LSPD', 'Los Santos Police Department', 'Полицейский департамент Лос-Сантоса'),
('LSFD', 'Los Santos Fire Department', 'Пожарный департамент Лос-Сантоса'),
('LSMC', 'Los Santos Medical Center', 'Медицинский центр Лос-Сантоса')
ON CONFLICT DO NOTHING;

-- Создание тестовых пользователей
-- ВАЖНО: Эти пользователи должны быть предварительно зарегистрированы в Supabase Auth
-- auth_id должен соответствовать реальному UUID пользователя из auth.users

-- Пример создания тестового пользователя с ролью 'candidate'
-- Замените UUID на реальный из вашей auth.users таблицы
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    role, 
    status, 
    department_id, 
    rank, 
    division,
    auth_id
) VALUES
-- Кандидат
('testuser1', 'test1@example.com', 'hashed_password_1', 'candidate', 'active', 1, 'Cadet', 'Patrol', 
 '00000000-0000-0000-0000-000000000001'::uuid),

-- Супервайзер
('supervisor1', 'supervisor@example.com', 'hashed_password_2', 'supervisor', 'active', 1, 'Lieutenant', 'Patrol', 
 '00000000-0000-0000-0000-000000000002'::uuid),

-- Администратор
('admin1', 'admin@example.com', 'hashed_password_3', 'admin', 'active', 1, 'Captain', 'Administration', 
 '00000000-0000-0000-0000-000000000003'::uuid),

-- Модератор
('moderator1', 'moderator@example.com', 'hashed_password_4', 'moderator', 'active', 1, 'Sergeant', 'Internal Affairs', 
 '00000000-0000-0000-0000-000000000004'::uuid),

-- Поддержка
('support1', 'support@example.com', 'hashed_password_5', 'support', 'active', 1, 'Officer', 'Support', 
 '00000000-0000-0000-0000-000000000005'::uuid)
ON CONFLICT (username) DO NOTHING;

-- Создание тестовых заявок
INSERT INTO applications (
    author_id, 
    type, 
    status, 
    data, 
    created_at
) VALUES
-- Заявка от кандидата
(1, 'recruitment', 'pending', 
 '{"department": "LSPD", "position": "Officer", "experience": "2 years"}', 
 NOW()),

-- Заявка от кандидата на повышение
(1, 'promotion', 'pending', 
 '{"current_rank": "Cadet", "desired_rank": "Officer", "reason": "Excellent performance"}', 
 NOW()),

-- Заявка от супервайзера
(2, 'transfer', 'approved', 
 '{"from_department": "LSPD", "to_department": "LSFD", "reason": "Personal request"}', 
 NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Создание тестовых тикетов поддержки
INSERT INTO support_tickets (
    author_id, 
    status, 
    handler_id, 
    messages, 
    created_at
) VALUES
-- Тикет от кандидата
(1, 'open', 5, 
 '[{"author": "testuser1", "message": "Не могу войти в систему", "timestamp": "2024-01-15T10:00:00Z"}]', 
 NOW()),

-- Тикет от супервайзера
(2, 'closed', 5, 
 '[{"author": "supervisor1", "message": "Проблема с отчетами", "timestamp": "2024-01-14T15:00:00Z"}, {"author": "support1", "message": "Проблема решена", "timestamp": "2024-01-14T16:00:00Z"}]', 
 NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Создание тестовых жалоб
INSERT INTO complaints (
    author_id, 
    status, 
    incident_date, 
    incident_type, 
    participants, 
    description, 
    created_at
) VALUES
-- Жалоба от кандидата
(1, 'pending', NOW() - INTERVAL '3 days', 'harassment', 'Officer John Doe', 
 'Неподобающее поведение во время проверки', NOW()),

-- Жалоба от супервайзера
(2, 'reviewed', NOW() - INTERVAL '5 days', 'misconduct', 'Cadet Jane Smith', 
 'Нарушение протокола безопасности', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Создание тестовых отчетов
INSERT INTO reports (
    author_id, 
    status, 
    file_url, 
    supervisor_comment, 
    created_at
) VALUES
-- Отчет от кандидата
(1, 'pending', 'https://example.com/report1.pdf', NULL, NOW()),

-- Отчет от супервайзера
(2, 'approved', 'https://example.com/report2.pdf', 'Отличная работа!', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Создание тестовых уведомлений
INSERT INTO notifications (
    recipient_id, 
    content, 
    link, 
    is_read, 
    created_at
) VALUES
-- Уведомление для кандидата
(1, 'Ваша заявка на трудоустройство находится на рассмотрении', '/applications/1', false, NOW()),

-- Уведомление для супервайзера
(2, 'Новая заявка требует вашего внимания', '/applications/2', true, NOW() - INTERVAL '1 hour'),

-- Уведомление для администратора
(3, 'Системное обновление завершено', '/dashboard', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Создание тестового теста
INSERT INTO tests (
    title, 
    related_to, 
    duration_minutes, 
    questions
) VALUES
('Базовый тест для кандидатов LSPD', 
 '{"department": "LSPD", "position": "Officer"}', 
 30, 
 '[{"question": "Что такое Miranda Rights?", "options": ["Права подозреваемого", "Права офицера", "Права свидетеля"], "correct": 0}, {"question": "Максимальная скорость в городе?", "options": ["50 mph", "60 mph", "70 mph"], "correct": 0}]')
ON CONFLICT DO NOTHING;

-- Выводим информацию о созданных пользователях
SELECT 
    id,
    username,
    email,
    role,
    status,
    department_id,
    rank,
    division,
    auth_id
FROM users
ORDER BY id;
