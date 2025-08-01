-- Миграция 018: Синхронизация с золотыми типами фронтенда
-- Обновление структуры таблиц для соответствия новым типам

-- ===== ОБНОВЛЕНИЕ ТАБЛИЦЫ CHARACTERS =====

-- Добавляем новые поля в таблицу characters
ALTER TABLE characters 
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

-- Переносим данные из старых полей в новые
UPDATE characters 
SET 
  name = first_name,
  surname = last_name,
  dateOfBirth = dob
WHERE name IS NULL OR surname IS NULL OR dateOfBirth IS NULL;

-- Устанавливаем значения по умолчанию для обязательных полей
UPDATE characters 
SET 
  gender = 'male',
  address = 'Unknown Address',
  phoneNumber = 'Unknown Phone'
WHERE gender IS NULL OR address IS NULL OR phoneNumber IS NULL;

-- ===== ОБНОВЛЕНИЕ ТАБЛИЦЫ VEHICLES =====

-- Добавляем недостающие поля в таблицу vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS registration TEXT,
ADD COLUMN IF NOT EXISTS insurance TEXT;

-- Переименовываем поле owner_id в ownerId для соответствия золотым типам
ALTER TABLE vehicles RENAME COLUMN owner_id TO ownerId;

-- Устанавливаем значения по умолчанию для новых полей
UPDATE vehicles 
SET 
  registration = 'valid',
  insurance = 'valid'
WHERE registration IS NULL OR insurance IS NULL;

-- ===== ОБНОВЛЕНИЕ ТАБЛИЦЫ MDT_CALLS_911 =====

-- Добавляем недостающие поля для соответствия типу Call911
ALTER TABLE mdt_calls_911 
ADD COLUMN IF NOT EXISTS caller TEXT,
ADD COLUMN IF NOT EXISTS priority_type TEXT DEFAULT 'medium';

-- Переносим данные из caller_name в caller
UPDATE mdt_calls_911 
SET caller = caller_name 
WHERE caller IS NULL AND caller_name IS NOT NULL;

-- Преобразуем числовой priority в текстовый
UPDATE mdt_calls_911 
SET priority_type = CASE 
  WHEN priority = 1 THEN 'low'
  WHEN priority = 2 THEN 'medium'
  WHEN priority = 3 THEN 'high'
  WHEN priority = 4 THEN 'critical'
  ELSE 'medium'
END;

-- ===== СОЗДАНИЕ ИНДЕКСОВ ДЛЯ НОВЫХ ПОЛЕЙ =====

-- Индексы для таблицы characters
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_surname ON characters(surname);
CREATE INDEX IF NOT EXISTS idx_characters_dateOfBirth ON characters(dateOfBirth);
CREATE INDEX IF NOT EXISTS idx_characters_gender ON characters(gender);
CREATE INDEX IF NOT EXISTS idx_characters_phoneNumber ON characters(phoneNumber);
CREATE INDEX IF NOT EXISTS idx_characters_ssn ON characters(ssn);

-- Индексы для таблицы vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_ownerId ON vehicles(ownerId);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance ON vehicles(insurance);

-- Индексы для таблицы mdt_calls_911
CREATE INDEX IF NOT EXISTS idx_mdt_calls_911_caller ON mdt_calls_911(caller);
CREATE INDEX IF NOT EXISTS idx_mdt_calls_911_priority_type ON mdt_calls_911(priority_type);

-- ===== ОБНОВЛЕНИЕ RLS ПОЛИТИК =====

-- Обновляем RLS политики для новых полей
DROP POLICY IF EXISTS "Users can view own characters" ON characters;
CREATE POLICY "Users can view own characters" ON characters
  FOR SELECT USING (auth.uid()::text = owner_id::text);

DROP POLICY IF EXISTS "Users can update own characters" ON characters;
CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- ===== СОЗДАНИЕ ФУНКЦИЙ ДЛЯ МИГРАЦИИ ДАННЫХ =====

