-- Joint Positions History Migration
-- Добавление таблицы для отслеживания истории совмещений

-- Создаем таблицу истории совмещений
CREATE TABLE IF NOT EXISTS joint_positions_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    secondary_department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive', 'removed')),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT NOT NULL,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    removed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    removed_at TIMESTAMP,
    removal_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_joint_positions_history_user_id ON joint_positions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_joint_positions_history_status ON joint_positions_history(status);
CREATE INDEX IF NOT EXISTS idx_joint_positions_history_start_date ON joint_positions_history(start_date);
CREATE INDEX IF NOT EXISTS idx_joint_positions_history_approved_by ON joint_positions_history(approved_by);

-- Добавляем комментарии к таблице
COMMENT ON TABLE joint_positions_history IS 'История совмещений пользователей в различных департаментах';
COMMENT ON COLUMN joint_positions_history.user_id IS 'ID пользователя';
COMMENT ON COLUMN joint_positions_history.primary_department_id IS 'ID основного департамента';
COMMENT ON COLUMN joint_positions_history.secondary_department_id IS 'ID департамента по совмещению';
COMMENT ON COLUMN joint_positions_history.status IS 'Статус совмещения: pending, active, inactive, removed';
COMMENT ON COLUMN joint_positions_history.start_date IS 'Дата начала совмещения';
COMMENT ON COLUMN joint_positions_history.end_date IS 'Дата окончания совмещения (если указана)';
COMMENT ON COLUMN joint_positions_history.reason IS 'Обоснование необходимости совмещения';
COMMENT ON COLUMN joint_positions_history.approved_by IS 'ID администратора, одобрившего совмещение';
COMMENT ON COLUMN joint_positions_history.approved_at IS 'Дата и время одобрения';
COMMENT ON COLUMN joint_positions_history.removed_by IS 'ID пользователя, снявшего совмещение';
COMMENT ON COLUMN joint_positions_history.removed_at IS 'Дата и время снятия совмещения';
COMMENT ON COLUMN joint_positions_history.removal_reason IS 'Причина снятия совмещения';

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_joint_positions_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER trigger_update_joint_positions_history_updated_at
    BEFORE UPDATE ON joint_positions_history
    FOR EACH ROW
    EXECUTE FUNCTION update_joint_positions_history_updated_at();

-- Создаем функцию для проверки лимита совмещений
CREATE OR REPLACE FUNCTION check_joint_position_limit(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    active_count INTEGER;
BEGIN
    -- Проверяем количество активных совмещений у пользователя
    SELECT COUNT(*) INTO active_count
    FROM joint_positions_history
    WHERE user_id = user_id_param 
      AND status = 'active'
      AND (end_date IS NULL OR end_date > CURRENT_DATE);
    
    -- Возвращаем true, если активных совмещений меньше 1
    RETURN active_count < 1;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для получения активных совмещений пользователя
CREATE OR REPLACE FUNCTION get_active_joint_positions(user_id_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    user_id INTEGER,
    primary_department_id INTEGER,
    secondary_department_id INTEGER,
    status TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    approved_at TIMESTAMP,
    secondary_department_name TEXT,
    secondary_department_full_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jph.id,
        jph.user_id,
        jph.primary_department_id,
        jph.secondary_department_id,
        jph.status,
        jph.start_date,
        jph.end_date,
        jph.reason,
        jph.approved_at,
        d.name as secondary_department_name,
        d.full_name as secondary_department_full_name
    FROM joint_positions_history jph
    JOIN departments d ON jph.secondary_department_id = d.id
    WHERE jph.user_id = user_id_param 
      AND jph.status = 'active'
      AND (jph.end_date IS NULL OR jph.end_date > CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Добавляем RLS политики для безопасности
ALTER TABLE joint_positions_history ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: пользователи могут видеть только свои записи
CREATE POLICY "Users can view own joint position history" ON joint_positions_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Политика для вставки: пользователи могут создавать записи только для себя
CREATE POLICY "Users can insert own joint position history" ON joint_positions_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Политика для обновления: только администраторы и супервайзеры
CREATE POLICY "Admins can update joint position history" ON joint_positions_history
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политика для удаления: только администраторы
CREATE POLICY "Admins can delete joint position history" ON joint_positions_history
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role = 'admin'
        )
    ); 