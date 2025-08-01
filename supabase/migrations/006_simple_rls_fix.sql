-- Простое исправление RLS политики для таблицы users
-- Разрешаем доступ всем авторизованным пользователям

-- Дропаем все существующие политики для таблицы users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated access" ON users;
DROP POLICY IF EXISTS "Admins can access all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Создаем простую политику: все авторизованные пользователи имеют доступ
CREATE POLICY "Allow authenticated" ON users
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Убеждаемся, что RLS включен
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 