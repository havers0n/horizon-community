-- Временное отключение RLS для таблицы users
-- Это позволит приложению работать, пока мы исправляем политики

-- Отключаем RLS для таблицы users
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;

-- Дропаем все политики для таблицы users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated access" ON users;
DROP POLICY IF EXISTS "Admins can access all users" ON users; 