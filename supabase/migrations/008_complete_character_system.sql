-- Полная система персонажей с иерархией званий, подразделений и юнитов
-- Миграция 008: Complete Character System

-- ===== ЗВАНИЯ И ДОЛЖНОСТИ =====

-- Создаем таблицу званий
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('rank', 'position')), -- rank - звание, position - должность
    order_index INTEGER NOT NULL, -- для сортировки
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(department_id, name)
);

-- Создаем таблицу подразделений
CREATE TABLE IF NOT EXISTS divisions (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(department_id, name)
);

-- Создаем таблицу квалификаций
CREATE TABLE IF NOT EXISTS qualifications (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE, -- NULL для общих квалификаций
    division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE, -- NULL для общих квалификаций
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу юнитов
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(department_id, name)
);

-- ===== ОБНОВЛЕНИЕ ТАБЛИЦЫ CHARACTERS =====

-- Создаем таблицу characters если она не существует
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL, -- Изменено с INTEGER на UUID для совместимости с auth.uid()
    type TEXT NOT NULL CHECK (type IN ('civilian', 'leo', 'fire', 'ems')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    insurance_number TEXT NOT NULL UNIQUE,
    licenses JSONB NOT NULL DEFAULT '{}',
    medical_info JSONB NOT NULL DEFAULT '{}',
    mugshot_url TEXT,
    is_unit BOOLEAN NOT NULL DEFAULT false,
    unit_info JSONB,
    department_id INTEGER REFERENCES departments(id),
    rank_id INTEGER REFERENCES ranks(id),
    division_id INTEGER REFERENCES divisions(id),
    unit_id INTEGER REFERENCES units(id),
    badge_number TEXT,
    employee_id TEXT,
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- owner_id теперь UUID и не требует внешнего ключа, так как ссылается на auth.users(id)
-- Внешний ключ удален, так как owner_id теперь UUID, а не INTEGER

-- Создаем таблицу связи персонажей с квалификациями
CREATE TABLE IF NOT EXISTS character_qualifications (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    qualification_id INTEGER NOT NULL REFERENCES qualifications(id) ON DELETE CASCADE,
    obtained_date DATE NOT NULL,
    expires_date DATE, -- NULL для бессрочных
    issued_by INTEGER REFERENCES characters(id), -- кто выдал квалификацию
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(character_id, qualification_id)
);

-- Создаем таблицу истории карьеры персонажа
CREATE TABLE IF NOT EXISTS character_career_history (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    rank_id INTEGER REFERENCES ranks(id),
    division_id INTEGER REFERENCES divisions(id),
    unit_id INTEGER REFERENCES units(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('hire', 'promotion', 'transfer', 'demotion', 'termination')),
    effective_date DATE NOT NULL,
    reason TEXT,
    approved_by INTEGER REFERENCES characters(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ===== ВСТАВКА ДАННЫХ =====

-- Вставляем звания для PD
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'Police Officer I', 'rank', 1 FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Police Officer II', 'rank', 2 FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Senior Officer', 'rank', 3 FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Sergeant', 'rank', 4 FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Lieutenant', 'position', 5 FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Captain', 'position', 6 FROM departments WHERE name = 'PD';

-- Вставляем звания для SAHP
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'State Trooper', 'rank', 1 FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Senior Trooper', 'rank', 2 FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Master Trooper', 'rank', 3 FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Sergeant', 'rank', 4 FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Lieutenant', 'position', 5 FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Captain', 'position', 6 FROM departments WHERE name = 'SAHP';

-- Вставляем звания для SAMS
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'Probationary Paramedic', 'rank', 1 FROM departments WHERE name = 'SAMS'
UNION ALL
SELECT id, 'Paramedic', 'rank', 2 FROM departments WHERE name = 'SAMS'
UNION ALL
SELECT id, 'Senior Paramedic', 'rank', 3 FROM departments WHERE name = 'SAMS'
UNION ALL
SELECT id, 'Chief of SAMS', 'position', 4 FROM departments WHERE name = 'SAMS'
UNION ALL
SELECT id, 'Deputy Chief of SAMS', 'position', 5 FROM departments WHERE name = 'SAMS';

-- Вставляем звания для SAFR
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'Probationary Firefighter', 'rank', 1 FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Firefighter', 'rank', 2 FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Senior Firefighter', 'rank', 3 FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Lieutenant', 'rank', 4 FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Captain', 'position', 5 FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Battalion Chief', 'position', 6 FROM departments WHERE name = 'SAFR';

-- Вставляем звания для DD
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'Probationary Dispatcher', 'rank', 1 FROM departments WHERE name = 'DD'
UNION ALL
SELECT id, 'Dispatcher', 'rank', 2 FROM departments WHERE name = 'DD'
UNION ALL
SELECT id, 'Deputy Head of DD', 'position', 3 FROM departments WHERE name = 'DD'
UNION ALL
SELECT id, 'Head of DD', 'position', 4 FROM departments WHERE name = 'DD';

-- Вставляем звания для CD
INSERT INTO ranks (department_id, name, type, order_index) 
SELECT id, 'Probationary Civilian', 'rank', 1 FROM departments WHERE name = 'CD'
UNION ALL
SELECT id, 'Civilian', 'rank', 2 FROM departments WHERE name = 'CD'
UNION ALL
SELECT id, 'Deputy Head of CD', 'position', 3 FROM departments WHERE name = 'CD'
UNION ALL
SELECT id, 'Head of CD', 'position', 4 FROM departments WHERE name = 'CD';

-- Вставляем подразделения для PD
INSERT INTO divisions (department_id, name, description) 
SELECT id, 'Patrol Division', 'Патрульное подразделение' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Investigations Bureau', 'Бюро расследований' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'High Risk Operations Division (HROD)', 'Подразделение высокого риска' FROM departments WHERE name = 'PD';

-- Вставляем подразделения для SAHP
INSERT INTO divisions (department_id, name, description) 
SELECT id, 'Patrol Division', 'Патрульное подразделение' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Highway Investigations Section', 'Секция расследований на шоссе' FROM departments WHERE name = 'SAHP';

-- Вставляем квалификации HROD
INSERT INTO qualifications (name, description, division_id) 
SELECT 'Sniper', 'Снайпер', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Tactical Paramedic', 'Тактический парамедик', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Dive Unit', 'Водолазное подразделение', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Crisis Unit', 'Кризисное подразделение', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Drone Operator', 'Оператор дронов', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Bomb Squad', 'Взрывотехническая служба', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Bomb Squad K-9', 'Кинологическая служба', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)'
UNION ALL
SELECT 'Air Operator', 'Воздушный оператор', id FROM divisions WHERE name = 'High Risk Operations Division (HROD)';

-- Вставляем юниты для PD
INSERT INTO units (department_id, name, description) 
SELECT id, 'BLS', 'Basic Life Support' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'AR-15', 'Специальное оружие' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'K-9 Unit', 'Кинологическая служба' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Air Support', 'Воздушная поддержка' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Harbor Unit', 'Портовая служба' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Bicycle Patrol', 'Велосипедный патруль' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Traffic Enforcement', 'Дорожная полиция' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Moto Unit', 'Мотоциклетная служба' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'FTO', 'Field Training Officer' FROM departments WHERE name = 'PD'
UNION ALL
SELECT id, 'Wildlife Unit', 'Служба охраны дикой природы' FROM departments WHERE name = 'PD';

-- Вставляем юниты для SAHP
INSERT INTO units (department_id, name, description) 
SELECT id, 'BLS', 'Basic Life Support' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'AR-15', 'Специальное оружие' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Air Support', 'Воздушная поддержка' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'CVE', 'Commercial Vehicle Enforcement' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'Moto Unit', 'Мотоциклетная служба' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'FTO', 'Field Training Officer' FROM departments WHERE name = 'SAHP'
UNION ALL
SELECT id, 'K-9', 'Кинологическая служба' FROM departments WHERE name = 'SAHP';

-- Вставляем юниты для SAMS
INSERT INTO units (department_id, name, description) 
SELECT id, 'Coroner', 'Коронер' FROM departments WHERE name = 'SAMS'
UNION ALL
SELECT id, 'CSI', 'Crime Scene Investigation' FROM departments WHERE name = 'SAMS';

-- Вставляем юниты для SAFR
INSERT INTO units (department_id, name, description) 
SELECT id, 'SADOT', 'San Andreas Department of Transportation' FROM departments WHERE name = 'SAFR'
UNION ALL
SELECT id, 'Animal Control', 'Контроль животных' FROM departments WHERE name = 'SAFR';

-- Вставляем юниты для DD
INSERT INTO units (department_id, name, description) 
SELECT id, 'Operator', 'Оператор' FROM departments WHERE name = 'DD'
UNION ALL
SELECT id, 'Traffic-Dispatcher', 'Дорожный диспетчер' FROM departments WHERE name = 'DD';

-- ===== ИНДЕКСЫ =====

CREATE INDEX IF NOT EXISTS idx_ranks_department_id ON ranks(department_id);
CREATE INDEX IF NOT EXISTS idx_ranks_type ON ranks(type);
CREATE INDEX IF NOT EXISTS idx_ranks_order_index ON ranks(order_index);

CREATE INDEX IF NOT EXISTS idx_divisions_department_id ON divisions(department_id);

CREATE INDEX IF NOT EXISTS idx_qualifications_department_id ON qualifications(department_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_division_id ON qualifications(division_id);

CREATE INDEX IF NOT EXISTS idx_units_department_id ON units(department_id);

CREATE INDEX IF NOT EXISTS idx_characters_department_id ON characters(department_id);
CREATE INDEX IF NOT EXISTS idx_characters_rank_id ON characters(rank_id);
CREATE INDEX IF NOT EXISTS idx_characters_division_id ON characters(division_id);
CREATE INDEX IF NOT EXISTS idx_characters_unit_id ON characters(unit_id);
CREATE INDEX IF NOT EXISTS idx_characters_badge_number ON characters(badge_number);
CREATE INDEX IF NOT EXISTS idx_characters_employee_id ON characters(employee_id);
CREATE INDEX IF NOT EXISTS idx_characters_is_active ON characters(is_active);

CREATE INDEX IF NOT EXISTS idx_character_qualifications_character_id ON character_qualifications(character_id);
CREATE INDEX IF NOT EXISTS idx_character_qualifications_qualification_id ON character_qualifications(qualification_id);

CREATE INDEX IF NOT EXISTS idx_character_career_history_character_id ON character_career_history(character_id);
CREATE INDEX IF NOT EXISTS idx_character_career_history_department_id ON character_career_history(department_id);
CREATE INDEX IF NOT EXISTS idx_character_career_history_effective_date ON character_career_history(effective_date);

-- ===== ФУНКЦИИ =====

-- Функция для генерации номера жетона
CREATE OR REPLACE FUNCTION generate_badge_number(department_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_badge_number TEXT;
    counter INTEGER := 0;
    prefix TEXT;
BEGIN
    -- Определяем префикс на основе департамента
    IF department_name = 'PD' THEN
        prefix := 'PD';
    ELSIF department_name = 'SAHP' THEN
        prefix := 'SAHP';
    ELSIF department_name = 'SAMS' THEN
        prefix := 'SAMS';
    ELSIF department_name = 'SAFR' THEN
        prefix := 'SAFR';
    ELSIF department_name = 'DD' THEN
        prefix := 'DD';
    ELSIF department_name = 'CD' THEN
        prefix := 'CD';
    ELSE
        prefix := 'UNKNOWN';
    END IF;
    
    LOOP
        -- Генерируем номер жетона в формате PREFIX-XXXX
        new_badge_number := prefix || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        
        -- Проверяем уникальность только если таблица characters существует
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'characters') OR
           NOT EXISTS (SELECT 1 FROM characters WHERE badge_number = new_badge_number) THEN
            RETURN new_badge_number;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный номер жетона';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Функция для генерации ID сотрудника
CREATE OR REPLACE FUNCTION generate_employee_id(department_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_employee_id TEXT;
    counter INTEGER := 0;
    prefix TEXT;
BEGIN
    -- Определяем префикс на основе департамента
    IF department_name = 'PD' THEN
        prefix := 'PD';
    ELSIF department_name = 'SAHP' THEN
        prefix := 'SAHP';
    ELSIF department_name = 'SAMS' THEN
        prefix := 'SAMS';
    ELSIF department_name = 'SAFR' THEN
        prefix := 'SAFR';
    ELSIF department_name = 'DD' THEN
        prefix := 'DD';
    ELSIF department_name = 'CD' THEN
        prefix := 'CD';
    ELSE
        prefix := 'UNKNOWN';
    END IF;
    
    LOOP
        -- Генерируем ID сотрудника в формате PREFIX-YYYY-XXXXX
        new_employee_id := prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                          LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
        
        -- Проверяем уникальность только если таблица characters существует
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'characters') OR
           NOT EXISTS (SELECT 1 FROM characters WHERE employee_id = new_employee_id) THEN
            RETURN new_employee_id;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный ID сотрудника';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===== ТРИГГЕРЫ =====

-- Триггер для автоматического создания записи в истории карьеры при изменении департамента/звания
CREATE OR REPLACE FUNCTION update_career_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Если изменился департамент, звание, подразделение или юнит
    IF OLD.department_id IS DISTINCT FROM NEW.department_id OR
       OLD.rank_id IS DISTINCT FROM NEW.rank_id OR
       OLD.division_id IS DISTINCT FROM NEW.division_id OR
       OLD.unit_id IS DISTINCT FROM NEW.unit_id THEN
        
        -- Определяем тип действия
        DECLARE
            action_type TEXT;
        BEGIN
            IF OLD.department_id IS NULL AND NEW.department_id IS NOT NULL THEN
                action_type := 'hire';
            ELSIF OLD.department_id IS NOT NULL AND NEW.department_id IS NULL THEN
                action_type := 'termination';
            ELSIF OLD.rank_id IS DISTINCT FROM NEW.rank_id THEN
                action_type := 'promotion';
            ELSE
                action_type := 'transfer';
            END IF;
            
            -- Создаем запись в истории
            INSERT INTO character_career_history (
                character_id, department_id, rank_id, division_id, unit_id,
                action_type, effective_date
            ) VALUES (
                NEW.id, NEW.department_id, NEW.rank_id, NEW.division_id, NEW.unit_id,
                action_type, CURRENT_DATE
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_career_history
    AFTER UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_career_history();

-- ===== RLS ПОЛИТИКИ =====

-- Политики для таблицы ranks
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ranks" ON ranks
    FOR SELECT USING (true);

-- Добавляем политику для админов только если таблица users существует
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        EXECUTE 'CREATE POLICY "Admins can manage ranks" ON ranks
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.auth_id = auth.uid() 
                    AND users.role IN (''admin'', ''supervisor'')
                )
            )';
    ELSE
        EXECUTE 'CREATE POLICY "Anyone can manage ranks" ON ranks FOR ALL USING (true)';
    END IF;
END $$;

-- Политики для таблицы divisions
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Anyone can manage divisions" ON divisions FOR ALL USING (true);

-- Политики для таблицы qualifications
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read qualifications" ON qualifications FOR SELECT USING (true);
CREATE POLICY "Anyone can manage qualifications" ON qualifications FOR ALL USING (true);

-- Политики для таблицы units
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read units" ON units FOR SELECT USING (true);
CREATE POLICY "Anyone can manage units" ON units FOR ALL USING (true);

-- Политики для таблицы character_qualifications
ALTER TABLE character_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read character qualifications" ON character_qualifications FOR SELECT USING (true);
CREATE POLICY "Anyone can manage character qualifications" ON character_qualifications FOR ALL USING (true);

-- Политики для таблицы character_career_history
ALTER TABLE character_career_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read character career history" ON character_career_history FOR SELECT USING (true);
CREATE POLICY "Anyone can manage character career history" ON character_career_history FOR ALL USING (true); 