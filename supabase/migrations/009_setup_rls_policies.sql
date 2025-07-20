-- Настройка RLS политик для системы персонажей
-- Миграция 009: Setup RLS Policies

-- Политики для таблицы ranks
DROP POLICY IF EXISTS "Anyone can manage ranks" ON ranks;
DROP POLICY IF EXISTS "Admins can manage ranks" ON ranks;
CREATE POLICY "Admins can manage ranks" ON ranks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы divisions
DROP POLICY IF EXISTS "Anyone can manage divisions" ON divisions;
DROP POLICY IF EXISTS "Admins can manage divisions" ON divisions;
CREATE POLICY "Admins can manage divisions" ON divisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы qualifications
DROP POLICY IF EXISTS "Anyone can manage qualifications" ON qualifications;
DROP POLICY IF EXISTS "Admins can manage qualifications" ON qualifications;
CREATE POLICY "Admins can manage qualifications" ON qualifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы units
DROP POLICY IF EXISTS "Anyone can manage units" ON units;
DROP POLICY IF EXISTS "Admins can manage units" ON units;
CREATE POLICY "Admins can manage units" ON units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы character_qualifications
DROP POLICY IF EXISTS "Anyone can read character qualifications" ON character_qualifications;
DROP POLICY IF EXISTS "Anyone can manage character qualifications" ON character_qualifications;
DROP POLICY IF EXISTS "Users can read own character qualifications" ON character_qualifications;
DROP POLICY IF EXISTS "Admins can manage character qualifications" ON character_qualifications;

CREATE POLICY "Users can read own character qualifications" ON character_qualifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_qualifications.character_id 
            AND characters.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage character qualifications" ON character_qualifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы character_career_history
DROP POLICY IF EXISTS "Anyone can read character career history" ON character_career_history;
DROP POLICY IF EXISTS "Anyone can manage character career history" ON character_career_history;
DROP POLICY IF EXISTS "Users can read own character career history" ON character_career_history;
DROP POLICY IF EXISTS "Admins can read all career history" ON character_career_history;

CREATE POLICY "Users can read own character career history" ON character_career_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_career_history.character_id 
            AND characters.owner_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all career history" ON character_career_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для таблицы characters
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own characters" ON characters;
DROP POLICY IF EXISTS "Users can insert own characters" ON characters;
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;

CREATE POLICY "Users can read own characters" ON characters
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Users can insert own characters" ON characters
    FOR INSERT WITH CHECK (
        owner_id = auth.uid()
    );

CREATE POLICY "Users can update own characters" ON characters
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Users can delete own characters" ON characters
    FOR DELETE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    ); 