-- Row Level Security Policies
-- Этот файл создает политики безопасности для каждой таблицы

-- ============================================
-- 1. Политики для таблицы users
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can access all users" ON users;

-- Создаем новые политики
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can access all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 2. Политики для таблицы applications
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can create applications" ON applications;
DROP POLICY IF EXISTS "Users can read own applications" ON applications;
DROP POLICY IF EXISTS "Admins can access all applications" ON applications;

-- Создаем новые политики
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Supervisors can view all applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('supervisor', 'admin')
        )
    );

CREATE POLICY "Users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Supervisors can update all applications" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('supervisor', 'admin')
        )
    );

-- ============================================
-- 3. Политики для таблицы support_tickets
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can create support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can read own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can access all support tickets" ON support_tickets;

-- Создаем новые политики
CREATE POLICY "Users can view their own support tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Support staff can view all support tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('support', 'admin')
        )
    );

CREATE POLICY "Users can create support tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Users can update their own support tickets" ON support_tickets
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Support staff can update support tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('support', 'admin')
        )
    );

-- ============================================
-- 4. Политики для таблицы complaints
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can create complaints" ON complaints;
DROP POLICY IF EXISTS "Users can read own complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can access all complaints" ON complaints;

-- Создаем новые политики
CREATE POLICY "Users can view their own complaints" ON complaints
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Moderators can view all complaints" ON complaints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('moderator', 'admin')
        )
    );

CREATE POLICY "Users can create complaints" ON complaints
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Users can update their own complaints" ON complaints
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Moderators can update complaints" ON complaints
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('moderator', 'admin')
        )
    );

-- ============================================
-- 5. Политики для таблицы reports
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can read own reports" ON reports;
DROP POLICY IF EXISTS "Admins can access all reports" ON reports;

-- Создаем новые политики
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Supervisors can view all reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('supervisor', 'admin')
        )
    );

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

CREATE POLICY "Supervisors can update reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role IN ('supervisor', 'admin')
        )
    );

-- ============================================
-- 6. Политики для таблицы notifications
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can access all notifications" ON notifications;

-- Создаем новые политики
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = recipient_id));

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = recipient_id));

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Система может создавать уведомления для любых пользователей

CREATE POLICY "Admins can access all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 7. Политики для таблицы tests
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Admins can access all tests" ON tests;

-- Создаем новые политики
CREATE POLICY "Users can view all tests" ON tests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid()
        )
    ); -- Авторизованные пользователи могут просматривать все тесты

CREATE POLICY "Admins can manage tests" ON tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- 8. Политики для таблицы departments
-- ============================================

-- Дропаем существующие политики если они есть
DROP POLICY IF EXISTS "Users can read departments" ON departments;

-- Создаем новые политики
CREATE POLICY "Users can view all departments" ON departments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid()
        )
    ); -- Авторизованные пользователи могут просматривать все департаменты

CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );
