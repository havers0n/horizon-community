-- Создание недостающих таблиц для MDT системы

-- Создание таблицы departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[] DEFAULT '{}'
);

-- Создание таблицы characters
CREATE TABLE IF NOT EXISTS characters (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department_id INTEGER,
  rank TEXT,
  status TEXT DEFAULT 'active',
  insurance_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы bolos
CREATE TABLE IF NOT EXISTS bolos (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  vehicle TEXT,
  plate TEXT,
  reason TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  location TEXT,
  issued_by TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы units
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL,
  unit_number TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  is_panic BOOLEAN DEFAULT false,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавление внешних ключей
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id);

ALTER TABLE characters ADD CONSTRAINT IF NOT EXISTS characters_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES users(id);

ALTER TABLE characters ADD CONSTRAINT IF NOT EXISTS characters_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id);

ALTER TABLE units ADD CONSTRAINT IF NOT EXISTS units_character_id_fkey 
  FOREIGN KEY (character_id) REFERENCES characters(id);

ALTER TABLE units ADD CONSTRAINT IF NOT EXISTS units_department_id_fkey 
  FOREIGN KEY (department_id) REFERENCES departments(id);

-- Добавление диспетчерского департамента
INSERT INTO departments (name, full_name, description, logo_url, gallery)
VALUES (
  'Dispatch',
  'Диспетчерская служба',
  'Центр управления экстренными службами',
  'https://example.com/dispatch_logo.png',
  '{}'
) ON CONFLICT (name) DO NOTHING; 