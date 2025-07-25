SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."departments" ("id", "name", "full_name", "logo_url", "description", "gallery") VALUES
	(1, 'PD', 'Police Department', 'https://example.com/pd_logo.png', 'Полицейский департамент', '{}'),
	(2, 'SAHP', 'San Andreas Highway Patrol', 'https://example.com/sahp_logo.png', 'Патрульная служба шоссе Сан-Андреас', '{}'),
	(3, 'SAMS', 'San Andreas Medical Services', 'https://example.com/sams_logo.png', 'Медицинская служба Сан-Андреас', '{}'),
	(4, 'SAFR', 'San Andreas Fire & Rescue', 'https://example.com/safr_logo.png', 'Пожарная служба и спасение Сан-Андреас', '{}'),
	(5, 'DD', 'Dispatch Department', 'https://example.com/dd_logo.png', 'Департамент диспетчеризации', '{}'),
	(6, 'CD', 'Civilian Department', 'https://example.com/cd_logo.png', 'Гражданский департамент', '{}');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "username", "email", "password_hash", "role", "status", "department_id", "secondary_department_id", "rank", "division", "qualifications", "game_warnings", "admin_warnings", "created_at", "auth_id") VALUES
	(1, 'admin', 'admin@horizon.com', '$2b$10$example.hash.for.admin', 'admin', 'active', 1, NULL, 'Chief', 'Administration', '{leadership,management}', 0, 0, '2025-07-08 23:17:14.784223+00', NULL),
	(2, 'john_doe', 'john.doe@horizon.com', '$2b$10$example.hash.for.john', 'member', 'active', 1, NULL, 'Officer', 'Patrol', '{basic_training,firearms}', 0, 0, '2025-07-08 23:17:14.784223+00', NULL),
	(3, 'jane_smith', 'jane.smith@horizon.com', '$2b$10$example.hash.for.jane', 'member', 'active', 2, NULL, 'Firefighter', 'Rescue', '{basic_training,rescue_operations}', 0, 0, '2025-07-08 23:17:14.784223+00', NULL),
	(4, 'candidate_test', 'candidate@horizon.com', '$2b$10$example.hash.for.candidate', 'candidate', 'active', NULL, NULL, NULL, NULL, '{}', 0, 0, '2025-07-08 23:17:14.784223+00', NULL);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."applications" ("id", "author_id", "character_id", "type", "status", "data", "result", "reviewer_id", "review_comment", "status_history", "created_at", "updated_at") VALUES
	(1, 4, NULL, 'entry', 'pending', '{"age": 25, "lastName": "Candidate", "firstName": "Test", "experience": "No prior experience", "motivation": "Want to serve the community"}', NULL, NULL, NULL, '[{"date": "2024-01-15T10:00:00Z", "status": "pending", "comment": "Application submitted"}]', '2025-07-08 23:17:14.784223+00', '2025-07-08 23:17:14.784223+00'),
	(2, 2, NULL, 'promotion', 'approved', '{"currentRank": "Officer", "justification": "Excellent performance for 6 months", "requestedRank": "Senior Officer"}', NULL, NULL, NULL, '[{"date": "2024-01-10T10:00:00Z", "status": "pending", "comment": "Application submitted"}, {"date": "2024-01-12T14:00:00Z", "status": "approved", "comment": "Approved by supervisor", "reviewerId": 1}]', '2025-07-08 23:17:14.784223+00', '2025-07-08 23:17:14.784223+00');


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."complaints" ("id", "author_id", "status", "incident_date", "incident_type", "participants", "description", "evidence_url", "created_at") VALUES
	(1, 2, 'pending', '2024-01-14 20:00:00+00', 'game', 'john_doe, unknown_player', 'Player violated traffic rules during patrol', 'https://example.com/evidence1.mp4', '2025-07-08 23:17:14.784223+00'),
	(2, 3, 'resolved', '2024-01-13 18:00:00+00', 'admin', 'jane_smith, another_admin', 'Admin abuse during rescue operation', 'https://example.com/evidence2.mp4', '2025-07-08 23:17:14.784223+00');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."notifications" ("id", "recipient_id", "content", "link", "is_read", "created_at") VALUES
	(1, 2, 'Your promotion application has been approved', '/applications/2', false, '2025-07-08 23:17:14.784223+00'),
	(2, 4, 'Welcome to the department! Please complete your training', '/training', true, '2025-07-08 23:17:14.784223+00'),
	(3, 3, 'Your report has been approved by supervisor', '/reports/1', false, '2025-07-08 23:17:14.784223+00');


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reports" ("id", "author_id", "status", "file_url", "supervisor_comment", "created_at") VALUES
	(1, 2, 'approved', 'https://example.com/report1.pdf', 'Good detailed report', '2025-07-08 23:17:14.784223+00'),
	(2, 3, 'pending', 'https://example.com/report2.pdf', NULL, '2025-07-08 23:17:14.784223+00');


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."support_tickets" ("id", "author_id", "status", "handler_id", "messages", "created_at") VALUES
	(1, 2, 'open', 1, '[{"author": "john_doe", "message": "Having trouble accessing the department database", "timestamp": "2024-01-15T10:00:00Z"}, {"author": "admin", "message": "Can you provide more details about the error?", "timestamp": "2024-01-15T10:15:00Z"}]', '2025-07-08 23:17:14.784223+00'),
	(2, 4, 'closed', 1, '[{"author": "candidate_test", "message": "How long does application review take?", "timestamp": "2024-01-14T15:00:00Z"}, {"author": "admin", "message": "Typically 3-5 business days", "timestamp": "2024-01-14T15:30:00Z"}]', '2025-07-08 23:17:14.784223+00');


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tests" ("id", "title", "related_to", "duration_minutes", "questions") VALUES
	(1, 'Basic Police Training', '{"ranks": ["Officer"], "departments": [1]}', 30, '[{"correct": 3, "options": ["Enforce laws", "Help citizens", "Maintain order", "All of the above"], "question": "What is the primary duty of a police officer?"}, {"correct": 3, "options": ["When threatened", "When chasing suspect", "When protecting civilians", "Only when life is in danger"], "question": "When can you use a firearm?"}]'),
	(2, 'Fire Safety Basics', '{"ranks": ["Firefighter"], "departments": [2]}', 45, '[{"correct": 0, "options": ["Heat, Fuel, Oxygen", "Water, Foam, CO2", "Red, Orange, Yellow", "None of the above"], "question": "What is the fire triangle?"}, {"correct": 2, "options": ["Water", "Foam", "CO2", "Sand"], "question": "What type of fire extinguisher is used for electrical fires?"}]');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."applications_id_seq"', 2, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."complaints_id_seq"', 2, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."departments_id_seq"', 6, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."notifications_id_seq"', 3, true);


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reports_id_seq"', 2, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."support_tickets_id_seq"', 2, true);


--
-- Name: tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tests_id_seq"', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 4, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
