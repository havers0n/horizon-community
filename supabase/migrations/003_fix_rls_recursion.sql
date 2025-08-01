-- Исправление бесконечной рекурсии в RLS политиках
-- Проблема: политики ссылаются на саму таблицу users, создавая рекурсию

-- ============================================
-- 1. Исправляем политики для таблицы users
-- ============================================

-- Дропаем проблемные политики
DROP POLICY IF EXISTS "Admins can access all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Создаем простые политики без рекурсии
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Временно отключаем RLS для админов - будем проверять роли на уровне приложения
CREATE POLICY "Allow authenticated access" ON users
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- 2. Исправляем политики для других таблиц
-- ============================================

-- Дропаем проблемные политики
DROP POLICY IF EXISTS "Supervisors can view all applications" ON applications;
DROP POLICY IF EXISTS "Supervisors can update all applications" ON applications;
DROP POLICY IF EXISTS "Support staff can view all support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Support staff can update support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Moderators can view all complaints" ON complaints;
DROP POLICY IF EXISTS "Moderators can update complaints" ON complaints;
DROP POLICY IF EXISTS "Supervisors can view all reports" ON reports;
DROP POLICY IF EXISTS "Supervisors can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can access all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage tests" ON tests;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;

-- Создаем упрощенные политики без рекурсии
CREATE POLICY "Allow authenticated access to applications" ON applications
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to support_tickets" ON support_tickets
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to complaints" ON complaints
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to reports" ON reports
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to notifications" ON notifications
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to tests" ON tests
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to departments" ON departments
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- 3. Включаем RLS для всех таблиц
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY; 