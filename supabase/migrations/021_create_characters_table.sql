-- Миграция 021: Создание таблицы characters в схеме public
-- Упрощенная версия для совместимости с гражданским порталом

-- Создаем таблицу characters в схеме public
CREATE TABLE IF NOT EXISTS public.characters (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL, -- ID пользователя (auth.uid())
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    ethnicity TEXT,
    height TEXT,
    weight TEXT,
    hair_color TEXT,
    eye_color TEXT,
    address TEXT,
    phone_number TEXT,
    postal TEXT,
    occupation TEXT,
    mugshot_url TEXT,
    licenses JSONB DEFAULT '{}',
    medical_info JSONB DEFAULT '{}',
    flags TEXT[] DEFAULT '{}',
    address_flags TEXT[] DEFAULT '{}',
    dead BOOLEAN DEFAULT false,
    missing BOOLEAN DEFAULT false,
    arrested BOOLEAN DEFAULT false,
    ssn TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_characters_owner_id ON public.characters(owner_id);
CREATE INDEX IF NOT EXISTS idx_characters_first_name ON public.characters(first_name);
CREATE INDEX IF NOT EXISTS idx_characters_last_name ON public.characters(last_name);
CREATE INDEX IF NOT EXISTS idx_characters_date_of_birth ON public.characters(date_of_birth);

-- Создаем RLS политики
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: пользователь может читать только своих персонажей
CREATE POLICY "Users can view own characters" ON public.characters
    FOR SELECT USING (auth.uid()::text = owner_id::text);

-- Политика для создания: пользователь может создавать персонажей для себя
CREATE POLICY "Users can create own characters" ON public.characters
    FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

-- Политика для обновления: пользователь может обновлять только своих персонажей
CREATE POLICY "Users can update own characters" ON public.characters
    FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- Политика для удаления: пользователь может удалять только своих персонажей
CREATE POLICY "Users can delete own characters" ON public.characters
    FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_characters_updated_at 
    BEFORE UPDATE ON public.characters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставляем тестовые данные (опционально)
INSERT INTO public.characters (
    owner_id, 
    first_name, 
    last_name, 
    date_of_birth, 
    gender, 
    address, 
    phone_number, 
    occupation
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Тестовый UUID
    'John',
    'Doe',
    '1990-01-01',
    'male',
    '123 Main St, Los Santos',
    '+1234567890',
    'Civilian'
) ON CONFLICT DO NOTHING; 