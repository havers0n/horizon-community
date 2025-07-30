-- Создание таблицы для BOLO (ориентировок)
CREATE TABLE IF NOT EXISTS mdt_bolos (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('vehicle', 'person', 'general')),
    description TEXT NOT NULL,
    vehicle VARCHAR(100),
    plate VARCHAR(20),
    reason TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    location TEXT,
    additional_info TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired', 'deleted')),
    issued_by INTEGER NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_mdt_bolos_status ON mdt_bolos(status);
CREATE INDEX IF NOT EXISTS idx_mdt_bolos_type ON mdt_bolos(type);
CREATE INDEX IF NOT EXISTS idx_mdt_bolos_priority ON mdt_bolos(priority);
CREATE INDEX IF NOT EXISTS idx_mdt_bolos_issued_by ON mdt_bolos(issued_by);
CREATE INDEX IF NOT EXISTS idx_mdt_bolos_created_at ON mdt_bolos(created_at);

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mdt_bolos_updated_at 
    BEFORE UPDATE ON mdt_bolos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Добавление комментариев к таблице и колонкам
COMMENT ON TABLE mdt_bolos IS 'Таблица для хранения BOLO (ориентировок) в системе MDT';
COMMENT ON COLUMN mdt_bolos.id IS 'Уникальный идентификатор BOLO';
COMMENT ON COLUMN mdt_bolos.type IS 'Тип BOLO: vehicle (транспорт), person (человек), general (общий)';
COMMENT ON COLUMN mdt_bolos.description IS 'Подробное описание объекта поиска';
COMMENT ON COLUMN mdt_bolos.vehicle IS 'Модель транспортного средства (для type=vehicle)';
COMMENT ON COLUMN mdt_bolos.plate IS 'Номерной знак транспортного средства (для type=vehicle)';
COMMENT ON COLUMN mdt_bolos.reason IS 'Причина для поиска';
COMMENT ON COLUMN mdt_bolos.priority IS 'Приоритет: low, medium, high, critical';
COMMENT ON COLUMN mdt_bolos.location IS 'Последнее известное местоположение';
COMMENT ON COLUMN mdt_bolos.additional_info IS 'Дополнительная информация';
COMMENT ON COLUMN mdt_bolos.status IS 'Статус: active, resolved, expired, deleted';
COMMENT ON COLUMN mdt_bolos.issued_by IS 'ID пользователя, создавшего BOLO';
COMMENT ON COLUMN mdt_bolos.expires_at IS 'Дата истечения срока действия';
COMMENT ON COLUMN mdt_bolos.created_at IS 'Дата создания';
COMMENT ON COLUMN mdt_bolos.updated_at IS 'Дата последнего обновления'; 