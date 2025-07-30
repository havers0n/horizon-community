-- Создание таблиц в схеме public

-- Таблица departments
CREATE TABLE IF NOT EXISTS public.departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  gallery TEXT[] DEFAULT '{}'
);

-- Таблица characters
CREATE TABLE IF NOT EXISTS public.characters (
  id SERIAL PRIMARY KEY,
  owner_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('civilian', 'leo', 'fire', 'ems')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  address TEXT NOT NULL,
  insurance_number TEXT NOT NULL UNIQUE,
  licenses JSONB NOT NULL DEFAULT '{}',
  medical_info JSONB NOT NULL DEFAULT '{}',
  mugshot_url TEXT,
  is_unit BOOLEAN NOT NULL DEFAULT FALSE,
  unit_info JSONB,
  department_id INTEGER REFERENCES public.departments(id),
  rank_id INTEGER,
  division_id INTEGER,
  unit_id INTEGER,
  badge_number TEXT,
  employee_id TEXT,
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица bolos
CREATE TABLE IF NOT EXISTS public.bolos (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  vehicle TEXT,
  plate TEXT,
  reason TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  location TEXT,
  issued_by TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Таблица units
CREATE TABLE IF NOT EXISTS public.units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER REFERENCES public.characters(id),
  unit_number VARCHAR NOT NULL,
  department_id INTEGER REFERENCES public.departments(id),
  status VARCHAR DEFAULT 'available',
  location JSONB,
  current_call_id INTEGER,
  partner_id INTEGER REFERENCES public.units(id),
  vehicle_id INTEGER,
  is_panic BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Вставка тестовых данных
INSERT INTO public.departments (id, name, full_name, description) VALUES
(1, 'LSPD', 'Los Santos Police Department', 'Департамент полиции Лос-Сантоса'),
(2, 'BCSO', 'Blaine County Sheriff\'s Office', 'Офис шерифа округа Блейн'),
(3, 'SAHP', 'San Andreas Highway Patrol', 'Дорожная полиция Сан-Андреас'),
(4, 'LSFD', 'Los Santos Fire Department', 'Пожарная служба Лос-Сантоса'),
(5, 'EMS', 'Emergency Medical Services', 'Служба скорой медицинской помощи'),
(6, 'Dispatch', 'Emergency Dispatch Center', 'Центр экстренной диспетчеризации')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bolos (type, description, vehicle, plate, reason, priority, location, issued_by, additional_info) VALUES
('vehicle', 'Красный спортивный автомобиль Ferrari', 'Ferrari F40', 'ABC123', 'Подозрение в ограблении банка', 'high', 'Downtown Los Santos', 'Dispatch-1', 'Водитель вооружен, опасен'),
('person', 'Подозрительный мужчина в черной одежде', NULL, NULL, 'Подозрение в краже', 'medium', 'Vinewood Hills', 'Dispatch-2', 'Рост 180см, темные волосы'),
('vehicle', 'Белый фургон без номеров', 'White Van', NULL, 'Подозрение в похищении', 'critical', 'Grove Street', 'Dispatch-1', 'Срочно! Похищен ребенок')
ON CONFLICT DO NOTHING;

INSERT INTO public.units (unit_number, department_id, status, location) VALUES
('DISPATCH-1', 6, 'available', '{"x": 100, "y": 200, "z": 30}'),
('DISPATCH-2', 6, 'available', '{"x": 150, "y": 250, "z": 30}'),
('LSPD-1', 1, 'on_call', '{"x": 200, "y": 300, "z": 30}'),
('BCSO-1', 2, 'available', '{"x": 250, "y": 350, "z": 30}')
ON CONFLICT DO NOTHING; 