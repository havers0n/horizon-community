-- Seed data for testing Supabase integration

-- Insert test departments
INSERT INTO departments (name, full_name, description, logo_url, gallery) VALUES
('LSPD', 'Los Santos Police Department', 'Полицейский департамент Лос-Сантоса', 'https://example.com/lspd_logo.png', '{}'),
('LSFD', 'Los Santos Fire Department', 'Пожарный департамент Лос-Сантоса', 'https://example.com/lsfd_logo.png', '{}'),
('LSMD', 'Los Santos Medical Department', 'Медицинский департамент Лос-Сантоса', 'https://example.com/lsmd_logo.png', '{}'),
('GOV', 'Government', 'Правительство Лос-Сантоса', 'https://example.com/gov_logo.png', '{}');

-- Insert test users
INSERT INTO users (username, email, password_hash, role, status, department_id, rank, division, qualifications, game_warnings, admin_warnings) VALUES
('admin', 'admin@horizon.com', '$2b$10$example.hash.for.admin', 'admin', 'active', 1, 'Chief', 'Administration', '{"leadership","management"}', 0, 0),
('john_doe', 'john.doe@horizon.com', '$2b$10$example.hash.for.john', 'member', 'active', 1, 'Officer', 'Patrol', '{"basic_training","firearms"}', 0, 0),
('jane_smith', 'jane.smith@horizon.com', '$2b$10$example.hash.for.jane', 'member', 'active', 2, 'Firefighter', 'Rescue', '{"basic_training","rescue_operations"}', 0, 0),
('candidate_test', 'candidate@horizon.com', '$2b$10$example.hash.for.candidate', 'candidate', 'active', NULL, NULL, NULL, '{}', 0, 0);

-- Insert test applications
INSERT INTO applications (author_id, type, status, data, status_history) VALUES
(4, 'entry', 'pending', '{"firstName":"Test","lastName":"Candidate","age":25,"experience":"No prior experience","motivation":"Want to serve the community"}', '[{"status":"pending","date":"2024-01-15T10:00:00Z","comment":"Application submitted"}]'),
(2, 'promotion', 'approved', '{"currentRank":"Officer","requestedRank":"Senior Officer","justification":"Excellent performance for 6 months"}', '[{"status":"pending","date":"2024-01-10T10:00:00Z","comment":"Application submitted"},{"status":"approved","date":"2024-01-12T14:00:00Z","comment":"Approved by supervisor","reviewerId":1}]');

-- Insert test support tickets
INSERT INTO support_tickets (author_id, status, handler_id, messages) VALUES
(2, 'open', 1, '[{"author":"john_doe","message":"Having trouble accessing the department database","timestamp":"2024-01-15T10:00:00Z"},{"author":"admin","message":"Can you provide more details about the error?","timestamp":"2024-01-15T10:15:00Z"}]'),
(4, 'closed', 1, '[{"author":"candidate_test","message":"How long does application review take?","timestamp":"2024-01-14T15:00:00Z"},{"author":"admin","message":"Typically 3-5 business days","timestamp":"2024-01-14T15:30:00Z"}]');

-- Insert test complaints
INSERT INTO complaints (author_id, status, incident_date, incident_type, participants, description, evidence_url) VALUES
(2, 'pending', '2024-01-14T20:00:00Z', 'game', 'john_doe, unknown_player', 'Player violated traffic rules during patrol', 'https://example.com/evidence1.mp4'),
(3, 'resolved', '2024-01-13T18:00:00Z', 'admin', 'jane_smith, another_admin', 'Admin abuse during rescue operation', 'https://example.com/evidence2.mp4');

-- Insert test reports
INSERT INTO reports (author_id, status, file_url, supervisor_comment) VALUES
(2, 'approved', 'https://example.com/report1.pdf', 'Good detailed report'),
(3, 'pending', 'https://example.com/report2.pdf', NULL);

-- Insert test notifications
INSERT INTO notifications (recipient_id, content, link, is_read) VALUES
(2, 'Your promotion application has been approved', '/applications/2', false),
(4, 'Welcome to the department! Please complete your training', '/training', true),
(3, 'Your report has been approved by supervisor', '/reports/1', false);

-- Insert test tests
INSERT INTO tests (title, related_to, duration_minutes, questions) VALUES
('Basic Police Training', '{"departments":[1],"ranks":["Officer"]}', 30, '[{"question":"What is the primary duty of a police officer?","options":["Enforce laws","Help citizens","Maintain order","All of the above"],"correct":3},{"question":"When can you use a firearm?","options":["When threatened","When chasing suspect","When protecting civilians","Only when life is in danger"],"correct":3}]'),
('Fire Safety Basics', '{"departments":[2],"ranks":["Firefighter"]}', 45, '[{"question":"What is the fire triangle?","options":["Heat, Fuel, Oxygen","Water, Foam, CO2","Red, Orange, Yellow","None of the above"],"correct":0},{"question":"What type of fire extinguisher is used for electrical fires?","options":["Water","Foam","CO2","Sand"],"correct":2}]');
