-- Migration to apply RLS policies for 'candidate' users with 'guest' status

-- Disable ability to insert applications for candidates with guest status
CREATE POLICY "Restrict candidate guest from creating applications" ON "applications"
    FOR INSERT TO public
    USING (
        (SELECT role FROM users WHERE id = author_id) != 'candidate' 
        OR (SELECT status FROM users WHERE id = author_id) != 'guest'
    );

-- Disable ability to insert reports for candidates with guest status
CREATE POLICY "Restrict candidate guest from creating reports" ON "reports"
    FOR INSERT TO public
    USING (
        (SELECT role FROM users WHERE id = author_id) != 'candidate'
        OR (SELECT status FROM users WHERE id = author_id) != 'guest'
    );

-- Disable ability to insert complaints for candidates with guest status
CREATE POLICY "Restrict candidate guest from creating complaints" ON "complaints"
    FOR INSERT TO public
    USING (
        (SELECT role FROM users WHERE id = author_id) != 'candidate'
        OR (SELECT status FROM users WHERE id = author_id) != 'guest'
    );

-- Ensure candidates with guest status can read departments
CREATE POLICY "Allow candidates to read departments" ON "departments"
    FOR SELECT USING (true);

-- Restrict candidates from accessing other users' personal data
CREATE POLICY "Restrict access to other users data" ON "users"
    FOR SELECT
    USING (
        auth.uid() = auth_id OR (SELECT role FROM users WHERE id = users.id) != 'candidate'
    );

-- Allow candidates to update their own data
CREATE POLICY "Candidates can update own data" ON "users"
    FOR UPDATE
    USING (
        auth.uid() = auth_id 
        AND (SELECT role FROM users WHERE id = users.id) != 'guest'
    );
