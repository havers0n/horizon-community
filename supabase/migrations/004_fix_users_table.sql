-- Исправление таблицы users для работы с Supabase Auth
-- Проблема: таблица users не имеет поля auth_id для связи с Supabase Auth

-- ============================================
-- 1. Создаем новую таблицу users с правильной структурой
-- ============================================

-- Дропаем старую таблицу users
DROP TABLE IF EXISTS "users" CASCADE;

-- Создаем новую таблицу users с поддержкой Supabase Auth
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "auth_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'candidate',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. Создаем индексы для производительности
-- ============================================

CREATE INDEX "users_auth_id_idx" ON "users" ("auth_id");
CREATE INDEX "users_email_idx" ON "users" ("email");
CREATE INDEX "users_username_idx" ON "users" ("username");
CREATE INDEX "users_role_idx" ON "users" ("role");

-- ============================================
-- 3. Создаем функцию для автоматического создания пользователя
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, email, username, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Создаем триггер для автоматического создания пользователя
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. Создаем простые RLS политики без рекурсии
-- ============================================

-- Включаем RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Дропаем старые политики если они есть
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated access" ON users;

-- Создаем простые политики
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Временно разрешаем доступ всем авторизованным пользователям
CREATE POLICY "Allow authenticated access" ON users
    FOR ALL USING (auth.uid() IS NOT NULL); 