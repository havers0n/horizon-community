-- RLS policies for restricting 'candidate' users with 'guest' status
-- This migration adds additional security policies to limit actions for guest candidates

-- First, let's drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can create applications" ON "applications";
DROP POLICY IF EXISTS "Users can create reports" ON "reports";
DROP POLICY IF EXISTS "Users can create complaints" ON "complaints";
DROP POLICY IF EXISTS "Users can create support tickets" ON "support_tickets";
DROP POLICY IF EXISTS "Users can read own data" ON "users";
DROP POLICY IF EXISTS "Users can update own data" ON "users";

-- Re-create policies with guest restrictions

-- Applications: Only non-guest users can create applications
CREATE POLICY "Non-guest users can create applications" ON "applications" 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'candidate' 
            AND status = 'guest'
        )
    );

-- Reports: Only non-guest users can create reports
CREATE POLICY "Non-guest users can create reports" ON "reports" 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'candidate' 
            AND status = 'guest'
        )
    );

-- Complaints: Only non-guest users can create complaints
CREATE POLICY "Non-guest users can create complaints" ON "complaints" 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'candidate' 
            AND status = 'guest'
        )
    );

-- Support tickets: Only non-guest users can create support tickets
CREATE POLICY "Non-guest users can create support tickets" ON "support_tickets" 
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'candidate' 
            AND status = 'guest'
        )
    );

-- Users table: Restrict access to personal data
-- Users can only see their own data, or data if they're not a candidate
CREATE POLICY "Users can read own data or non-candidate data" ON "users" 
    FOR SELECT USING (
        auth.uid() = auth_id 
        OR NOT EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_id = auth.uid() 
            AND u.role = 'candidate'
        )
    );

-- Users can update only their own data (and not if they're a guest)
CREATE POLICY "Non-guest users can update own data" ON "users" 
    FOR UPDATE USING (
        auth.uid() = auth_id 
        AND NOT EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND status = 'guest'
        )
    );

-- Notifications: Guest candidates can still read their notifications
-- (Keep existing policy for reading notifications)

-- Tests table: Add policy for candidates to read tests
CREATE POLICY "All users can read tests" ON "tests" 
    FOR SELECT USING (true);

-- Create function to check if current user is a guest candidate
CREATE OR REPLACE FUNCTION is_guest_candidate()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role = 'candidate' 
        AND status = 'guest'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the security model
COMMENT ON FUNCTION is_guest_candidate() IS 'Checks if the current authenticated user is a candidate with guest status';
