-- Добавление поля isActive в таблицу active_units
ALTER TABLE active_units 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Создание индекса для оптимизации запросов по isActive
CREATE INDEX idx_active_units_is_active ON active_units(is_active);

-- Обновление существующих записей (все активные юниты должны быть isActive = true)
UPDATE active_units 
SET is_active = TRUE 
WHERE is_active IS NULL; 