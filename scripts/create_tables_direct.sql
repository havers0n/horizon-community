-- Создание схем
CREATE SCHEMA IF NOT EXISTS common;
CREATE SCHEMA IF NOT EXISTS mdt;

-- Создание таблицы departments в схеме common
CREATE TABLE IF NOT EXISTS common.departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[] DEFAULT '{}'
);

-- Создание таблицы characters в схеме common
CREATE TABLE IF NOT EXISTS common.characters (
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

-- Создание таблицы bolos в схеме mdt
CREATE TABLE IF NOT EXISTS mdt.bolos (
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

-- Создание таблицы units в схеме mdt
CREATE TABLE IF NOT EXISTS mdt.units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL,
  unit_number TEXT NOT NULL,
  department_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  is_panic BOOLEAN DEFAULT false,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавление диспетчерского департамента
INSERT INTO common.departments (name, full_name, description, logo_url, gallery)
VALUES (
  'Dispatch',
  'Диспетчерская служба',
  'Центр управления экстренными службами',
  'https://example.com/dispatch_logo.png',
  '{}'
) ON CONFLICT (name) DO NOTHING; 