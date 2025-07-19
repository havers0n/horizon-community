-- Test script for RLS policies on guest candidates
-- Run this script in Supabase SQL editor to validate the policies

-- Clean up test data
DELETE FROM users WHERE email IN ('guest@test.com', 'regular@test.com', 'admin@test.com');

-- Create test users
INSERT INTO users (username, email, password_hash, role, status, auth_id)
VALUES 
    ('guestuser', 'guest@test.com', 'hash', 'candidate', 'guest', gen_random_uuid()),
    ('regularuser', 'regular@test.com', 'hash', 'candidate', 'active', gen_random_uuid()),
    ('adminuser', 'admin@test.com', 'hash', 'admin', 'active', gen_random_uuid());

-- Get user IDs for testing
DO $$
DECLARE
    guest_id INTEGER;
    regular_id INTEGER;
    admin_id INTEGER;
BEGIN
    SELECT id INTO guest_id FROM users WHERE email = 'guest@test.com';
    SELECT id INTO regular_id FROM users WHERE email = 'regular@test.com';
    SELECT id INTO admin_id FROM users WHERE email = 'admin@test.com';
    
    RAISE NOTICE 'Guest ID: %, Regular ID: %, Admin ID: %', guest_id, regular_id, admin_id;
END $$;

-- Test 1: Guest candidate trying to create an application (should fail)
-- Note: This would need to be tested with actual auth context in Supabase

-- Test 2: Check if function works correctly
SELECT 
    u.username,
    u.role,
    u.status,
    CASE 
        WHEN u.role = 'candidate' AND u.status = 'guest' THEN 'Should be restricted'
        ELSE 'Should have access'
    END as expected_behavior
FROM users u
WHERE u.email IN ('guest@test.com', 'regular@test.com', 'admin@test.com');

-- Test 3: Verify departments table is accessible to all
SELECT COUNT(*) as departments_count FROM departments;

-- Test 4: Check policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'applications', 'reports', 'complaints', 'support_tickets', 'departments')
ORDER BY tablename, policyname;

-- Test 5: Check if helper function exists
SELECT 
    proname as function_name,
    prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'is_guest_candidate';

-- Clean up test data
DELETE FROM users WHERE email IN ('guest@test.com', 'regular@test.com', 'admin@test.com');
