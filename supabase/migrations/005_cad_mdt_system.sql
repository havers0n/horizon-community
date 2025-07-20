-- CAD/MDT System Migration
-- Добавление новых таблиц для системы Computer Aided Dispatch / Mobile Data Terminal

-- Добавляем поле cadToken в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS cad_token TEXT UNIQUE;

-- Создаем таблицу characters (игровые персонажи)
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу vehicles (транспортные средства)
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    plate TEXT NOT NULL UNIQUE,
    vin TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    color TEXT NOT NULL,
    registration TEXT NOT NULL DEFAULT 'valid' CHECK (registration IN ('valid', 'expired', 'stolen')),
    insurance TEXT NOT NULL DEFAULT 'valid' CHECK (insurance IN ('valid', 'expired')),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу weapons (оружие)
CREATE TABLE IF NOT EXISTS weapons (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    registration TEXT NOT NULL DEFAULT 'valid' CHECK (registration IN ('valid', 'expired')),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу pets (питомцы)
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    color TEXT NOT NULL,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу records (записи о нарушениях)
CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    officer_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('arrest', 'ticket', 'warning')),
    charges TEXT[] NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу call911 (вызовы 911)
CREATE TABLE IF NOT EXISTS call911 (
    id SERIAL PRIMARY KEY,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed')),
    type TEXT NOT NULL CHECK (type IN ('police', 'fire', 'ems')),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    caller_info JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу active_units (активные юниты на смене)
CREATE TABLE IF NOT EXISTS active_units (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT '10-8',
    callsign TEXT NOT NULL,
    location JSONB NOT NULL,
    partner_id INTEGER REFERENCES active_units(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_panic BOOLEAN NOT NULL DEFAULT false,
    last_update TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем таблицу call_attachments (привязка юнитов к вызовам)
CREATE TABLE IF NOT EXISTS call_attachments (
    id SERIAL PRIMARY KEY,
    call_id INTEGER NOT NULL REFERENCES call911(id) ON DELETE CASCADE,
    unit_id INTEGER NOT NULL REFERENCES active_units(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'en_route' CHECK (status IN ('en_route', 'on_scene', 'cleared')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_characters_owner_id ON characters(owner_id);
CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(type);
CREATE INDEX IF NOT EXISTS idx_characters_insurance_number ON characters(insurance_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_weapons_owner_id ON weapons(owner_id);
CREATE INDEX IF NOT EXISTS idx_weapons_serial_number ON weapons(serial_number);
CREATE INDEX IF NOT EXISTS idx_records_character_id ON records(character_id);
CREATE INDEX IF NOT EXISTS idx_records_officer_id ON records(officer_id);
CREATE INDEX IF NOT EXISTS idx_call911_status ON call911(status);
CREATE INDEX IF NOT EXISTS idx_call911_type ON call911(type);
CREATE INDEX IF NOT EXISTS idx_active_units_character_id ON active_units(character_id);
CREATE INDEX IF NOT EXISTS idx_active_units_department_id ON active_units(department_id);
CREATE INDEX IF NOT EXISTS idx_active_units_status ON active_units(status);
CREATE INDEX IF NOT EXISTS idx_call_attachments_call_id ON call_attachments(call_id);
CREATE INDEX IF NOT EXISTS idx_call_attachments_unit_id ON call_attachments(unit_id);

-- Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call911_updated_at BEFORE UPDATE ON call911
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для генерации уникального insurance_number
CREATE OR REPLACE FUNCTION generate_insurance_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Генерируем номер в формате INS-YYYY-XXXXX
        new_number := 'INS-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                     LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
        
        -- Проверяем уникальность
        IF NOT EXISTS (SELECT 1 FROM characters WHERE insurance_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный номер страховки';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для генерации уникального VIN
CREATE OR REPLACE FUNCTION generate_vin()
RETURNS TEXT AS $$
DECLARE
    new_vin TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Генерируем VIN в формате 17 символов
        new_vin := '';
        FOR i IN 1..17 LOOP
            new_vin := new_vin || CHR(65 + FLOOR(RANDOM() * 26)::INTEGER);
        END LOOP;
        
        -- Проверяем уникальность
        IF NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = new_vin) THEN
            RETURN new_vin;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный VIN';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для генерации уникального serial_number для оружия
CREATE OR REPLACE FUNCTION generate_weapon_serial()
RETURNS TEXT AS $$
DECLARE
    new_serial TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Генерируем серийный номер в формате WPN-XXXXX
        new_serial := 'WPN-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
        
        -- Проверяем уникальность
        IF NOT EXISTS (SELECT 1 FROM weapons WHERE serial_number = new_serial) THEN
            RETURN new_serial;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный серийный номер';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для генерации позывного
CREATE OR REPLACE FUNCTION generate_callsign(department_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_callsign TEXT;
    counter INTEGER := 0;
    prefix TEXT;
BEGIN
    -- Определяем префикс на основе департамента
    CASE department_name
        WHEN 'PD' THEN prefix := 'ADAM'
        WHEN 'SAHP' THEN prefix := 'MARY'
        WHEN 'SAMS' THEN prefix := 'ECHO'
        WHEN 'SAFR' THEN prefix := 'FOXTROT'
        WHEN 'DD' THEN prefix := 'DAVID'
        WHEN 'CD' THEN prefix := 'CIVIL'
        ELSE prefix := 'UNKNOWN'
    END CASE;
    
    LOOP
        -- Генерируем позывной в формате PREFIX-XX
        new_callsign := prefix || '-' || LPAD(FLOOR(RANDOM() * 99)::TEXT, 2, '0');
        
        -- Проверяем уникальность среди активных юнитов
        IF NOT EXISTS (SELECT 1 FROM active_units WHERE callsign = new_callsign) THEN
            RETURN new_callsign;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный позывной';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 