-- Миграция 019: Нормализация схемы персонажей
-- Разделение гражданских данных и служебных профилей офицеров

-- ===== СОЗДАНИЕ НОВОЙ НОРМАЛИЗОВАННОЙ СТРУКТУРЫ =====

-- 1. Обновляем таблицу common.characters - оставляем только гражданские данные
ALTER TABLE common.characters 
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS is_unit,
DROP COLUMN IF EXISTS unit_info,
DROP COLUMN IF EXISTS department_id,
DROP COLUMN IF EXISTS rank_id,
DROP COLUMN IF EXISTS division_id,
DROP COLUMN IF EXISTS unit_id,
DROP COLUMN IF EXISTS badge_number,
DROP COLUMN IF EXISTS employee_id,
DROP COLUMN IF EXISTS hire_date,
DROP COLUMN IF EXISTS termination_date,
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS callsign,
DROP COLUMN IF EXISTS callsign2,
DROP COLUMN IF EXISTS suspended,
DROP COLUMN IF EXISTS whitelist_status,
DROP COLUMN IF EXISTS radio_channel_id;

-- Добавляем недостающие гражданские поля
ALTER TABLE common.characters 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS surname TEXT,
ADD COLUMN IF NOT EXISTS dateOfBirth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phoneNumber TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS photoUrl TEXT,
ADD COLUMN IF NOT EXISTS ssn TEXT,
ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS addressFlags TEXT[] DEFAULT '{}';

-- 2. Создаем новую таблицу common.leo_profiles для служебных данных офицеров
CREATE TABLE IF NOT EXISTS common.leo_profiles (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES common.characters(id) ON DELETE CASCADE,
  badge_number TEXT UNIQUE,
  rank_id INTEGER,
  division_id INTEGER,
  department_id INTEGER REFERENCES common.departments(id),
  callsign TEXT,
  callsign2 TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  suspended BOOLEAN DEFAULT FALSE,
  whitelist_status TEXT,
  radio_channel_id TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(character_id)
);

-- 3. Создаем таблицу common.ems_profiles для будущего расширения
CREATE TABLE IF NOT EXISTS common.ems_profiles (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES common.characters(id) ON DELETE CASCADE,
  badge_number TEXT UNIQUE,
  rank_id INTEGER,
  division_id INTEGER,
  department_id INTEGER REFERENCES common.departments(id),
  callsign TEXT,
  callsign2 TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  suspended BOOLEAN DEFAULT FALSE,
  whitelist_status TEXT,
  radio_channel_id TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(character_id)
);

-- 4. Создаем таблицу common.fire_profiles для будущего расширения
CREATE TABLE IF NOT EXISTS common.fire_profiles (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES common.characters(id) ON DELETE CASCADE,
  badge_number TEXT UNIQUE,
  rank_id INTEGER,
  division_id INTEGER,
  department_id INTEGER REFERENCES common.departments(id),
  callsign TEXT,
  callsign2 TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
  hire_date DATE,
  termination_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  suspended BOOLEAN DEFAULT FALSE,
  whitelist_status TEXT,
  radio_channel_id TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(character_id)
);

-- ===== МИГРАЦИЯ СУЩЕСТВУЮЩИХ ДАННЫХ =====

-- Функция для миграции данных из старой структуры в новую
CREATE OR REPLACE FUNCTION migrate_character_data_to_normalized()
RETURNS void AS $$
DECLARE
  char_record RECORD;
  profile_id INTEGER;