-- Функция для миграции существующих данных
CREATE OR REPLACE FUNCTION migrate_character_data()
RETURNS void AS $$
BEGIN
  -- Миграция данных персонажей
  UPDATE characters 
  SET 
    name = COALESCE(name, first_name),
    surname = COALESCE(surname, last_name),
    dateOfBirth = COALESCE(dateOfBirth, dob),
    gender = COALESCE(gender, 'male'),
    address = COALESCE(address, 'Unknown Address'),
    phoneNumber = COALESCE(phoneNumber, 'Unknown Phone'),
    occupation = COALESCE(occupation, 'Unemployed'),
    photoUrl = COALESCE(photoUrl, mugshot_url),
    ssn = COALESCE(ssn, insurance_number)
  WHERE name IS NULL OR surname IS NULL OR dateOfBirth IS NULL;
  
  RAISE NOTICE 'Character data migration completed';
END;
$$ LANGUAGE plpgsql;

-- Функция для валидации данных после миграции
CREATE OR REPLACE FUNCTION validate_character_data()
RETURNS TABLE(character_id INTEGER, validation_errors TEXT[]) AS $$
DECLARE
  char_record RECORD;
  errors TEXT[];
BEGIN
  FOR char_record IN SELECT * FROM characters LOOP
    errors := ARRAY[]::TEXT[];
    
    -- Проверяем обязательные поля
    IF char_record.name IS NULL OR char_record.name = '' THEN
      errors := array_append(errors, 'name is required');
    END IF;
    
    IF char_record.surname IS NULL OR char_record.surname = '' THEN
      errors := array_append(errors, 'surname is required');
    END IF;
    
    IF char_record.dateOfBirth IS NULL THEN
      errors := array_append(errors, 'dateOfBirth is required');
    END IF;
    
    IF char_record.gender IS NULL OR char_record.gender = '' THEN
      errors := array_append(errors, 'gender is required');
    END IF;
    
    IF char_record.address IS NULL OR char_record.address = '' THEN
      errors := array_append(errors, 'address is required');
    END IF;
    
    IF char_record.phoneNumber IS NULL OR char_record.phoneNumber = '' THEN
      errors := array_append(errors, 'phoneNumber is required');
    END IF;
    
    -- Возвращаем ошибки если есть
    IF array_length(errors, 1) > 0 THEN
      character_id := char_record.id;
      validation_errors := errors;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===== ВЫПОЛНЕНИЕ МИГРАЦИИ =====

-- Выполняем миграцию данных
SELECT migrate_character_data();

-- Проверяем валидность данных после миграции
-- SELECT * FROM validate_character_data();

-- ===== СОЗДАНИЕ ВИДОВ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

-- Вид для обратной совместимости со старым форматом
CREATE OR REPLACE VIEW characters_legacy AS
SELECT 
  id,
  name as first_name,
  surname as last_name,
  dateOfBirth as dob,
  gender,
  address,
  phoneNumber,
  occupation,
  photoUrl as mugshot_url,
  ssn as insurance_number,
  flags,
  addressFlags,
  created_at,
  updated_at
FROM characters;

-- ===== ОБНОВЛЕНИЕ ТРИГГЕРОВ =====

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_characters_updated_at ON characters;
CREATE TRIGGER trigger_update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_characters_updated_at();

-- ===== ДОКУМЕНТАЦИЯ ИЗМЕНЕНИЙ =====

-- Создаем таблицу для отслеживания миграций
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'completed',
  details JSONB
);

-- Записываем информацию о миграции
INSERT INTO migration_log (migration_name, details) 
VALUES (
  '018_sync_with_golden_types',
  '{"description": "Sync database schema with frontend golden types", "changes": ["Updated characters table structure", "Updated vehicles table structure", "Updated mdt_calls_911 table structure", "Added indexes for new fields", "Created migration functions", "Added legacy compatibility views"]}'
);

-- ===== ФИНАЛЬНАЯ ПРОВЕРКА =====

-- Проверяем, что все новые поля добавлены
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Проверяем наличие новых полей в characters
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'name'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    RAISE EXCEPTION 'Migration failed: new columns not added to characters table';
  END IF;
  
  RAISE NOTICE 'Migration 018 completed successfully';
END $$; 