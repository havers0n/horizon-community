-- Проверка существующих департаментов
-- Выполните этот SQL для просмотра департаментов в вашей базе данных

-- Показать все департаменты
SELECT 
    id,
    name,
    full_name,
    description
FROM departments 
ORDER BY id;

-- Показать количество департаментов
SELECT COUNT(*) as total_departments FROM departments;

-- Показать департаменты с их ID для создания категорий
SELECT 
    'INSERT INTO forum_categories (name, description, department_id, icon, color, order_index) VALUES (''' ||
    name || ' форум'', ''Мануалы, гайды и обсуждения ' || name || ''', ' || id || ', ''users'', ''bg-gray-500'', ' || id || ');' as insert_statement
FROM departments 
ORDER BY id; 