BEGIN
  -- Проходим по всем персонажам
  FOR char_record IN SELECT * FROM common.characters LOOP
    
    -- Обновляем гражданские данные
    UPDATE common.characters 
    SET 
      name = COALESCE(name, first_name),
      surname = COALESCE(surname, last_name),
      dateOfBirth = COALESCE(dateOfBirth, dob),
      gender = COALESCE(gender, 'male'),
      address = COALESCE(address, char_record.address),
      phoneNumber = COALESCE(phoneNumber, 'Unknown Phone'),
      occupation = COALESCE(occupation, 'Unemployed'),
      photoUrl = COALESCE(photoUrl, mugshot_url),
      ssn = COALESCE(ssn, insurance_number)
    WHERE id = char_record.id;
    
    -- Если персонаж был офицером (type = 'leo'), создаем профиль LEO
    IF char_record.type = 'leo' AND char_record.department_id IS NOT NULL THEN
      INSERT INTO common.leo_profiles (
        character_id, badge_number, rank_id, division_id, department_id,
        callsign, callsign2, status, hire_date, termination_date,
        is_active, suspended, whitelist_status, radio_channel_id
      ) VALUES (
        char_record.id, char_record.badge_number, char_record.rank_id, 
        char_record.division_id, char_record.department_id,
        char_record.callsign, char_record.callsign2, 
        CASE 
          WHEN char_record.is_active = false THEN 'inactive'
          WHEN char_record.suspended = true THEN 'suspended'
          ELSE 'active'
        END,
        char_record.hire_date, char_record.termination_date,
        char_record.is_active, char_record.suspended,
        char_record.whitelist_status, char_record.radio_channel_id
      );
    END IF;
    
    -- Если персонаж был EMS (type = 'ems'), создаем профиль EMS
    IF char_record.type = 'ems' AND char_record.department_id IS NOT NULL THEN
      INSERT INTO common.ems_profiles (
        character_id, badge_number, rank_id, division_id, department_id,
        callsign, callsign2, status, hire_date, termination_date,
        is_active, suspended, whitelist_status, radio_channel_id
      ) VALUES (
        char_record.id, char_record.badge_number, char_record.rank_id, 
        char_record.division_id, char_record.department_id,
        char_record.callsign, char_record.callsign2, 
        CASE 
          WHEN char_record.is_active = false THEN 'inactive'
          WHEN char_record.suspended = true THEN 'suspended'
          ELSE 'active'
        END,
        char_record.hire_date, char_record.termination_date,
        char_record.is_active, char_record.suspended,
        char_record.whitelist_status, char_record.radio_channel_id
      );
    END IF;
    
    -- Если персонаж был пожарным (type = 'fire'), создаем профиль FIRE
    IF char_record.type = 'fire' AND char_record.department_id IS NOT NULL THEN
      INSERT INTO common.fire_profiles (
        character_id, badge_number, rank_id, division_id, department_id,
        callsign, callsign2, status, hire_date, termination_date,
        is_active, suspended, whitelist_status, radio_channel_id
      ) VALUES (
        char_record.id, char_record.badge_number, char_record.rank_id, 
        char_record.division_id, char_record.department_id,
        char_record.callsign, char_record.callsign2, 
        CASE 
          WHEN char_record.is_active = false THEN 'inactive'
          WHEN char_record.suspended = true THEN 'suspended'
          ELSE 'active'
        END,
        char_record.hire_date, char_record.termination_date,
        char_record.is_active, char_record.suspended,
        char_record.whitelist_status, char_record.radio_channel_id
      );
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Character data migration to normalized schema completed';
END;
$$ LANGUAGE plpgsql;

-- ===== СОЗДАНИЕ ИНДЕКСОВ =====

-- Индексы для common.characters
CREATE INDEX IF NOT EXISTS idx_characters_owner_id ON common.characters(owner_id);
CREATE INDEX IF NOT EXISTS idx_characters_name ON common.characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_surname ON common.characters(surname);
CREATE INDEX IF NOT EXISTS idx_characters_dateOfBirth ON common.characters(dateOfBirth);
CREATE INDEX IF NOT EXISTS idx_characters_gender ON common.characters(gender);
CREATE INDEX IF NOT EXISTS idx_characters_phoneNumber ON common.characters(phoneNumber);
CREATE INDEX IF NOT EXISTS idx_characters_ssn ON common.characters(ssn);

-- Индексы для common.leo_profiles
CREATE INDEX IF NOT EXISTS idx_leo_profiles_character_id ON common.leo_profiles(character_id);
CREATE INDEX IF NOT EXISTS idx_leo_profiles_badge_number ON common.leo_profiles(badge_number);
CREATE INDEX IF NOT EXISTS idx_leo_profiles_department_id ON common.leo_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_leo_profiles_rank_id ON common.leo_profiles(rank_id);
CREATE INDEX IF NOT EXISTS idx_leo_profiles_status ON common.leo_profiles(status);
CREATE INDEX IF NOT EXISTS idx_leo_profiles_is_active ON common.leo_profiles(is_active);

-- Индексы для common.ems_profiles
CREATE INDEX IF NOT EXISTS idx_ems_profiles_character_id ON common.ems_profiles(character_id);
CREATE INDEX IF NOT EXISTS idx_ems_profiles_badge_number ON common.ems_profiles(badge_number);
CREATE INDEX IF NOT EXISTS idx_ems_profiles_department_id ON common.ems_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_ems_profiles_status ON common.ems_profiles(status);

-- Индексы для common.fire_profiles
CREATE INDEX IF NOT EXISTS idx_fire_profiles_character_id ON common.fire_profiles(character_id);
CREATE INDEX IF NOT EXISTS idx_fire_profiles_badge_number ON common.fire_profiles(badge_number);
CREATE INDEX IF NOT EXISTS idx_fire_profiles_department_id ON common.fire_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_fire_profiles_status ON common.fire_profiles(status);

