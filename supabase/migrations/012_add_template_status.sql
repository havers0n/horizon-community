-- Добавление поля status в таблицу report_templates
-- draft - черновик для админов, ready - готовый для пользователей

ALTER TABLE report_templates 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

-- Обновляем существующие шаблоны как готовые
UPDATE report_templates 
SET status = 'ready' 
WHERE status IS NULL OR status = 'draft';

-- Добавляем комментарий к полю
COMMENT ON COLUMN report_templates.status IS 'Статус шаблона: draft (черновик) или ready (готовый для использования)'; 