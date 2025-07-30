-- Миграция для MDT системы
-- Добавление недостающих таблиц для полноценной работы MDT

-- MDT Units (Юниты MDT)
CREATE TABLE mdt_units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  unit_number VARCHAR(10) NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'available',
  location JSONB,
  current_call_id INTEGER,
  partner_id INTEGER REFERENCES mdt_units(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  is_panic BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Calls 911 (Вызовы 911)
CREATE TABLE mdt_calls_911 (
  id SERIAL PRIMARY KEY,
  caller_name VARCHAR(100),
  caller_phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- police, fire, ems
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, closed
  assigned_units INTEGER[],
  patient_info JSONB,
  fire_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MDT Call Attachments (Привязка юнитов к вызовам)
CREATE TABLE mdt_call_attachments (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES mdt_calls_911(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES mdt_units(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'en_route', -- en_route, on_scene, cleared
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Signals (Сигналы)
CREATE TABLE mdt_signals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- LEO, EMS_FD
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  location VARCHAR(255),
  coordinates JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Signal Notifications (Уведомления о сигналах)
CREATE TABLE mdt_signal_notifications (
  id SERIAL PRIMARY KEY,
  signal_id INTEGER REFERENCES mdt_signals(id) ON DELETE CASCADE,
  recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Law Reports (Отчеты правоохранительных органов)
CREATE TABLE law_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  citizen_name VARCHAR(255) NOT NULL,
  incident_address VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  penal_code VARCHAR(50) NOT NULL,
  sanction_type VARCHAR(20) NOT NULL, -- warning, arrest, fine
  description TEXT NOT NULL,
  suspect_vehicle JSONB,
  seized_items TEXT[],
  suspect_weapon JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EMS/FD Reports (Отчеты EMS/FD)
CREATE TABLE ems_fd_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  call_id INTEGER REFERENCES mdt_calls_911(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- medical, fire, rescue
  patient_name VARCHAR(255),
  incident_location VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  treatment_provided TEXT,
  medications TEXT[],
  vital_signs JSONB,
  fire_details JSONB,
  outcome VARCHAR(255) NOT NULL,
  disposition VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impound Lots (Штрафстоянки)
CREATE TABLE impound_lots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  capacity INTEGER NOT NULL,
  current_vehicles INTEGER DEFAULT 0,
  manager VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impounded Vehicles (Конфискованные транспортные средства)
CREATE TABLE impounded_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  impound_lot_id INTEGER REFERENCES impound_lots(id) ON DELETE CASCADE,
  impound_date TIMESTAMP NOT NULL,
  impound_reason TEXT NOT NULL,
  impounding_officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  release_date TIMESTAMP,
  release_officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  release_reason TEXT,
  fees DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'impounded', -- impounded, released, destroyed
  notes TEXT,
  evidence BOOLEAN DEFAULT FALSE,
  stolen BOOLEAN DEFAULT FALSE,
  damage TEXT,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notebook Notes (Заметки офицеров)
CREATE TABLE notebook_notes (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- investigation, surveillance, arrest, warning, incident, other
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies (Компании)
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- corporation, llc, partnership
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company Employees (Сотрудники компаний)
CREATE TABLE company_employees (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cargo Shipments (Грузоперевозки)
CREATE TABLE cargo_shipments (
  id SERIAL PRIMARY KEY,
  cargo_type VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  weight_unit VARCHAR(10) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  driver_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_transit, delivered, cancelled
  estimated_delivery TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_mdt_units_character_id ON mdt_units(character_id);
CREATE INDEX idx_mdt_units_department_id ON mdt_units(department_id);
CREATE INDEX idx_mdt_units_status ON mdt_units(status);
CREATE INDEX idx_mdt_calls_911_type ON mdt_calls_911(type);
CREATE INDEX idx_mdt_calls_911_status ON mdt_calls_911(status);
CREATE INDEX idx_mdt_calls_911_created_at ON mdt_calls_911(created_at);
CREATE INDEX idx_mdt_signals_type ON mdt_signals(type);
CREATE INDEX idx_mdt_signals_is_active ON mdt_signals(is_active);
CREATE INDEX idx_mdt_signals_author_id ON mdt_signals(author_id);
CREATE INDEX idx_law_reports_author_id ON law_reports(author_id);
CREATE INDEX idx_law_reports_created_at ON law_reports(created_at);
CREATE INDEX idx_ems_fd_reports_author_id ON ems_fd_reports(author_id);
CREATE INDEX idx_ems_fd_reports_type ON ems_fd_reports(type);
CREATE INDEX idx_impounded_vehicles_vehicle_id ON impounded_vehicles(vehicle_id);
CREATE INDEX idx_impounded_vehicles_status ON impounded_vehicles(status);
CREATE INDEX idx_notebook_notes_author_id ON notebook_notes(author_id);
CREATE INDEX idx_notebook_notes_category ON notebook_notes(category);
CREATE INDEX idx_company_employees_company_id ON company_employees(company_id);
CREATE INDEX idx_company_employees_character_id ON company_employees(character_id);
CREATE INDEX idx_cargo_shipments_driver_id ON cargo_shipments(driver_id);
CREATE INDEX idx_cargo_shipments_status ON cargo_shipments(status);

-- Добавление RLS (Row Level Security) политик
ALTER TABLE mdt_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_calls_911 ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_call_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_signal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ems_fd_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE impound_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE impounded_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_shipments ENABLE ROW LEVEL SECURITY;

-- Базовые политики для чтения (все авторизованные пользователи могут читать)
CREATE POLICY "Allow read access for authenticated users" ON mdt_units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON mdt_calls_911 FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON mdt_call_attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON mdt_signals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON mdt_signal_notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON law_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON ems_fd_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON impound_lots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON impounded_vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON notebook_notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON company_employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON cargo_shipments FOR SELECT USING (auth.role() = 'authenticated');

-- Политики для записи (только авторы или администраторы)
CREATE POLICY "Allow insert for authenticated users" ON mdt_units FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON mdt_calls_911 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON mdt_call_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON mdt_signals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON mdt_signal_notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON law_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON ems_fd_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON impound_lots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON impounded_vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON notebook_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON company_employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users" ON cargo_shipments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политики для обновления (только авторы или администраторы)
CREATE POLICY "Allow update for authors or admins" ON mdt_units FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON mdt_calls_911 FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON mdt_call_attachments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON mdt_signals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON mdt_signal_notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON law_reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON ems_fd_reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON impound_lots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON impounded_vehicles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON notebook_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON companies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON company_employees FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authors or admins" ON cargo_shipments FOR UPDATE USING (auth.role() = 'authenticated');

-- Политики для удаления (только авторы или администраторы)
CREATE POLICY "Allow delete for authors or admins" ON mdt_units FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON mdt_calls_911 FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON mdt_call_attachments FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON mdt_signals FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON mdt_signal_notifications FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON law_reports FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON ems_fd_reports FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON impound_lots FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON impounded_vehicles FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON notebook_notes FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON companies FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON company_employees FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authors or admins" ON cargo_shipments FOR DELETE USING (auth.role() = 'authenticated');

-- Комментарии к таблицам
COMMENT ON TABLE mdt_units IS 'Юниты MDT системы для отслеживания активных офицеров';
COMMENT ON TABLE mdt_calls_911 IS 'Вызовы 911 для диспетчеризации';
COMMENT ON TABLE mdt_call_attachments IS 'Привязка юнитов к вызовам 911';
COMMENT ON TABLE mdt_signals IS 'Сигналы для экстренных служб';
COMMENT ON TABLE mdt_signal_notifications IS 'Уведомления о сигналах';
COMMENT ON TABLE law_reports IS 'Отчеты правоохранительных органов';
COMMENT ON TABLE ems_fd_reports IS 'Отчеты EMS/FD служб';
COMMENT ON TABLE impound_lots IS 'Штрафстоянки для конфискованных ТС';
COMMENT ON TABLE impounded_vehicles IS 'Конфискованные транспортные средства';
COMMENT ON TABLE notebook_notes IS 'Заметки офицеров';
COMMENT ON TABLE companies IS 'Компании в игровом мире';
COMMENT ON TABLE company_employees IS 'Сотрудники компаний';
COMMENT ON TABLE cargo_shipments IS 'Грузоперевозки'; 