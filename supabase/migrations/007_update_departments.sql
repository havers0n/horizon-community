-- Миграция для обновления департаментов на новые названия
-- PD, SAHP, SAMS, SAFR, DD, CD

-- Очищаем существующие департаменты
DELETE FROM departments;

-- Вставляем новые департаменты
INSERT INTO departments (name, full_name, description, logo_url, gallery) VALUES
('PD', 'Police Department', 'Полицейский департамент', 'https://example.com/pd_logo.png', '{}'),
('SAHP', 'San Andreas Highway Patrol', 'Патрульная служба шоссе Сан-Андреас', 'https://example.com/sahp_logo.png', '{}'),
('SAMS', 'San Andreas Medical Services', 'Медицинская служба Сан-Андреас', 'https://example.com/sams_logo.png', '{}'),
('SAFR', 'San Andreas Fire & Rescue', 'Пожарная служба и спасение Сан-Андреас', 'https://example.com/safr_logo.png', '{}'),
('DD', 'Dispatch Department', 'Департамент диспетчеризации', 'https://example.com/dd_logo.png', '{}'),
('CD', 'Civilian Department', 'Гражданский департамент', 'https://example.com/cd_logo.png', '{}');

-- Сбрасываем последовательность ID
SELECT setval('departments_id_seq', 6, true);

-- Обновляем пользователей, у которых были старые департаменты
-- Устанавливаем department_id в NULL для пользователей со старыми департаментами
UPDATE users SET department_id = NULL WHERE department_id NOT IN (SELECT id FROM departments);
UPDATE users SET secondary_department_id = NULL WHERE secondary_department_id NOT IN (SELECT id FROM departments);

-- Обновляем заявки, которые ссылались на старые департаменты
-- Удаляем заявки, которые ссылались на несуществующие департаменты
DELETE FROM applications WHERE data::text LIKE '%"departmentId":%' AND 
  (data->>'departmentId')::int NOT IN (SELECT id FROM departments);

-- Обновляем тесты, которые ссылались на старые департаменты
-- Проверяем существование таблицы tests перед обновлением
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tests') THEN
        UPDATE tests SET related_to = jsonb_set(related_to, '{departments}', '[]'::jsonb) 
        WHERE related_to->'departments' ?| array(SELECT id::text FROM departments WHERE id NOT IN (SELECT id FROM departments));
    END IF;
END $$; 