-- ===== RLS ПОЛИТИКИ =====

-- RLS для common.characters
ALTER TABLE common.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own characters" ON common.characters;
CREATE POLICY "Users can view own characters" ON common.characters
  FOR SELECT USING (auth.uid()::text = owner_id::text);

DROP POLICY IF EXISTS "Users can update own characters" ON common.characters;
CREATE POLICY "Users can update own characters" ON common.characters
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

DROP POLICY IF EXISTS "Users can insert own characters" ON common.characters;
CREATE POLICY "Users can insert own characters" ON common.characters
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- RLS для common.leo_profiles
ALTER TABLE common.leo_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leo profiles" ON common.leo_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.leo_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own leo profiles" ON common.leo_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.leo_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own leo profiles" ON common.leo_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.leo_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

-- RLS для common.ems_profiles
ALTER TABLE common.ems_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ems profiles" ON common.ems_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.ems_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own ems profiles" ON common.ems_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.ems_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own ems profiles" ON common.ems_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.ems_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

-- RLS для common.fire_profiles
ALTER TABLE common.fire_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fire profiles" ON common.fire_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.fire_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own fire profiles" ON common.fire_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.fire_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own fire profiles" ON common.fire_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM common.characters 
      WHERE id = common.fire_profiles.character_id 
      AND owner_id::text = auth.uid()::text
    )
  );

-- ===== ТРИГГЕРЫ ДЛЯ ОБНОВЛЕНИЯ TIMESTAMP =====

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для всех таблиц профилей
CREATE TRIGGER update_leo_profiles_updated_at 
  BEFORE UPDATE ON common.leo_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ems_profiles_updated_at 
  BEFORE UPDATE ON common.ems_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fire_profiles_updated_at 
  BEFORE UPDATE ON common.fire_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===== ВЫПОЛНЕНИЕ МИГРАЦИИ =====

-- Выполняем миграцию данных
SELECT migrate_character_data_to_normalized();

-- ===== СОЗДАНИЕ ВИДОВ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

-- Вид для получения полной информации о персонаже с профилями
CREATE OR REPLACE VIEW common.full_characters AS
SELECT 
  c.id,
  c.owner_id,
  c.name as first_name,
  c.surname as last_name,
  c.dateOfBirth as dob,
  c.gender,
  c.address,
  c.phoneNumber,
  c.occupation,
  c.photoUrl as mugshot_url,
  c.ssn as insurance_number,
  c.licenses,
  c.medical_info,
  c.flags,
  c.addressFlags,
  c.created_at,
  c.updated_at,
  -- LEO профиль
  lp.badge_number as leo_badge_number,
  lp.rank_id as leo_rank_id,
  lp.division_id as leo_division_id,
  lp.department_id as leo_department_id,
  lp.callsign as leo_callsign,
  lp.callsign2 as leo_callsign2,
  lp.status as leo_status,
  lp.hire_date as leo_hire_date,
  lp.termination_date as leo_termination_date,
  lp.is_active as leo_is_active,
  lp.suspended as leo_suspended,
  -- EMS профиль
  ep.badge_number as ems_badge_number,
  ep.rank_id as ems_rank_id,
  ep.division_id as ems_division_id,
  ep.department_id as ems_department_id,
  ep.callsign as ems_callsign,
  ep.callsign2 as ems_callsign2,
  ep.status as ems_status,
  ep.hire_date as ems_hire_date,
  ep.termination_date as ems_termination_date,
  ep.is_active as ems_is_active,
  ep.suspended as ems_suspended,
  -- FIRE профиль
  fp.badge_number as fire_badge_number,
  fp.rank_id as fire_rank_id,
  fp.division_id as fire_division_id,
  fp.department_id as fire_department_id,
  fp.callsign as fire_callsign,
  fp.callsign2 as fire_callsign2,
  fp.status as fire_status,
  fp.hire_date as fire_hire_date,
  fp.termination_date as fire_termination_date,
  fp.is_active as fire_is_active,
  fp.suspended as fire_suspended
FROM common.characters c
LEFT JOIN common.leo_profiles lp ON c.id = lp.character_id
LEFT JOIN common.ems_profiles ep ON c.id = ep.character_id
LEFT JOIN common.fire_profiles fp ON c.id = fp.character_id;

-- ===== ОЧИСТКА =====

-- Удаляем функцию миграции после выполнения
DROP FUNCTION IF EXISTS migrate_character_data_to_normalized();

-- Добавляем запись в лог миграции
INSERT INTO migration_log (migration_name, executed_at, status, details)
VALUES (
  '019_normalize_character_schema',
  NOW(),
  'completed',
  'Normalized character schema: separated civilian data and service profiles'
); 