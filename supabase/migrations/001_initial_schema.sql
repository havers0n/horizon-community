-- Initial schema migration for RolePlayIdentity
-- Based on existing Drizzle schema

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'candidate',
    "status" TEXT NOT NULL DEFAULT 'active',
    "department_id" INTEGER,
    "secondary_department_id" INTEGER,
    "rank" TEXT,
    "division" TEXT,
    "qualifications" TEXT[] DEFAULT '{}',
    "game_warnings" INTEGER NOT NULL DEFAULT 0,
    "admin_warnings" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create departments table
CREATE TABLE IF NOT EXISTS "departments" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "gallery" TEXT[] DEFAULT '{}'
);

-- Create applications table
CREATE TABLE IF NOT EXISTS "applications" (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "character_id" INTEGER,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "data" JSONB NOT NULL,
    "result" JSONB,
    "reviewer_id" INTEGER,
    "review_comment" TEXT,
    "status_history" JSONB DEFAULT '[]' NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "handler_id" INTEGER,
    "messages" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS "complaints" (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "incident_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "incident_type" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create reports table
CREATE TABLE IF NOT EXISTS "reports" (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "file_url" TEXT NOT NULL,
    "supervisor_comment" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL PRIMARY KEY,
    "recipient_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create tests table
CREATE TABLE IF NOT EXISTS "tests" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "related_to" JSONB NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "questions" JSONB NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");
ALTER TABLE "users" ADD CONSTRAINT "users_secondary_department_id_fkey" FOREIGN KEY ("secondary_department_id") REFERENCES "departments"("id");

ALTER TABLE "applications" ADD CONSTRAINT "applications_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id");

ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_handler_id_fkey" FOREIGN KEY ("handler_id") REFERENCES "users"("id");

ALTER TABLE "complaints" ADD CONSTRAINT "complaints_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");

ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id");

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");
CREATE INDEX IF NOT EXISTS "users_department_id_idx" ON "users"("department_id");
CREATE INDEX IF NOT EXISTS "users_secondary_department_id_idx" ON "users"("secondary_department_id");

CREATE INDEX IF NOT EXISTS "applications_author_id_idx" ON "applications"("author_id");
CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications"("status");
CREATE INDEX IF NOT EXISTS "applications_type_idx" ON "applications"("type");

CREATE INDEX IF NOT EXISTS "support_tickets_author_id_idx" ON "support_tickets"("author_id");
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");

CREATE INDEX IF NOT EXISTS "complaints_author_id_idx" ON "complaints"("author_id");
CREATE INDEX IF NOT EXISTS "complaints_status_idx" ON "complaints"("status");

CREATE INDEX IF NOT EXISTS "reports_author_id_idx" ON "reports"("author_id");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports"("status");

CREATE INDEX IF NOT EXISTS "notifications_recipient_id_idx" ON "notifications"("recipient_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");

-- Add auth_id column to users table for Supabase auth integration
ALTER TABLE "users" ADD COLUMN "auth_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index for auth_id
CREATE UNIQUE INDEX IF NOT EXISTS "users_auth_id_idx" ON "users"("auth_id");

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "complaints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tests" ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON "users" 
    FOR SELECT USING (auth.uid() = auth_id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON "users" 
    FOR UPDATE USING (auth.uid() = auth_id);

-- Users can read all departments
CREATE POLICY "Users can read departments" ON "departments" 
    FOR SELECT USING (true);

-- Users can create applications
CREATE POLICY "Users can create applications" ON "applications" 
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can read their own applications
CREATE POLICY "Users can read own applications" ON "applications" 
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can create support tickets
CREATE POLICY "Users can create support tickets" ON "support_tickets" 
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can read their own support tickets
CREATE POLICY "Users can read own support tickets" ON "support_tickets" 
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can create complaints
CREATE POLICY "Users can create complaints" ON "complaints" 
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can read their own complaints
CREATE POLICY "Users can read own complaints" ON "complaints" 
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can create reports
CREATE POLICY "Users can create reports" ON "reports" 
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can read their own reports
CREATE POLICY "Users can read own reports" ON "reports" 
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = author_id));

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON "notifications" 
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = recipient_id));

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON "notifications" 
    FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM users WHERE id = recipient_id));

-- Admin policies (users with admin role can access all data)
CREATE POLICY "Admins can access all users" ON "users" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all applications" ON "applications" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all support tickets" ON "support_tickets" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all complaints" ON "complaints" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all reports" ON "reports" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all notifications" ON "notifications" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all tests" ON "tests" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );
