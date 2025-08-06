

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "common";


ALTER SCHEMA "common" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "docs";


ALTER SCHEMA "docs" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "forum";


ALTER SCHEMA "forum" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "mdt";


ALTER SCHEMA "mdt" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "profile";


ALTER SCHEMA "profile" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "testchema";


ALTER SCHEMA "testchema" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "common"."vehicle_insurance_status" AS ENUM (
    'insured',
    'uninsured',
    'expired'
);


ALTER TYPE "common"."vehicle_insurance_status" OWNER TO "postgres";


CREATE TYPE "common"."vehicle_registration_status" AS ENUM (
    'registered',
    'unregistered',
    'expired',
    'stolen'
);


ALTER TYPE "common"."vehicle_registration_status" OWNER TO "postgres";


CREATE TYPE "common"."weapon_registration_status" AS ENUM (
    'registered',
    'unregistered',
    'confiscated'
);


ALTER TYPE "common"."weapon_registration_status" OWNER TO "postgres";


CREATE TYPE "mdt"."application_status" AS ENUM (
    'awaiting_interview',
    'awaiting_test',
    'awaiting_practice',
    'accepted',
    'rejected',
    'on_hold'
);


ALTER TYPE "mdt"."application_status" OWNER TO "postgres";


CREATE TYPE "mdt"."bolo_priority" AS ENUM (
    'low',
    'normal',
    'high'
);


ALTER TYPE "mdt"."bolo_priority" OWNER TO "postgres";


CREATE TYPE "mdt"."bolo_status" AS ENUM (
    'active',
    'inactive',
    'resolved'
);


ALTER TYPE "mdt"."bolo_status" OWNER TO "postgres";


CREATE TYPE "mdt"."bolo_type" AS ENUM (
    'person',
    'vehicle'
);


ALTER TYPE "mdt"."bolo_type" OWNER TO "postgres";


CREATE TYPE "mdt"."call_priority" AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE "mdt"."call_priority" OWNER TO "postgres";


CREATE TYPE "mdt"."call_status" AS ENUM (
    'pending',
    'assigned',
    'on_scene',
    'resolved',
    'cancelled'
);


ALTER TYPE "mdt"."call_status" OWNER TO "postgres";


CREATE TYPE "mdt"."call_type" AS ENUM (
    '911_police',
    '911_medical',
    '911_fire',
    'non_emergency'
);


ALTER TYPE "mdt"."call_type" OWNER TO "postgres";


CREATE TYPE "mdt"."complaint_status" AS ENUM (
    'open',
    'in_review',
    'resolved',
    'closed'
);


ALTER TYPE "mdt"."complaint_status" OWNER TO "postgres";


CREATE TYPE "mdt"."support_ticket_status" AS ENUM (
    'open',
    'in_progress',
    'closed'
);


ALTER TYPE "mdt"."support_ticket_status" OWNER TO "postgres";


CREATE TYPE "public"."bolo_with_author" AS (
	"id" "uuid",
	"type" "text",
	"reason" "text",
	"status" "text",
	"location" "text",
	"priority" "text",
	"created_at" timestamp with time zone,
	"subject_name" "text",
	"subject_description" "text",
	"vehicle_plate" "text",
	"vehicle_description" "text",
	"author_character_id" "uuid",
	"author_full_name" "text"
);


ALTER TYPE "public"."bolo_with_author" OWNER TO "postgres";


CREATE TYPE "public"."character_with_profile" AS (
	"id" "uuid",
	"owner_id" "uuid",
	"first_name" "text",
	"last_name" "text",
	"date_of_birth" "date",
	"gender" "text",
	"phone_number" "text",
	"address" "text",
	"occupation" "text",
	"ssn" "text",
	"licenses" "jsonb",
	"medical_info" "jsonb",
	"mugshot_url" "text",
	"flags" "text"[],
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"profile_id" "uuid",
	"profile_username" "text",
	"profile_email" "text",
	"profile_role" "text"
);


ALTER TYPE "public"."character_with_profile" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'citizen',
    'candidate',
    'staff',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_application"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.applications (
        type, author_user_id, author_character_id, data, status, status_history
    ) VALUES (
        p_data->>'type',
        (p_data->>'author_user_id')::UUID, -- ИСПРАВЛЕНО
        (p_data->>'author_character_id')::UUID, -- ИСПРАВЛЕНО
        p_data->'data',
        COALESCE(p_data->>'status', 'pending'),
        COALESCE(p_data->'status_history', '[]'::JSONB)
    ) RETURNING to_jsonb(mdt.applications.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating application: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_application"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_bolo"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.bolos (
        type, reason, subject_name, subject_description, vehicle_description, 
        vehicle_plate, location, priority, author_character_id, status
    ) VALUES (
        p_data->>'type',
        p_data->>'reason',
        p_data->>'subject_name',
        p_data->>'subject_description',
        p_data->>'vehicle_description',
        p_data->>'vehicle_plate',
        p_data->>'location',
        p_data->>'priority',
        (p_data->>'author_character_id')::UUID, -- ИСПРАВЛЕНО
        COALESCE(p_data->>'status', 'active')
    ) RETURNING to_jsonb(mdt.bolos.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating BOLO: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_bolo"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_call"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.calls (
        caller_name, caller_phone, location, description, type, priority, status, 
        patient_info, fire_info, attachments, assigned_units
    ) VALUES (
        p_data->>'caller_name',
        p_data->>'caller_phone',
        p_data->>'location',
        p_data->>'description',
        p_data->>'type',
        p_data->>'priority',
        COALESCE(p_data->>'status', 'pending'),
        p_data->'patient_info',
        p_data->'fire_info',
        p_data->'attachments',
        p_data->'assigned_units'
    ) RETURNING to_jsonb(mdt.calls.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating call: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_call"("p_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "common"."characters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "date_of_birth" "date",
    "gender" "text",
    "phone_number" "text",
    "address" "text",
    "occupation" "text",
    "ssn" "text",
    "licenses" "jsonb",
    "medical_info" "jsonb",
    "mugshot_url" "text",
    "flags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ethnicity" "text",
    "height" "text",
    "weight" "text",
    "hair_color" "text",
    "eye_color" "text",
    "postal" "text",
    "dead" boolean DEFAULT false,
    "missing" boolean DEFAULT false,
    "arrested" boolean DEFAULT false
);


ALTER TABLE "common"."characters" OWNER TO "postgres";


COMMENT ON TABLE "common"."characters" IS 'Основные данные об игровых персонажах';



COMMENT ON COLUMN "common"."characters"."id" IS 'Уникальный ID персонажа (UUID)';



COMMENT ON COLUMN "common"."characters"."user_id" IS 'ID владельца персонажа (ссылка на public.profiles)';



COMMENT ON COLUMN "common"."characters"."ssn" IS 'Уникальный номер социального страхования персонажа';



CREATE OR REPLACE FUNCTION "public"."create_new_character"("p_data" "jsonb") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$BEGIN
  RETURN QUERY INSERT INTO common.characters (
    user_id, first_name, last_name, date_of_birth, gender, phone_number,
    address, occupation, ssn, licenses, medical_info, mugshot_url, flags
  )
  VALUES (
    (p_data->>'user_id')::UUID, p_data->>'first_name', p_data->>'last_name', (p_data->>'date_of_birth')::DATE,
    p_data->>'gender', p_data->>'phone_number', p_data->>'address', p_data->>'occupation', p_data->>'ssn',
    p_data->'licenses', p_data->'medical_info', p_data->>'mugshot_url',
    (SELECT array_agg(value) FROM jsonb_array_elements_text(COALESCE(p_data->'flags', '[]'::jsonb)) AS t(value))
  )
  RETURNING *;
END;$$;


ALTER FUNCTION "public"."create_new_character"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_character"("p_first_name" "text", "p_last_name" "text", "p_date_of_birth" "date", "p_ssn" "text") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  new_character common.characters;
BEGIN
  INSERT INTO common.characters (user_id, first_name, last_name, date_of_birth, ssn)
  VALUES (auth.uid(), p_first_name, p_last_name, p_date_of_birth, p_ssn)
  RETURNING * INTO new_character;
  RETURN NEXT new_character;
END;$$;


ALTER FUNCTION "public"."create_new_character"("p_first_name" "text", "p_last_name" "text", "p_date_of_birth" "date", "p_ssn" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_ems_fd_report"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.ems_fd_reports (
        title, description, author_character_id, incident_location, incident_time,
        incident_type, patients, vital_signs, medications_administered,
        treatment_provided, outcome, fire_details, call_id
    ) VALUES (
        p_data->>'title',
        p_data->>'description',
        (p_data->>'author_character_id')::UUID, -- ИСПРАВЛЕНО
        p_data->>'incident_location',
        (p_data->>'incident_time')::TIMESTAMP,
        p_data->>'incident_type',
        p_data->'patients',
        p_data->'vital_signs',
        p_data->'medications_administered',
        p_data->>'treatment_provided',
        p_data->>'outcome',
        p_data->'fire_details',
        NULLIF(p_data->>'call_id', '')::UUID -- ИСПРАВЛЕНО и УЛУЧШЕНО
    ) RETURNING to_jsonb(mdt.ems_fd_reports.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating EMS/FD report: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_ems_fd_report"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_law_report"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.law_reports (
        title, description, author_character_id, incident_location, 
        incident_time, incident_type, participants, penal_codes, 
        seized_items, call_id
    ) VALUES (
        p_data->>'title',
        p_data->>'description',
        (p_data->>'author_character_id')::UUID, -- ИСПРАВЛЕНО
        p_data->>'incident_location',
        (p_data->>'incident_time')::TIMESTAMP,
        p_data->>'incident_type',
        p_data->'participants',
        p_data->'penal_codes',
        p_data->'seized_items',
        NULLIF(p_data->>'call_id', '')::UUID -- ИСПРАВЛЕНО и УЛУЧШЕНО
    ) RETURNING to_jsonb(mdt.law_reports.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating law report: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_law_report"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_notification"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.notifications (
        content, recipient_user_id, is_read, link
    ) VALUES (
        p_data->>'content',
        (p_data->>'recipient_user_id')::UUID, -- ИСПРАВЛЕНО
        COALESCE((p_data->>'is_read')::BOOLEAN, FALSE),
        p_data->>'link'
    ) RETURNING to_jsonb(mdt.notifications.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating notification: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_notification"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_signal"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.mdt_signals (
        title, description, type, author_character_id, priority, 
        location, coordinates, is_active, expires_at
    ) VALUES (
        p_data->>'title',
        p_data->>'description',
        p_data->>'type',
        (p_data->>'author_character_id')::UUID, -- ИСПРАВЛЕНО
        p_data->>'priority',
        p_data->>'location',
        p_data->'coordinates',
        COALESCE((p_data->>'is_active')::BOOLEAN, TRUE),
        (p_data->>'expires_at')::TIMESTAMP
    ) RETURNING to_jsonb(mdt.mdt_signals.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating signal: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_signal"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_unit_on_duty"("p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO mdt.units_on_duty (
        character_id, unit_number, department_id, status, 
        location, current_call_id, user_id
    ) VALUES (
        (p_data->>'character_id')::UUID, -- ИСПРАВЛЕНО
        p_data->>'unit_number',
        (p_data->>'department_id')::UUID, -- ИСПРАВЛЕНО
        COALESCE(p_data->>'status', 'available'),
        p_data->'location',
        NULLIF(p_data->>'current_call_id', '')::UUID, -- ИСПРАВЛЕНО и УЛУЧШЕНО
        (p_data->>'user_id')::UUID -- ИСПРАВЛЕНО
    ) RETURNING to_jsonb(mdt.units_on_duty.*) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error creating unit on duty: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_new_unit_on_duty"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_bolo"("p_bolo_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
    UPDATE mdt.bolos SET status = 'deleted' WHERE id = p_bolo_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error deleting BOLO: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."delete_bolo"("p_bolo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_call"("p_call_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
    UPDATE mdt.calls SET status = 'deleted', updated_at = NOW() WHERE id = p_call_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error deleting call: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."delete_call"("p_call_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_character"("p_character_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  DELETE FROM common.characters WHERE id = p_character_id;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_character"("p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_unit_on_duty"("p_unit_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
    DELETE FROM mdt.units_on_duty WHERE id = p_unit_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error deleting unit on duty: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."delete_unit_on_duty"("p_unit_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_badge_number"("department_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_badge_number TEXT;
    counter INTEGER := 0;
    prefix TEXT;
BEGIN
    -- Определяем префикс на основе департамента
    IF department_name = 'PD' THEN
        prefix := 'PD';
    ELSIF department_name = 'SAHP' THEN
        prefix := 'SAHP';
    ELSIF department_name = 'SAMS' THEN
        prefix := 'SAMS';
    ELSIF department_name = 'SAFR' THEN
        prefix := 'SAFR';
    ELSIF department_name = 'DD' THEN
        prefix := 'DD';
    ELSIF department_name = 'CD' THEN
        prefix := 'CD';
    ELSE
        prefix := 'UNKNOWN';
    END IF;
    
    LOOP
        -- Генерируем номер жетона в формате PREFIX-XXXX
        new_badge_number := prefix || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        
        -- Проверяем уникальность только если таблица characters существует
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'characters') OR
           NOT EXISTS (SELECT 1 FROM characters WHERE badge_number = new_badge_number) THEN
            RETURN new_badge_number;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный номер жетона';
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_badge_number"("department_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_employee_id"("department_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_employee_id TEXT;
    counter INTEGER := 0;
    prefix TEXT;
BEGIN
    -- Определяем префикс на основе департамента
    IF department_name = 'PD' THEN
        prefix := 'PD';
    ELSIF department_name = 'SAHP' THEN
        prefix := 'SAHP';
    ELSIF department_name = 'SAMS' THEN
        prefix := 'SAMS';
    ELSIF department_name = 'SAFR' THEN
        prefix := 'SAFR';
    ELSIF department_name = 'DD' THEN
        prefix := 'DD';
    ELSIF department_name = 'CD' THEN
        prefix := 'CD';
    ELSE
        prefix := 'UNKNOWN';
    END IF;
    
    LOOP
        -- Генерируем ID сотрудника в формате PREFIX-YYYY-XXXXX
        new_employee_id := prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                          LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
        
        -- Проверяем уникальность только если таблица characters существует
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'characters') OR
           NOT EXISTS (SELECT 1 FROM characters WHERE employee_id = new_employee_id) THEN
            RETURN new_employee_id;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Не удалось сгенерировать уникальный ID сотрудника';
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_employee_id"("department_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_bolos_with_author"() RETURNS SETOF "public"."bolo_with_author"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    b.id, b.type, b.reason, b.status, b.location, b.priority, b.created_at,
    b.subject_name, b.subject_description, b.vehicle_plate, b.vehicle_description,
    b.author_character_id, c.first_name || ' ' || c.last_name AS author_full_name
  FROM mdt.bolos AS b
  LEFT JOIN common.characters AS c ON b.author_character_id = c.id
  WHERE b.status = 'active'
  ORDER BY b.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_active_bolos_with_author"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."calls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "caller_name" "text",
    "caller_phone" "text",
    "location" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "mdt"."call_type" NOT NULL,
    "priority" "mdt"."call_priority" DEFAULT 'low'::"mdt"."call_priority",
    "status" "mdt"."call_status" DEFAULT 'pending'::"mdt"."call_status" NOT NULL,
    "assigned_units" "jsonb",
    "patient_info" "jsonb",
    "fire_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "attachments" "jsonb"
);


ALTER TABLE "mdt"."calls" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."calls" IS 'Вызовы службы 911';



COMMENT ON COLUMN "mdt"."calls"."attachments" IS 'Массив объектов с вложениями (ссылки на файлы, изображения)';



CREATE OR REPLACE FUNCTION "public"."get_active_calls"() RETURNS SETOF "mdt"."calls"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.calls WHERE status NOT IN ('closed', 'cancelled') ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_active_calls"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."mdt_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_character_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text",
    "priority" "text",
    "location" "text",
    "coordinates" "jsonb",
    "is_active" boolean DEFAULT true,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."mdt_signals" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_signals"() RETURNS SETOF "mdt"."mdt_signals"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.mdt_signals WHERE is_active = TRUE ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_active_signals"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."units_on_duty" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "character_id" "uuid" NOT NULL,
    "department_id" "uuid" NOT NULL,
    "unit_number" "text" NOT NULL,
    "status" "text" NOT NULL,
    "location" "jsonb",
    "current_call_id" "uuid",
    "last_update" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."units_on_duty" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."units_on_duty" IS 'Отслеживание юнитов на дежурстве';



CREATE OR REPLACE FUNCTION "public"."get_active_units"() RETURNS SETOF "mdt"."units_on_duty"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.units_on_duty WHERE status <> 'offline' ORDER BY last_update DESC; END; $$;


ALTER FUNCTION "public"."get_active_units"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_characters"("p_limit" integer DEFAULT 100, "p_offset" integer DEFAULT 0) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters ORDER BY created_at DESC LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_all_characters"("p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_departments"() RETURNS TABLE("id" "uuid", "name" "text", "full_name" "text", "logo_url" "text", "description" "text", "gallery" "text"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id, d.name, d.full_name, d.logo_url, d.description, d.gallery
  FROM common.departments d
  ORDER BY d.name;
END;
$$;


ALTER FUNCTION "public"."get_all_departments"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."bolos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_character_id" "uuid" NOT NULL,
    "subject_name" "text",
    "subject_description" "text",
    "vehicle_plate" "text",
    "vehicle_description" "text",
    "type" "mdt"."bolo_type" NOT NULL,
    "reason" "text" NOT NULL,
    "priority" "mdt"."bolo_priority" DEFAULT 'normal'::"mdt"."bolo_priority",
    "status" "mdt"."bolo_status" DEFAULT 'active'::"mdt"."bolo_status",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."bolos" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."bolos" IS 'Ориентировки (Be On The Lookout)';



CREATE OR REPLACE FUNCTION "public"."get_bolo_by_id"("p_bolo_id" "uuid") RETURNS SETOF "mdt"."bolos"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.bolos WHERE id = p_bolo_id; END; $$;


ALTER FUNCTION "public"."get_bolo_by_id"("p_bolo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bolos_by_author"("p_author_character_id" "uuid") RETURNS SETOF "mdt"."bolos"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.bolos WHERE author_character_id = p_author_character_id AND status <> 'deleted' ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_bolos_by_author"("p_author_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bolos_by_priority"("p_priority" "text") RETURNS SETOF "mdt"."bolos"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.bolos WHERE priority = p_priority AND status <> 'deleted' ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_bolos_by_priority"("p_priority" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bolos_by_type"("p_type" "text") RETURNS SETOF "mdt"."bolos"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.bolos WHERE type = p_type AND status <> 'deleted' ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_bolos_by_type"("p_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_call_by_id"("p_call_id" "uuid") RETURNS SETOF "mdt"."calls"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.calls WHERE id = p_call_id; END; $$;


ALTER FUNCTION "public"."get_call_by_id"("p_call_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_calls_by_status"("p_status" "text") RETURNS SETOF "mdt"."calls"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.calls WHERE status = p_status ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_calls_by_status"("p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_calls_by_type"("p_type" "text") RETURNS SETOF "mdt"."calls"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.calls WHERE type = p_type ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_calls_by_type"("p_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_by_id"("p_character_id" "uuid") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE id = p_character_id;
END;
$$;


ALTER FUNCTION "public"."get_character_by_id"("p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_count"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM common.characters);
END;
$$;


ALTER FUNCTION "public"."get_character_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_count_by_gender"("p_gender" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM common.characters WHERE gender = p_gender);
END;
$$;


ALTER FUNCTION "public"."get_character_count_by_gender"("p_gender" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_count_by_owner"("p_owner_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM common.characters WHERE owner_id = p_owner_id);
END;
$$;


ALTER FUNCTION "public"."get_character_count_by_owner"("p_owner_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_licenses"("p_character_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN (SELECT licenses FROM common.characters WHERE id = p_character_id);
END;
$$;


ALTER FUNCTION "public"."get_character_licenses"("p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_medical_info"("p_character_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN (SELECT medical_info FROM common.characters WHERE id = p_character_id);
END;
$$;


ALTER FUNCTION "public"."get_character_medical_info"("p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_character_with_profile"("p_character_id" "uuid") RETURNS SETOF "public"."character_with_profile"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT c.id, c.owner_id, c.first_name, c.last_name, c.date_of_birth, c.gender, c.phone_number, c.address, c.occupation, c.ssn, c.licenses, c.medical_info, c.mugshot_url, c.flags, c.created_at, c.updated_at, p.id as profile_id, p.username as profile_username, p.email as profile_email, p.role as profile_role
  FROM common.characters AS c LEFT JOIN public.profiles AS p ON c.owner_id = p.id WHERE c.id = p_character_id;
END;
$$;


ALTER FUNCTION "public"."get_character_with_profile"("p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_characters_by_age_range"("p_min_age" integer, "p_max_age" integer) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE date_of_birth IS NOT NULL AND EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN p_min_age AND p_max_age ORDER BY created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_characters_by_age_range"("p_min_age" integer, "p_max_age" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_characters_by_birth_month"("p_month" integer) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE EXTRACT(MONTH FROM date_of_birth) = p_month ORDER BY created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_characters_by_birth_month"("p_month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_characters_by_birth_year"("p_year" integer) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE EXTRACT(YEAR FROM date_of_birth) = p_year ORDER BY created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_characters_by_birth_year"("p_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_characters_with_filters"("p_owner_id" "uuid" DEFAULT NULL::"uuid", "p_gender" "text" DEFAULT NULL::"text", "p_occupation" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 100, "p_offset" integer DEFAULT 0) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM common.characters 
  WHERE (p_owner_id IS NULL OR owner_id = p_owner_id)
    AND (p_gender IS NULL OR gender = p_gender)
    AND (p_occupation IS NULL OR occupation = p_occupation)
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_characters_with_filters"("p_owner_id" "uuid", "p_gender" "text", "p_occupation" "text", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_characters_with_profiles"("p_owner_id" "uuid") RETURNS SETOF "public"."character_with_profile"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT c.id, c.owner_id, c.first_name, c.last_name, c.date_of_birth, c.gender, c.phone_number, c.address, c.occupation, c.ssn, c.licenses, c.medical_info, c.mugshot_url, c.flags, c.created_at, c.updated_at, p.id as profile_id, p.username as profile_username, p.email as profile_email, p.role as profile_role
  FROM common.characters AS c LEFT JOIN public.profiles AS p ON c.owner_id = p.id WHERE c.owner_id = p_owner_id ORDER BY c.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_characters_with_profiles"("p_owner_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_characters"() RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE owner_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_my_characters"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_characters"("p_user_id" "uuid") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE owner_id = p_user_id ORDER BY created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_my_characters"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_signal_by_id"("p_signal_id" "uuid") RETURNS SETOF "mdt"."mdt_signals"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.mdt_signals WHERE id = p_signal_id; END; $$;


ALTER FUNCTION "public"."get_signal_by_id"("p_signal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unit_by_id"("p_unit_id" "uuid") RETURNS SETOF "mdt"."units_on_duty"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.units_on_duty WHERE id = p_unit_id; END; $$;


ALTER FUNCTION "public"."get_unit_by_id"("p_unit_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_units_by_department"("p_department_id" "uuid") RETURNS SETOF "mdt"."units_on_duty"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.units_on_duty WHERE department_id = p_department_id ORDER BY last_update DESC; END; $$;


ALTER FUNCTION "public"."get_units_by_department"("p_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_units_by_status"("p_status" "text") RETURNS SETOF "mdt"."units_on_duty"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.units_on_duty WHERE status = p_status ORDER BY last_update DESC; END; $$;


ALTER FUNCTION "public"."get_units_by_status"("p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_units_by_user"("p_user_id" "uuid") RETURNS SETOF "mdt"."units_on_duty"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.units_on_duty WHERE user_id = p_user_id ORDER BY last_update DESC; END; $$;


ALTER FUNCTION "public"."get_units_by_user"("p_user_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "link" "text",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."notifications" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."notifications" IS 'Внутриигровые уведомления для пользователей';



COMMENT ON COLUMN "mdt"."notifications"."recipient_user_id" IS 'Пользователь-получатель уведомления';



COMMENT ON COLUMN "mdt"."notifications"."link" IS 'URL для действия по клику на уведомление';



CREATE OR REPLACE FUNCTION "public"."get_unread_notifications"("p_user_id" "uuid") RETURNS SETOF "mdt"."notifications"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.notifications WHERE recipient_user_id = p_user_id AND is_read = FALSE ORDER BY created_at DESC; END; $$;


ALTER FUNCTION "public"."get_unread_notifications"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") RETURNS SETOF "mdt"."notifications"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$ BEGIN RETURN QUERY SELECT * FROM mdt.notifications WHERE recipient_user_id = p_user_id ORDER BY created_at DESC LIMIT 50; END; $$;


ALTER FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_guest_candidate"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'candidate' 
        AND status = 'guest'
    );
END;
$$;


ALTER FUNCTION "public"."is_guest_candidate"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_guest_candidate"() IS 'Checks if the current authenticated user is a candidate with guest status';



CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
    UPDATE mdt.notifications SET is_read = TRUE WHERE id = p_notification_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error marking notification as read: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_character_data"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Миграция данных персонажей
  UPDATE characters 
  SET 
    name = COALESCE(name, first_name),
    surname = COALESCE(surname, last_name),
    dateOfBirth = COALESCE(dateOfBirth, dob),
    gender = COALESCE(gender, 'male'),
    address = COALESCE(address, 'Unknown Address'),
    phoneNumber = COALESCE(phoneNumber, 'Unknown Phone'),
    occupation = COALESCE(occupation, 'Unemployed'),
    photoUrl = COALESCE(photoUrl, mugshot_url),
    ssn = COALESCE(ssn, insurance_number)
  WHERE name IS NULL OR surname IS NULL OR dateOfBirth IS NULL;
  
  RAISE NOTICE 'Character data migration completed';
END;
$$;


ALTER FUNCTION "public"."migrate_character_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_signal"("p_signal_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
    UPDATE mdt.mdt_signals SET is_active = FALSE WHERE id = p_signal_id;
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error revoking signal: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."revoke_signal"("p_signal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_characters"("p_query" "text") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters 
  WHERE 
    first_name ILIKE ('%' || p_query || '%') OR 
    last_name ILIKE ('%' || p_query || '%');
END;
$$;


ALTER FUNCTION "public"."search_characters"("p_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_characters"("p_query" "text", "p_limit" integer DEFAULT 10) RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM common.characters WHERE first_name ILIKE '%' || p_query || '%' OR last_name ILIKE '%' || p_query || '%' OR ssn ILIKE '%' || p_query || '%' ORDER BY created_at DESC LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."search_characters"("p_query" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transfer_character_ownership"("p_character_id" "uuid", "p_new_owner_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Insufficient permissions: Only admins can transfer character ownership.';
  END IF;
  UPDATE common.characters SET owner_id = p_new_owner_id, updated_at = NOW() WHERE id = p_character_id;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."transfer_character_ownership"("p_character_id" "uuid", "p_new_owner_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_application"("p_application_id" "uuid", "p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE mdt.applications SET
        data = COALESCE(p_data->'data', data),
        status = COALESCE(p_data->>'status', status),
        status_history = COALESCE(p_data->'status_history', status_history),
        result = COALESCE(p_data->'result', result),
        review_comment = COALESCE(p_data->>'review_comment', review_comment),
        reviewer_character_id = COALESCE(NULLIF(p_data->>'reviewer_character_id', '')::UUID, reviewer_character_id), -- ИСПРАВЛЕНО и УЛУЧШЕНО
        updated_at = NOW()
    WHERE id = p_application_id
    RETURNING to_jsonb(mdt.applications.*) INTO v_result;
    IF NOT FOUND THEN RAISE EXCEPTION 'Application with id % not found', p_application_id; END IF;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error updating application: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."update_application"("p_application_id" "uuid", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_application_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_application_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_bolo"("p_bolo_id" "uuid", "p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE mdt.bolos SET
        type = COALESCE(p_data->>'type', type),
        reason = COALESCE(p_data->>'reason', reason),
        subject_name = COALESCE(p_data->>'subject_name', subject_name),
        subject_description = COALESCE(p_data->>'subject_description', subject_description),
        vehicle_description = COALESCE(p_data->>'vehicle_description', vehicle_description),
        vehicle_plate = COALESCE(p_data->>'vehicle_plate', vehicle_plate),
        location = COALESCE(p_data->>'location', location),
        priority = COALESCE(p_data->>'priority', priority),
        status = COALESCE(p_data->>'status', status)
    WHERE id = p_bolo_id
    RETURNING to_jsonb(mdt.bolos.*) INTO v_result;
    IF NOT FOUND THEN RAISE EXCEPTION 'BOLO with id % not found', p_bolo_id; END IF;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error updating BOLO: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."update_bolo"("p_bolo_id" "uuid", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_call"("p_call_id" "uuid", "p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE mdt.calls SET
        caller_name = COALESCE(p_data->>'caller_name', caller_name),
        caller_phone = COALESCE(p_data->>'caller_phone', caller_phone),
        location = COALESCE(p_data->>'location', location),
        description = COALESCE(p_data->>'description', description),
        type = COALESCE(p_data->>'type', type),
        priority = COALESCE(p_data->>'priority', priority),
        status = COALESCE(p_data->>'status', status),
        patient_info = COALESCE(p_data->'patient_info', patient_info),
        fire_info = COALESCE(p_data->'fire_info', fire_info),
        attachments = COALESCE(p_data->'attachments', attachments),
        assigned_units = COALESCE(p_data->'assigned_units', assigned_units),
        updated_at = NOW()
    WHERE id = p_call_id
    RETURNING to_jsonb(mdt.calls.*) INTO v_result;
    IF NOT FOUND THEN RAISE EXCEPTION 'Call with id % not found', p_call_id; END IF;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error updating call: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."update_call"("p_call_id" "uuid", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_career_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Если изменился департамент, звание, подразделение или юнит
    IF OLD.department_id IS DISTINCT FROM NEW.department_id OR
       OLD.rank_id IS DISTINCT FROM NEW.rank_id OR
       OLD.division_id IS DISTINCT FROM NEW.division_id OR
       OLD.unit_id IS DISTINCT FROM NEW.unit_id THEN
        
        -- Определяем тип действия
        DECLARE
            action_type TEXT;
        BEGIN
            IF OLD.department_id IS NULL AND NEW.department_id IS NOT NULL THEN
                action_type := 'hire';
            ELSIF OLD.department_id IS NOT NULL AND NEW.department_id IS NULL THEN
                action_type := 'termination';
            ELSIF OLD.rank_id IS DISTINCT FROM NEW.rank_id THEN
                action_type := 'promotion';
            ELSE
                action_type := 'transfer';
            END IF;
            
            -- Создаем запись в истории
            INSERT INTO character_career_history (
                character_id, department_id, rank_id, division_id, unit_id,
                action_type, effective_date
            ) VALUES (
                NEW.id, NEW.department_id, NEW.rank_id, NEW.division_id, NEW.unit_id,
                action_type, CURRENT_DATE
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_career_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_category_topic_counter"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_categories 
        SET topics_count = topics_count + 1,
            last_activity = NOW(),
            updated_at = NOW()
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_categories 
        SET topics_count = topics_count - 1,
            updated_at = NOW()
        WHERE id = OLD.category_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_category_topic_counter"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_character"("p_character_id" "uuid", "p_updates" "jsonb") RETURNS SETOF "common"."characters"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
BEGIN
  RETURN QUERY 
  UPDATE common.characters 
  SET 
    first_name = COALESCE(p_updates->>'first_name', first_name),
    last_name = COALESCE(p_updates->>'last_name', last_name),
    date_of_birth = COALESCE((p_updates->>'date_of_birth')::DATE, date_of_birth),
    gender = COALESCE(p_updates->>'gender', gender),
    phone_number = COALESCE(p_updates->>'phone_number', phone_number),
    address = COALESCE(p_updates->>'address', address),
    occupation = COALESCE(p_updates->>'occupation', occupation),
    ssn = COALESCE(p_updates->>'ssn', ssn),
    licenses = COALESCE(p_updates->'licenses', licenses),
    medical_info = COALESCE(p_updates->'medical_info', medical_info),
    mugshot_url = COALESCE(p_updates->>'mugshot_url', mugshot_url),
    flags = CASE WHEN p_updates ? 'flags' THEN (SELECT array_agg(value) FROM jsonb_array_elements_text(p_updates->'flags') AS t(value)) ELSE flags END,
    updated_at = NOW()
  WHERE id = p_character_id
  RETURNING *;
END;
$$;


ALTER FUNCTION "public"."update_character"("p_character_id" "uuid", "p_updates" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_character_licenses"("p_character_id" "uuid", "p_new_licenses" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
  updated_licenses JSONB;
BEGIN
  UPDATE common.characters 
  SET licenses = licenses || p_new_licenses, updated_at = NOW() 
  WHERE id = p_character_id 
  RETURNING licenses INTO updated_licenses;
  RETURN updated_licenses;
END;
$$;


ALTER FUNCTION "public"."update_character_licenses"("p_character_id" "uuid", "p_new_licenses" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_character_medical_info"("p_character_id" "uuid", "p_new_medical_info" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
  updated_medical_info JSONB;
BEGIN
  UPDATE common.characters 
  SET medical_info = medical_info || p_new_medical_info, updated_at = NOW() 
  WHERE id = p_character_id 
  RETURNING medical_info INTO updated_medical_info;
  RETURN updated_medical_info;
END;
$$;


ALTER FUNCTION "public"."update_character_medical_info"("p_character_id" "uuid", "p_new_medical_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_characters_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_characters_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_reaction_counter"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_posts 
        SET reactions_count = reactions_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_posts 
        SET reactions_count = reactions_count - 1,
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_reaction_counter"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_signal"("p_signal_id" "uuid", "p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE mdt.mdt_signals SET
        title = COALESCE(p_data->>'title', title),
        description = COALESCE(p_data->>'description', description),
        type = COALESCE(p_data->>'type', type),
        priority = COALESCE(p_data->>'priority', priority),
        location = COALESCE(p_data->>'location', location),
        coordinates = COALESCE(p_data->'coordinates', coordinates),
        is_active = COALESCE((p_data->>'is_active')::BOOLEAN, is_active),
        expires_at = COALESCE((p_data->>'expires_at')::TIMESTAMP, expires_at)
    WHERE id = p_signal_id
    RETURNING to_jsonb(mdt.mdt_signals.*) INTO v_result;
    IF NOT FOUND THEN RAISE EXCEPTION 'Signal with id % not found', p_signal_id; END IF;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error updating signal: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."update_signal"("p_signal_id" "uuid", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_topic_counters"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Увеличиваем счетчик сообщений в теме
        UPDATE forum_topics 
        SET replies_count = replies_count + 1,
            last_post_id = NEW.id,
            last_post_author_id = NEW.author_id,
            last_post_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.topic_id;
        
        -- Увеличиваем счетчик сообщений в категории
        UPDATE forum_categories 
        SET posts_count = posts_count + 1,
            last_activity = NOW(),
            updated_at = NOW()
        WHERE id = (SELECT category_id FROM forum_topics WHERE id = NEW.topic_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Уменьшаем счетчик сообщений в теме
        UPDATE forum_topics 
        SET replies_count = replies_count - 1,
            updated_at = NOW()
        WHERE id = OLD.topic_id;
        
        -- Уменьшаем счетчик сообщений в категории
        UPDATE forum_categories 
        SET posts_count = posts_count - 1,
            updated_at = NOW()
        WHERE id = (SELECT category_id FROM forum_topics WHERE id = OLD.topic_id);
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_topic_counters"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_unit_on_duty"("p_unit_id" "uuid", "p_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'common', 'mdt'
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    UPDATE mdt.units_on_duty SET
        unit_number = COALESCE(p_data->>'unit_number', unit_number),
        status = COALESCE(p_data->>'status', status),
        location = COALESCE(p_data->'location', location),
        current_call_id = COALESCE(NULLIF(p_data->>'current_call_id', '')::UUID, current_call_id), -- ИСПРАВЛЕНО и УЛУЧШЕНО
        last_update = NOW()
    WHERE id = p_unit_id
    RETURNING to_jsonb(mdt.units_on_duty.*) INTO v_result;
    IF NOT FOUND THEN RAISE EXCEPTION 'Unit with id % not found', p_unit_id; END IF;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'Error updating unit on duty: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."update_unit_on_duty"("p_unit_id" "uuid", "p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_character_data"() RETURNS TABLE("character_id" integer, "validation_errors" "text"[])
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  char_record RECORD;
  errors TEXT[];
BEGIN
  FOR char_record IN SELECT * FROM characters LOOP
    errors := ARRAY[]::TEXT[];
    
    -- Проверяем обязательные поля
    IF char_record.name IS NULL OR char_record.name = '' THEN
      errors := array_append(errors, 'name is required');
    END IF;
    
    IF char_record.surname IS NULL OR char_record.surname = '' THEN
      errors := array_append(errors, 'surname is required');
    END IF;
    
    IF char_record.dateOfBirth IS NULL THEN
      errors := array_append(errors, 'dateOfBirth is required');
    END IF;
    
    IF char_record.gender IS NULL OR char_record.gender = '' THEN
      errors := array_append(errors, 'gender is required');
    END IF;
    
    IF char_record.address IS NULL OR char_record.address = '' THEN
      errors := array_append(errors, 'address is required');
    END IF;
    
    IF char_record.phoneNumber IS NULL OR char_record.phoneNumber = '' THEN
      errors := array_append(errors, 'phoneNumber is required');
    END IF;
    
    -- Возвращаем ошибки если есть
    IF array_length(errors, 1) > 0 THEN
      character_id := char_record.id;
      validation_errors := errors;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."validate_character_data"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "common"."cargo_shipments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "driver_character_id" "uuid",
    "vehicle_id" "uuid",
    "cargo_type" "text" NOT NULL,
    "weight" numeric(10,2),
    "weight_unit" character varying(10),
    "origin" "text" NOT NULL,
    "destination" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "estimated_delivery" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."cargo_shipments" OWNER TO "postgres";


COMMENT ON TABLE "common"."cargo_shipments" IS 'Перевозки грузов';



COMMENT ON COLUMN "common"."cargo_shipments"."driver_character_id" IS 'Персонаж-водитель';



COMMENT ON COLUMN "common"."cargo_shipments"."vehicle_id" IS 'Транспортное средство для перевозки';



CREATE TABLE IF NOT EXISTS "common"."character_career_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "division_id" "uuid",
    "rank_id" "uuid",
    "unit_id" "uuid",
    "approved_by_character_id" "uuid",
    "action_type" "text" NOT NULL,
    "effective_date" "date" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."character_career_history" OWNER TO "postgres";


COMMENT ON TABLE "common"."character_career_history" IS 'История карьеры персонажей (приемы, увольнения, повышения)';



COMMENT ON COLUMN "common"."character_career_history"."character_id" IS 'Персонаж, чья это запись в истории';



COMMENT ON COLUMN "common"."character_career_history"."approved_by_character_id" IS 'Персонаж, который утвердил изменение';



COMMENT ON COLUMN "common"."character_career_history"."action_type" IS 'Тип события в карьере';



CREATE TABLE IF NOT EXISTS "common"."character_qualifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" "uuid" NOT NULL,
    "qualification_id" "uuid" NOT NULL,
    "issued_by_character_id" "uuid",
    "obtained_date" "date" NOT NULL,
    "expires_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."character_qualifications" OWNER TO "postgres";


COMMENT ON TABLE "common"."character_qualifications" IS 'Связь между персонажами и их квалификациями';



COMMENT ON COLUMN "common"."character_qualifications"."character_id" IS 'Персонаж, получивший квалификацию';



COMMENT ON COLUMN "common"."character_qualifications"."qualification_id" IS 'Полученная квалификация';



COMMENT ON COLUMN "common"."character_qualifications"."issued_by_character_id" IS 'Персонаж, который выдал/подтвердил квалификацию';



CREATE TABLE IF NOT EXISTS "common"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "industry" "text",
    "description" "text",
    "address" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."companies" OWNER TO "postgres";


COMMENT ON TABLE "common"."companies" IS 'Компании и организации, созданные игроками';



COMMENT ON COLUMN "common"."companies"."owner_id" IS 'Владелец компании (ссылка на public.profiles)';



CREATE TABLE IF NOT EXISTS "common"."company_employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "character_id" "uuid" NOT NULL,
    "position" "text",
    "salary" numeric(10,2),
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."company_employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "common"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "full_name" "text",
    "logo_url" "text",
    "description" "text",
    "gallery" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."departments" OWNER TO "postgres";


COMMENT ON TABLE "common"."departments" IS 'Справочник департаментов (LEO, EMS, etc.)';



COMMENT ON COLUMN "common"."departments"."id" IS 'Уникальный идентификатор департамента (UUID)';



COMMENT ON COLUMN "common"."departments"."name" IS 'Короткое название/аббревиатура (LSPD, BCSO)';



COMMENT ON COLUMN "common"."departments"."full_name" IS 'Полное наименование (Los Santos Police Department)';



CREATE TABLE IF NOT EXISTS "common"."divisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."divisions" OWNER TO "postgres";


COMMENT ON TABLE "common"."divisions" IS 'Подразделения внутри департаментов (e.g., Patrol Division, Detective Bureau)';



COMMENT ON COLUMN "common"."divisions"."department_id" IS 'Ссылка на родительский департамент в common.departments';



CREATE TABLE IF NOT EXISTS "common"."ems_profiles" (
    "id" "uuid" NOT NULL,
    "department_id" "uuid" NOT NULL,
    "division_id" "uuid",
    "rank_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."ems_profiles" OWNER TO "postgres";


COMMENT ON TABLE "common"."ems_profiles" IS 'Профили сотрудников EMS/FD, расширяет common.characters';



COMMENT ON COLUMN "common"."ems_profiles"."id" IS 'PK и FK к common.characters.id. Связь 1-к-1.';



COMMENT ON COLUMN "common"."ems_profiles"."status" IS 'Статус сотрудника (активен, в отпуске и т.д.)';



CREATE TABLE IF NOT EXISTS "common"."impound_lots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "capacity" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."impound_lots" OWNER TO "postgres";


COMMENT ON TABLE "common"."impound_lots" IS 'Справочник штрафстоянок';



COMMENT ON COLUMN "common"."impound_lots"."name" IS 'Уникальное название штрафстоянки';



CREATE TABLE IF NOT EXISTS "common"."impounded_vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "impound_lot_id" "uuid" NOT NULL,
    "impounding_officer_id" "uuid",
    "release_officer_id" "uuid",
    "impound_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "impound_reason" "text",
    "release_date" timestamp with time zone,
    "fees" numeric(10,2),
    "status" "text" DEFAULT 'impounded'::"text" NOT NULL,
    "notes" "text",
    "photos" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."impounded_vehicles" OWNER TO "postgres";


COMMENT ON TABLE "common"."impounded_vehicles" IS 'Записи об эвакуированных ТС';



COMMENT ON COLUMN "common"."impounded_vehicles"."vehicle_id" IS 'Эвакуированное транспортное средство';



COMMENT ON COLUMN "common"."impounded_vehicles"."impound_lot_id" IS 'Штрафстоянка, на которой находится ТС';



COMMENT ON COLUMN "common"."impounded_vehicles"."impounding_officer_id" IS 'Сотрудник, эвакуировавший ТС';



CREATE TABLE IF NOT EXISTS "common"."leo_profiles" (
    "id" "uuid" NOT NULL,
    "department_id" "uuid" NOT NULL,
    "division_id" "uuid",
    "rank_id" "uuid" NOT NULL,
    "badge_number" "text",
    "callsign" "text",
    "callsign2" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."leo_profiles" OWNER TO "postgres";


COMMENT ON TABLE "common"."leo_profiles" IS 'Профили сотрудников LEO, расширяет common.characters';



COMMENT ON COLUMN "common"."leo_profiles"."id" IS 'PK и FK к common.characters.id. Связь 1-к-1.';



COMMENT ON COLUMN "common"."leo_profiles"."department_id" IS 'Текущий департамент сотрудника';



COMMENT ON COLUMN "common"."leo_profiles"."division_id" IS 'Текущее подразделение сотрудника';



COMMENT ON COLUMN "common"."leo_profiles"."rank_id" IS 'Текущее звание сотрудника';



COMMENT ON COLUMN "common"."leo_profiles"."status" IS 'Статус сотрудника (активен, отстранен и т.д.)';



CREATE TABLE IF NOT EXISTS "common"."pets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "breed" "text",
    "color" "text",
    "medical_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."pets" OWNER TO "postgres";


COMMENT ON TABLE "common"."pets" IS 'Домашние животные, принадлежащие персонажам';



COMMENT ON COLUMN "common"."pets"."character_id" IS 'Владелец животного (ссылка на common.characters)';



CREATE TABLE IF NOT EXISTS "common"."qualifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "department_id" "uuid",
    "division_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."qualifications" OWNER TO "postgres";


COMMENT ON TABLE "common"."qualifications" IS 'Справочник всех доступных квалификаций и сертификаций';



COMMENT ON COLUMN "common"."qualifications"."name" IS 'Уникальное название квалификации (e.g., "Paramedic I")';



CREATE TABLE IF NOT EXISTS "common"."ranks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "order_index" smallint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."ranks" OWNER TO "postgres";


COMMENT ON TABLE "common"."ranks" IS 'Справочник званий внутри департаментов';



COMMENT ON COLUMN "common"."ranks"."department_id" IS 'Ссылка на департамент, к которому принадлежит звание';



COMMENT ON COLUMN "common"."ranks"."order_index" IS 'Числовой порядок для иерархии званий (0=самое низкое)';



CREATE TABLE IF NOT EXISTS "common"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."units" OWNER TO "postgres";


COMMENT ON TABLE "common"."units" IS 'Специализированные юниты/отделы внутри департаментов';



COMMENT ON COLUMN "common"."units"."department_id" IS 'Ссылка на родительский департамент';



CREATE TABLE IF NOT EXISTS "common"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" "uuid" NOT NULL,
    "plate" "text" NOT NULL,
    "vin" "text",
    "model" "text",
    "color" "text",
    "registration_status" "common"."vehicle_registration_status",
    "insurance_status" "common"."vehicle_insurance_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."vehicles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "common"."vehicles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "common"."vehicles_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "common"."weapons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "character_id" "uuid" NOT NULL,
    "serial_number" "text" NOT NULL,
    "model" "text" NOT NULL,
    "registration_status" "common"."weapon_registration_status" DEFAULT 'registered'::"common"."weapon_registration_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "common"."weapons" OWNER TO "postgres";


COMMENT ON TABLE "common"."weapons" IS 'Оружие, зарегистрированное на персонажей';



COMMENT ON COLUMN "common"."weapons"."character_id" IS 'Владелец оружия (ссылка на common.characters)';



COMMENT ON COLUMN "common"."weapons"."serial_number" IS 'Уникальный серийный номер оружия';



COMMENT ON COLUMN "common"."weapons"."registration_status" IS 'Статус регистрации оружия';



CREATE SEQUENCE IF NOT EXISTS "common"."weapons_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "common"."weapons_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "forum"."forum_categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "department_id" integer,
    "icon" "text",
    "color" "text",
    "order_index" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "topics_count" integer DEFAULT 0 NOT NULL,
    "posts_count" integer DEFAULT 0 NOT NULL,
    "last_activity" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_categories_id_seq" OWNED BY "forum"."forum_categories"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_posts" (
    "id" integer NOT NULL,
    "topic_id" integer NOT NULL,
    "author_id" integer NOT NULL,
    "parent_id" integer,
    "content" "text" NOT NULL,
    "is_edited" boolean DEFAULT false NOT NULL,
    "edited_at" timestamp without time zone,
    "edited_by" integer,
    "reactions_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_posts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_posts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_posts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_posts_id_seq" OWNED BY "forum"."forum_posts"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_reactions" (
    "id" integer NOT NULL,
    "post_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_reactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_reactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_reactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_reactions_id_seq" OWNED BY "forum"."forum_reactions"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_stats" (
    "id" integer NOT NULL,
    "total_topics" integer DEFAULT 0 NOT NULL,
    "total_posts" integer DEFAULT 0 NOT NULL,
    "total_members" integer DEFAULT 0 NOT NULL,
    "online_now" integer DEFAULT 0 NOT NULL,
    "last_update" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_stats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_stats_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_stats_id_seq" OWNED BY "forum"."forum_stats"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_subscriptions" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "topic_id" integer NOT NULL,
    "is_email_notification" boolean DEFAULT true NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_subscriptions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_subscriptions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_subscriptions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_subscriptions_id_seq" OWNED BY "forum"."forum_subscriptions"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_topics" (
    "id" integer NOT NULL,
    "category_id" integer NOT NULL,
    "author_id" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "is_locked" boolean DEFAULT false NOT NULL,
    "views_count" integer DEFAULT 0 NOT NULL,
    "replies_count" integer DEFAULT 0 NOT NULL,
    "last_post_id" integer,
    "last_post_author_id" integer,
    "last_post_at" timestamp without time zone,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_topics" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_topics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_topics_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_topics_id_seq" OWNED BY "forum"."forum_topics"."id";



CREATE TABLE IF NOT EXISTS "forum"."forum_views" (
    "id" integer NOT NULL,
    "topic_id" integer NOT NULL,
    "user_id" integer,
    "ip_address" "text",
    "user_agent" "text",
    "viewed_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "forum"."forum_views" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "forum"."forum_views_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "forum"."forum_views_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "forum"."forum_views_id_seq" OWNED BY "forum"."forum_views"."id";



CREATE TABLE IF NOT EXISTS "mdt"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "author_character_id" "uuid" NOT NULL,
    "reviewer_character_id" "uuid",
    "type" "text" NOT NULL,
    "status" "mdt"."application_status" DEFAULT 'awaiting_interview'::"mdt"."application_status" NOT NULL,
    "data" "jsonb",
    "result" "jsonb",
    "review_comment" "text",
    "status_history" "jsonb"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."applications" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."applications" IS 'Заявки от игроков (в академию, на лицензии и т.д.)';



COMMENT ON COLUMN "mdt"."applications"."author_user_id" IS 'Пользователь, который подал заявку';



COMMENT ON COLUMN "mdt"."applications"."author_character_id" IS 'Персонаж, от имени которого подана заявка';



COMMENT ON COLUMN "mdt"."applications"."reviewer_character_id" IS 'Персонаж, который рассмотрел заявку';



CREATE TABLE IF NOT EXISTS "mdt"."complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "author_character_id" "uuid",
    "title" "text" NOT NULL,
    "status" "mdt"."complaint_status" DEFAULT 'open'::"mdt"."complaint_status" NOT NULL,
    "incident_date" timestamp with time zone NOT NULL,
    "participants" "jsonb",
    "description" "text" NOT NULL,
    "evidence" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."complaints" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."complaints" IS 'Жалобы игроков на других игроков или ситуации';



COMMENT ON COLUMN "mdt"."complaints"."author_user_id" IS 'Пользователь, подавший жалобу';



COMMENT ON COLUMN "mdt"."complaints"."participants" IS 'JSONB массив с участниками инцидента';



CREATE TABLE IF NOT EXISTS "mdt"."ems_fd_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_character_id" "uuid" NOT NULL,
    "call_id" "uuid",
    "title" "text" NOT NULL,
    "incident_type" "text" NOT NULL,
    "incident_time" timestamp with time zone NOT NULL,
    "incident_location" "text" NOT NULL,
    "description" "text" NOT NULL,
    "patients" "jsonb",
    "treatment_provided" "text",
    "medications_administered" "jsonb",
    "vital_signs" "jsonb",
    "fire_details" "jsonb",
    "outcome" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."ems_fd_reports" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."ems_fd_reports" IS 'Рапорты сотрудников EMS / Fire Department';



COMMENT ON COLUMN "mdt"."ems_fd_reports"."author_character_id" IS 'Сотрудник, составивший рапорт';



CREATE TABLE IF NOT EXISTS "mdt"."law_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_character_id" "uuid" NOT NULL,
    "call_id" "uuid",
    "title" "text" NOT NULL,
    "incident_type" "text" NOT NULL,
    "incident_time" timestamp with time zone NOT NULL,
    "incident_location" "text" NOT NULL,
    "description" "text" NOT NULL,
    "penal_codes" "jsonb",
    "seized_items" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."law_reports" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."law_reports" IS 'Рапорты сотрудников правопорядка';



CREATE TABLE IF NOT EXISTS "mdt"."mdt_signal_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signal_id" "uuid" NOT NULL,
    "recipient_character_id" "uuid" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."mdt_signal_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."notebook_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_character_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "category" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."notebook_notes" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."notebook_notes" IS 'Личные заметки/блокноты сотрудников';



COMMENT ON COLUMN "mdt"."notebook_notes"."author_character_id" IS 'Персонаж-автор заметки';



CREATE TABLE IF NOT EXISTS "mdt"."report_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "character_id" "uuid" NOT NULL,
    "role_in_report" "text"
);


ALTER TABLE "mdt"."report_participants" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."report_participants" IS 'Связующая таблица для участников полицейских отчетов.';



COMMENT ON COLUMN "mdt"."report_participants"."report_id" IS 'Ссылка на отчет (mdt.law_reports).';



COMMENT ON COLUMN "mdt"."report_participants"."character_id" IS 'Ссылка на персонажа-участника (common.characters).';



COMMENT ON COLUMN "mdt"."report_participants"."role_in_report" IS 'Роль персонажа в инциденте (свидетель, пострадавший, подозреваемый).';



CREATE TABLE IF NOT EXISTS "mdt"."report_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid",
    "created_by_character_id" "uuid",
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "category" "text",
    "is_active" boolean DEFAULT true,
    "purpose" "text",
    "instructions" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."report_templates" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."report_templates" IS 'Шаблоны для создания рапортов';



COMMENT ON COLUMN "mdt"."report_templates"."department_id" IS 'Департамент, к которому привязан шаблон (NULL = для всех)';



COMMENT ON COLUMN "mdt"."report_templates"."created_by_character_id" IS 'Персонаж, создавший шаблон';



COMMENT ON COLUMN "mdt"."report_templates"."body" IS 'Текст шаблона, возможно с переменными для заполнения';



CREATE TABLE IF NOT EXISTS "mdt"."support_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_user_id" "uuid" NOT NULL,
    "handler_user_id" "uuid",
    "title" "text" NOT NULL,
    "status" "mdt"."support_ticket_status" DEFAULT 'open'::"mdt"."support_ticket_status" NOT NULL,
    "messages" "jsonb"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."support_tickets" OWNER TO "postgres";


COMMENT ON TABLE "mdt"."support_tickets" IS 'Тикеты в службу поддержки';



COMMENT ON COLUMN "mdt"."support_tickets"."author_user_id" IS 'Пользователь, создавший тикет';



COMMENT ON COLUMN "mdt"."support_tickets"."handler_user_id" IS 'Сотрудник поддержки, работающий над тикетом';



COMMENT ON COLUMN "mdt"."support_tickets"."messages" IS 'История переписки по тикету';



CREATE TABLE IF NOT EXISTS "mdt"."test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "test_id" "uuid" NOT NULL,
    "score" integer,
    "max_score" integer,
    "percentage" integer,
    "passed" boolean,
    "time_spent_seconds" integer,
    "answers" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "mdt"."test_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."test_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "test_id" "uuid" NOT NULL,
    "application_id" "uuid",
    "status" "text" NOT NULL,
    "start_time" timestamp with time zone DEFAULT "now"(),
    "end_time" timestamp with time zone
);


ALTER TABLE "mdt"."test_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "mdt"."tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer,
    "questions" "jsonb"
);


ALTER TABLE "mdt"."tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "category" "text",
    "points" integer
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."achievements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."achievements_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."active_units_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."active_units_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "rarity" "text"
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."badges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."badges_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."call911_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."call911_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."call_attachments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."call_attachments_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."filled_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."filled_reports_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."joint_positions_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "character_id" "uuid" NOT NULL,
    "primary_department_id" "uuid" NOT NULL,
    "secondary_department_id" "uuid" NOT NULL,
    "status" "text",
    "start_date" "date",
    "end_date" "date",
    "reason" "text",
    "approved_by_character_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."joint_positions_history" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."joint_positions_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."joint_positions_history_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."pets_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "username" "text",
    "role" "public"."user_role" DEFAULT 'citizen'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."records_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."records_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."report_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."report_templates_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_id" "uuid" NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_achievements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_achievements_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "awarded_by_user_id" "uuid",
    "awarded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_badges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_badges_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "user_id" "uuid" NOT NULL,
    "level" integer DEFAULT 1,
    "experience" integer DEFAULT 0,
    "last_activity" timestamp with time zone,
    "reputation" numeric(3,1) DEFAULT 5.0,
    "playtime_minutes" integer DEFAULT 0,
    "warnings_game" integer DEFAULT 0,
    "warnings_admin" integer DEFAULT 0
);


ALTER TABLE "public"."user_stats" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_stats"."reputation" IS 'User reputation score, e.g., 4.8 out of 5.0';



COMMENT ON COLUMN "public"."user_stats"."playtime_minutes" IS 'Total gameplay time in minutes';



COMMENT ON COLUMN "public"."user_stats"."warnings_game" IS 'Count of in-game rule violations';



COMMENT ON COLUMN "public"."user_stats"."warnings_admin" IS 'Count of administrative or community rule violations';



CREATE SEQUENCE IF NOT EXISTS "public"."user_stats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_stats_id_seq" OWNER TO "postgres";


ALTER TABLE ONLY "forum"."forum_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_posts" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_posts_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_reactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_reactions_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_stats" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_stats_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_subscriptions" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_subscriptions_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_topics" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_topics_id_seq"'::"regclass");



ALTER TABLE ONLY "forum"."forum_views" ALTER COLUMN "id" SET DEFAULT "nextval"('"forum"."forum_views_id_seq"'::"regclass");



ALTER TABLE ONLY "common"."cargo_shipments"
    ADD CONSTRAINT "cargo_shipments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."character_qualifications"
    ADD CONSTRAINT "character_qualifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."characters"
    ADD CONSTRAINT "characters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."characters"
    ADD CONSTRAINT "characters_ssn_key" UNIQUE ("ssn");



ALTER TABLE ONLY "common"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."company_employees"
    ADD CONSTRAINT "company_employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."divisions"
    ADD CONSTRAINT "divisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."ems_profiles"
    ADD CONSTRAINT "ems_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."impound_lots"
    ADD CONSTRAINT "impound_lots_name_key" UNIQUE ("name");



ALTER TABLE ONLY "common"."impound_lots"
    ADD CONSTRAINT "impound_lots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."impounded_vehicles"
    ADD CONSTRAINT "impounded_vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_badge_number_key" UNIQUE ("badge_number");



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."pets"
    ADD CONSTRAINT "pets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."qualifications"
    ADD CONSTRAINT "qualifications_name_key" UNIQUE ("name");



ALTER TABLE ONLY "common"."qualifications"
    ADD CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."ranks"
    ADD CONSTRAINT "ranks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."vehicles"
    ADD CONSTRAINT "vehicles_plate_key" UNIQUE ("plate");



ALTER TABLE ONLY "common"."vehicles"
    ADD CONSTRAINT "vehicles_vin_key" UNIQUE ("vin");



ALTER TABLE ONLY "common"."weapons"
    ADD CONSTRAINT "weapons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "common"."weapons"
    ADD CONSTRAINT "weapons_serial_number_key" UNIQUE ("serial_number");



ALTER TABLE ONLY "forum"."forum_categories"
    ADD CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_posts"
    ADD CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_reactions"
    ADD CONSTRAINT "forum_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_reactions"
    ADD CONSTRAINT "forum_reactions_post_id_user_id_reaction_type_key" UNIQUE ("post_id", "user_id", "reaction_type");



ALTER TABLE ONLY "forum"."forum_stats"
    ADD CONSTRAINT "forum_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_subscriptions"
    ADD CONSTRAINT "forum_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_subscriptions"
    ADD CONSTRAINT "forum_subscriptions_user_id_topic_id_key" UNIQUE ("user_id", "topic_id");



ALTER TABLE ONLY "forum"."forum_topics"
    ADD CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "forum"."forum_views"
    ADD CONSTRAINT "forum_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."bolos"
    ADD CONSTRAINT "bolos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."calls"
    ADD CONSTRAINT "calls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."complaints"
    ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."ems_fd_reports"
    ADD CONSTRAINT "ems_fd_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."law_reports"
    ADD CONSTRAINT "law_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."mdt_signal_notifications"
    ADD CONSTRAINT "mdt_signal_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."mdt_signals"
    ADD CONSTRAINT "mdt_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."notebook_notes"
    ADD CONSTRAINT "notebook_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."report_participants"
    ADD CONSTRAINT "report_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."report_templates"
    ADD CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."test_results"
    ADD CONSTRAINT "test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."test_sessions"
    ADD CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."tests"
    ADD CONSTRAINT "tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."units_on_duty"
    ADD CONSTRAINT "units_on_duty_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "mdt"."report_participants"
    ADD CONSTRAINT "uq_report_character" UNIQUE ("report_id", "character_id");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_achievement_id_key" UNIQUE ("user_id", "achievement_id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_cargo_shipments_driver_character_id" ON "common"."cargo_shipments" USING "btree" ("driver_character_id");



CREATE INDEX "idx_cargo_shipments_status" ON "common"."cargo_shipments" USING "btree" ("status");



CREATE INDEX "idx_cargo_shipments_vehicle_id" ON "common"."cargo_shipments" USING "btree" ("vehicle_id");



CREATE INDEX "idx_character_career_history_character_id" ON "common"."character_career_history" USING "btree" ("character_id");



CREATE INDEX "idx_character_career_history_department_id" ON "common"."character_career_history" USING "btree" ("department_id");



CREATE INDEX "idx_character_career_history_rank_id" ON "common"."character_career_history" USING "btree" ("rank_id");



CREATE INDEX "idx_character_qualifications_character_id" ON "common"."character_qualifications" USING "btree" ("character_id");



CREATE INDEX "idx_character_qualifications_qualification_id" ON "common"."character_qualifications" USING "btree" ("qualification_id");



CREATE UNIQUE INDEX "idx_character_qualifications_unique" ON "common"."character_qualifications" USING "btree" ("character_id", "qualification_id");



CREATE INDEX "idx_characters_name_search" ON "common"."characters" USING "btree" ("first_name", "last_name");



CREATE INDEX "idx_characters_owner_id" ON "common"."characters" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_companies_name_unique" ON "common"."companies" USING "btree" ("name");



CREATE INDEX "idx_companies_owner_id" ON "common"."companies" USING "btree" ("owner_id");



CREATE INDEX "idx_company_employees_character_id" ON "common"."company_employees" USING "btree" ("character_id");



CREATE INDEX "idx_company_employees_company_id" ON "common"."company_employees" USING "btree" ("company_id");



CREATE UNIQUE INDEX "idx_departments_name_unique" ON "common"."departments" USING "btree" ("name");



CREATE INDEX "idx_divisions_department_id" ON "common"."divisions" USING "btree" ("department_id");



CREATE UNIQUE INDEX "idx_divisions_department_id_name_unique" ON "common"."divisions" USING "btree" ("department_id", "name");



CREATE INDEX "idx_ems_profiles_department_id" ON "common"."ems_profiles" USING "btree" ("department_id");



CREATE INDEX "idx_ems_profiles_division_id" ON "common"."ems_profiles" USING "btree" ("division_id");



CREATE INDEX "idx_ems_profiles_rank_id" ON "common"."ems_profiles" USING "btree" ("rank_id");



CREATE INDEX "idx_impounded_vehicles_impound_lot_id" ON "common"."impounded_vehicles" USING "btree" ("impound_lot_id");



CREATE INDEX "idx_impounded_vehicles_officer_id" ON "common"."impounded_vehicles" USING "btree" ("impounding_officer_id");



CREATE INDEX "idx_impounded_vehicles_status" ON "common"."impounded_vehicles" USING "btree" ("status");



CREATE INDEX "idx_impounded_vehicles_vehicle_id" ON "common"."impounded_vehicles" USING "btree" ("vehicle_id");



CREATE INDEX "idx_leo_profiles_department_id" ON "common"."leo_profiles" USING "btree" ("department_id");



CREATE INDEX "idx_leo_profiles_division_id" ON "common"."leo_profiles" USING "btree" ("division_id");



CREATE INDEX "idx_leo_profiles_rank_id" ON "common"."leo_profiles" USING "btree" ("rank_id");



CREATE INDEX "idx_pets_owner_id" ON "common"."pets" USING "btree" ("character_id");



CREATE INDEX "idx_qualifications_department_id" ON "common"."qualifications" USING "btree" ("department_id");



CREATE INDEX "idx_ranks_department_id" ON "common"."ranks" USING "btree" ("department_id");



CREATE UNIQUE INDEX "idx_ranks_department_id_name_unique" ON "common"."ranks" USING "btree" ("department_id", "name");



CREATE INDEX "idx_ranks_order_index" ON "common"."ranks" USING "btree" ("order_index");



CREATE INDEX "idx_units_department_id" ON "common"."units" USING "btree" ("department_id");



CREATE UNIQUE INDEX "idx_units_department_id_name_unique" ON "common"."units" USING "btree" ("department_id", "name");



CREATE INDEX "idx_vehicles_owner_id" ON "common"."vehicles" USING "btree" ("character_id");



CREATE INDEX "idx_weapons_owner_id" ON "common"."weapons" USING "btree" ("character_id");



CREATE INDEX "idx_forum_posts_author_id" ON "forum"."forum_posts" USING "btree" ("author_id");



CREATE INDEX "idx_forum_posts_created_at" ON "forum"."forum_posts" USING "btree" ("created_at");



CREATE INDEX "idx_forum_posts_parent_id" ON "forum"."forum_posts" USING "btree" ("parent_id");



CREATE INDEX "idx_forum_posts_topic_id" ON "forum"."forum_posts" USING "btree" ("topic_id");



CREATE INDEX "idx_forum_reactions_post_id" ON "forum"."forum_reactions" USING "btree" ("post_id");



CREATE INDEX "idx_forum_reactions_user_id" ON "forum"."forum_reactions" USING "btree" ("user_id");



CREATE INDEX "idx_forum_subscriptions_topic_id" ON "forum"."forum_subscriptions" USING "btree" ("topic_id");



CREATE INDEX "idx_forum_subscriptions_user_id" ON "forum"."forum_subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_forum_topics_author_id" ON "forum"."forum_topics" USING "btree" ("author_id");



CREATE INDEX "idx_forum_topics_category_id" ON "forum"."forum_topics" USING "btree" ("category_id");



CREATE INDEX "idx_forum_topics_created_at" ON "forum"."forum_topics" USING "btree" ("created_at");



CREATE INDEX "idx_forum_topics_is_pinned" ON "forum"."forum_topics" USING "btree" ("is_pinned");



CREATE INDEX "idx_forum_topics_status" ON "forum"."forum_topics" USING "btree" ("status");



CREATE INDEX "idx_forum_views_topic_id" ON "forum"."forum_views" USING "btree" ("topic_id");



CREATE INDEX "idx_forum_views_user_id" ON "forum"."forum_views" USING "btree" ("user_id");



CREATE INDEX "idx_forum_views_viewed_at" ON "forum"."forum_views" USING "btree" ("viewed_at");



CREATE INDEX "idx_applications_author_character_id" ON "mdt"."applications" USING "btree" ("author_character_id");



CREATE INDEX "idx_applications_author_user_id" ON "mdt"."applications" USING "btree" ("author_user_id");



CREATE INDEX "idx_applications_reviewer_character_id" ON "mdt"."applications" USING "btree" ("reviewer_character_id");



CREATE INDEX "idx_applications_type_status" ON "mdt"."applications" USING "btree" ("type", "status");



CREATE INDEX "idx_bolos_author_character_id" ON "mdt"."bolos" USING "btree" ("author_character_id");



CREATE INDEX "idx_bolos_status_type" ON "mdt"."bolos" USING "btree" ("status", "type");



CREATE INDEX "idx_calls_created_at" ON "mdt"."calls" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_calls_status_type" ON "mdt"."calls" USING "btree" ("status", "type");



CREATE INDEX "idx_complaints_author_user_id" ON "mdt"."complaints" USING "btree" ("author_user_id");



CREATE INDEX "idx_complaints_status" ON "mdt"."complaints" USING "btree" ("status");



CREATE INDEX "idx_ems_fd_reports_author_character_id" ON "mdt"."ems_fd_reports" USING "btree" ("author_character_id");



CREATE INDEX "idx_ems_fd_reports_call_id" ON "mdt"."ems_fd_reports" USING "btree" ("call_id");



CREATE INDEX "idx_law_reports_author_character_id" ON "mdt"."law_reports" USING "btree" ("author_character_id");



CREATE INDEX "idx_law_reports_call_id" ON "mdt"."law_reports" USING "btree" ("call_id");



CREATE INDEX "idx_notebook_notes_author_character_id" ON "mdt"."notebook_notes" USING "btree" ("author_character_id");



CREATE INDEX "idx_notifications_is_read" ON "mdt"."notifications" USING "btree" ("is_read");



CREATE INDEX "idx_notifications_recipient_user_id" ON "mdt"."notifications" USING "btree" ("recipient_user_id");



CREATE INDEX "idx_report_templates_department_id" ON "mdt"."report_templates" USING "btree" ("department_id");



CREATE INDEX "idx_support_tickets_author_user_id" ON "mdt"."support_tickets" USING "btree" ("author_user_id");



CREATE INDEX "idx_support_tickets_handler_user_id" ON "mdt"."support_tickets" USING "btree" ("handler_user_id");



CREATE INDEX "idx_support_tickets_status" ON "mdt"."support_tickets" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_units_on_duty_character_id_unique" ON "mdt"."units_on_duty" USING "btree" ("character_id");



CREATE INDEX "idx_units_on_duty_department_id" ON "mdt"."units_on_duty" USING "btree" ("department_id");



CREATE INDEX "idx_units_on_duty_user_id" ON "mdt"."units_on_duty" USING "btree" ("user_id");



CREATE INDEX "mdt_signal_notifications_recipient_character_id_idx" ON "mdt"."mdt_signal_notifications" USING "btree" ("recipient_character_id");



CREATE INDEX "mdt_signals_author_character_id_idx" ON "mdt"."mdt_signals" USING "btree" ("author_character_id");



CREATE INDEX "test_results_session_id_idx" ON "mdt"."test_results" USING "btree" ("session_id");



CREATE INDEX "test_sessions_user_id_idx" ON "mdt"."test_sessions" USING "btree" ("user_id");



CREATE INDEX "joint_positions_history_character_id_idx" ON "public"."joint_positions_history" USING "btree" ("character_id");



CREATE INDEX "joint_positions_history_user_id_idx" ON "public"."joint_positions_history" USING "btree" ("user_id");



CREATE INDEX "user_achievements_user_id_idx" ON "public"."user_achievements" USING "btree" ("user_id");



CREATE INDEX "user_badges_user_id_idx" ON "public"."user_badges" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_updated_at_characters" BEFORE UPDATE ON "common"."characters" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_companies" BEFORE UPDATE ON "common"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "forum_posts_counter_trigger" AFTER INSERT OR DELETE ON "forum"."forum_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_topic_counters"();



CREATE OR REPLACE TRIGGER "forum_reactions_counter_trigger" AFTER INSERT OR DELETE ON "forum"."forum_reactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_reaction_counter"();



CREATE OR REPLACE TRIGGER "forum_topics_category_counter_trigger" AFTER INSERT OR DELETE ON "forum"."forum_topics" FOR EACH ROW EXECUTE FUNCTION "public"."update_category_topic_counter"();



CREATE OR REPLACE TRIGGER "on_updated_at_complaints" BEFORE UPDATE ON "mdt"."complaints" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_ems_fd_reports" BEFORE UPDATE ON "mdt"."ems_fd_reports" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_law_reports" BEFORE UPDATE ON "mdt"."law_reports" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_notebook_notes" BEFORE UPDATE ON "mdt"."notebook_notes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_report_templates" BEFORE UPDATE ON "mdt"."report_templates" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_updated_at_support_tickets" BEFORE UPDATE ON "mdt"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "common"."cargo_shipments"
    ADD CONSTRAINT "cargo_shipments_driver_character_id_fkey" FOREIGN KEY ("driver_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."cargo_shipments"
    ADD CONSTRAINT "cargo_shipments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "common"."vehicles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_approved_by_character_id_fkey" FOREIGN KEY ("approved_by_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "common"."divisions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "common"."ranks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_career_history"
    ADD CONSTRAINT "character_career_history_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "common"."units"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_qualifications"
    ADD CONSTRAINT "character_qualifications_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."character_qualifications"
    ADD CONSTRAINT "character_qualifications_issued_by_character_id_fkey" FOREIGN KEY ("issued_by_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."character_qualifications"
    ADD CONSTRAINT "character_qualifications_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "common"."qualifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."characters"
    ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."companies"
    ADD CONSTRAINT "companies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."company_employees"
    ADD CONSTRAINT "company_employees_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."company_employees"
    ADD CONSTRAINT "company_employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "common"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."divisions"
    ADD CONSTRAINT "divisions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."ems_profiles"
    ADD CONSTRAINT "ems_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "common"."ems_profiles"
    ADD CONSTRAINT "ems_profiles_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "common"."divisions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."ems_profiles"
    ADD CONSTRAINT "ems_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."ems_profiles"
    ADD CONSTRAINT "ems_profiles_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "common"."ranks"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "common"."impounded_vehicles"
    ADD CONSTRAINT "impounded_vehicles_impound_lot_id_fkey" FOREIGN KEY ("impound_lot_id") REFERENCES "common"."impound_lots"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "common"."impounded_vehicles"
    ADD CONSTRAINT "impounded_vehicles_impounding_officer_id_fkey" FOREIGN KEY ("impounding_officer_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."impounded_vehicles"
    ADD CONSTRAINT "impounded_vehicles_release_officer_id_fkey" FOREIGN KEY ("release_officer_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."impounded_vehicles"
    ADD CONSTRAINT "impounded_vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "common"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "common"."divisions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."leo_profiles"
    ADD CONSTRAINT "leo_profiles_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "common"."ranks"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "common"."pets"
    ADD CONSTRAINT "pets_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."qualifications"
    ADD CONSTRAINT "qualifications_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."qualifications"
    ADD CONSTRAINT "qualifications_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "common"."divisions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "common"."ranks"
    ADD CONSTRAINT "ranks_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."units"
    ADD CONSTRAINT "units_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."vehicles"
    ADD CONSTRAINT "vehicles_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "common"."weapons"
    ADD CONSTRAINT "weapons_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "forum"."forum_posts"
    ADD CONSTRAINT "forum_posts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "forum"."forum_posts"("id");



ALTER TABLE ONLY "forum"."forum_posts"
    ADD CONSTRAINT "forum_posts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "forum"."forum_topics"("id");



ALTER TABLE ONLY "forum"."forum_reactions"
    ADD CONSTRAINT "forum_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum"."forum_posts"("id");



ALTER TABLE ONLY "forum"."forum_subscriptions"
    ADD CONSTRAINT "forum_subscriptions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "forum"."forum_topics"("id");



ALTER TABLE ONLY "forum"."forum_topics"
    ADD CONSTRAINT "forum_topics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum"."forum_categories"("id");



ALTER TABLE ONLY "forum"."forum_views"
    ADD CONSTRAINT "forum_views_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "forum"."forum_topics"("id");



ALTER TABLE ONLY "mdt"."applications"
    ADD CONSTRAINT "applications_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."applications"
    ADD CONSTRAINT "applications_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."applications"
    ADD CONSTRAINT "applications_reviewer_character_id_fkey" FOREIGN KEY ("reviewer_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."bolos"
    ADD CONSTRAINT "bolos_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."complaints"
    ADD CONSTRAINT "complaints_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."complaints"
    ADD CONSTRAINT "complaints_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."ems_fd_reports"
    ADD CONSTRAINT "ems_fd_reports_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."ems_fd_reports"
    ADD CONSTRAINT "ems_fd_reports_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "mdt"."calls"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."law_reports"
    ADD CONSTRAINT "law_reports_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."law_reports"
    ADD CONSTRAINT "law_reports_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "mdt"."calls"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."mdt_signal_notifications"
    ADD CONSTRAINT "mdt_signal_notifications_recipient_character_id_fkey" FOREIGN KEY ("recipient_character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."mdt_signal_notifications"
    ADD CONSTRAINT "mdt_signal_notifications_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "mdt"."mdt_signals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."mdt_signals"
    ADD CONSTRAINT "mdt_signals_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."notebook_notes"
    ADD CONSTRAINT "notebook_notes_author_character_id_fkey" FOREIGN KEY ("author_character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."notifications"
    ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."report_participants"
    ADD CONSTRAINT "report_participants_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id");



ALTER TABLE ONLY "mdt"."report_participants"
    ADD CONSTRAINT "report_participants_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "mdt"."law_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."report_templates"
    ADD CONSTRAINT "report_templates_created_by_character_id_fkey" FOREIGN KEY ("created_by_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."report_templates"
    ADD CONSTRAINT "report_templates_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."support_tickets"
    ADD CONSTRAINT "support_tickets_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."support_tickets"
    ADD CONSTRAINT "support_tickets_handler_user_id_fkey" FOREIGN KEY ("handler_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."test_results"
    ADD CONSTRAINT "test_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "mdt"."test_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."test_results"
    ADD CONSTRAINT "test_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "mdt"."tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."test_results"
    ADD CONSTRAINT "test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."test_sessions"
    ADD CONSTRAINT "test_sessions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "mdt"."applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."test_sessions"
    ADD CONSTRAINT "test_sessions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "mdt"."tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."test_sessions"
    ADD CONSTRAINT "test_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."units_on_duty"
    ADD CONSTRAINT "units_on_duty_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."units_on_duty"
    ADD CONSTRAINT "units_on_duty_current_call_id_fkey" FOREIGN KEY ("current_call_id") REFERENCES "mdt"."calls"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "mdt"."units_on_duty"
    ADD CONSTRAINT "units_on_duty_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "mdt"."units_on_duty"
    ADD CONSTRAINT "units_on_duty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_approved_by_character_id_fkey" FOREIGN KEY ("approved_by_character_id") REFERENCES "common"."characters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "common"."characters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_primary_department_id_fkey" FOREIGN KEY ("primary_department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_secondary_department_id_fkey" FOREIGN KEY ("secondary_department_id") REFERENCES "common"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."joint_positions_history"
    ADD CONSTRAINT "joint_positions_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_awarded_by_user_id_fkey" FOREIGN KEY ("awarded_by_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all shipments" ON "common"."cargo_shipments" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage career history" ON "common"."character_career_history" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage character qualifications" ON "common"."character_qualifications" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage weapons" ON "common"."weapons" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all characters" ON "common"."characters" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all vehicles" ON "common"."vehicles" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins have full access to impounded vehicles" ON "common"."impounded_vehicles" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage departments" ON "common"."departments" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage divisions" ON "common"."divisions" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage ems profiles" ON "common"."ems_profiles" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage impound lots" ON "common"."impound_lots" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage leo profiles" ON "common"."leo_profiles" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage qualifications" ON "common"."qualifications" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage ranks" ON "common"."ranks" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins to manage units" ON "common"."units" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow authenticated to read impound lots" ON "common"."impound_lots" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated to read qualifications" ON "common"."qualifications" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read departments" ON "common"."departments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read divisions" ON "common"."divisions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read ems profiles" ON "common"."ems_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read leo profiles" ON "common"."leo_profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read ranks" ON "common"."ranks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read units" ON "common"."units" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can see all shipments" ON "common"."cargo_shipments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view all companies" ON "common"."companies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view all pets" ON "common"."pets" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Company owner and employee can see entry" ON "common"."company_employees" FOR SELECT USING (((( SELECT "companies"."owner_id"
   FROM "common"."companies"
  WHERE ("companies"."id" = "company_employees"."company_id")) = "auth"."uid"()) OR (( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "company_employees"."character_id")) = "auth"."uid"())));



CREATE POLICY "Company owner can manage employees" ON "common"."company_employees" USING ((( SELECT "companies"."owner_id"
   FROM "common"."companies"
  WHERE ("companies"."id" = "company_employees"."company_id")) = "auth"."uid"()));



CREATE POLICY "Driver can manage their own shipment" ON "common"."cargo_shipments" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "cargo_shipments"."driver_character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "cargo_shipments"."driver_character_id")) = "auth"."uid"()));



CREATE POLICY "LEO can manage impounded vehicles" ON "common"."impounded_vehicles" USING ((EXISTS ( SELECT 1
   FROM "common"."leo_profiles"
  WHERE ("leo_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "LEO can view all registered weapons" ON "common"."weapons" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "common"."leo_profiles"
  WHERE ("leo_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "LEO can view all vehicles" ON "common"."vehicles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "common"."leo_profiles"
  WHERE ("leo_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "Owner can manage their own pets" ON "common"."pets" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "pets"."character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "pets"."character_id")) = "auth"."uid"()));



CREATE POLICY "Owner can manage their own vehicle" ON "common"."vehicles" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "vehicles"."character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "vehicles"."character_id")) = "auth"."uid"()));



CREATE POLICY "Owner can view their own weapons" ON "common"."weapons" FOR SELECT USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "characters"."user_id")) = "auth"."uid"()));



CREATE POLICY "Service members and admins can see all qualifications" ON "common"."character_qualifications" FOR SELECT USING (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM "common"."characters" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND (("c"."id" IN ( SELECT "leo_profiles"."id"
           FROM "common"."leo_profiles")) OR ("c"."id" IN ( SELECT "ems_profiles"."id"
           FROM "common"."ems_profiles"))))))));



CREATE POLICY "Service members and admins can view all career history" ON "common"."character_career_history" FOR SELECT USING (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM "common"."characters" "c"
  WHERE (("c"."user_id" = "auth"."uid"()) AND (("c"."id" IN ( SELECT "leo_profiles"."id"
           FROM "common"."leo_profiles")) OR ("c"."id" IN ( SELECT "ems_profiles"."id"
           FROM "common"."ems_profiles"))))))));



CREATE POLICY "User can view their own character career history" ON "common"."character_career_history" FOR SELECT USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "character_career_history"."character_id")) = "auth"."uid"()));



CREATE POLICY "Users can manage their own characters" ON "common"."characters" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own companies" ON "common"."companies" USING (("auth"."uid"() = "owner_id")) WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can see their own qualifications" ON "common"."character_qualifications" FOR SELECT USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "character_qualifications"."character_id")) = "auth"."uid"()));



CREATE POLICY "Vehicle owner can see their impounded vehicle" ON "common"."impounded_vehicles" FOR SELECT USING ((( SELECT "vehicles"."character_id" AS "owner_id"
   FROM "common"."vehicles"
  WHERE ("vehicles"."id" = "impounded_vehicles"."vehicle_id")) = ( SELECT "characters"."id"
   FROM "common"."characters"
  WHERE ("characters"."user_id" = "auth"."uid"())
 LIMIT 1)));



ALTER TABLE "common"."cargo_shipments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."character_career_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."character_qualifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."characters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."company_employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."divisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."ems_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."impound_lots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."impounded_vehicles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."leo_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."pets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."qualifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."ranks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."vehicles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "common"."weapons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "forum"."forum_views" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Admins can manage all complaints" ON "mdt"."complaints" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage all support tickets" ON "mdt"."support_tickets" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage report templates" ON "mdt"."report_templates" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage tests" ON "mdt"."tests" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can see all results" ON "mdt"."test_results" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all EMS/FD reports" ON "mdt"."ems_fd_reports" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all applications" ON "mdt"."applications" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all notes" ON "mdt"."notebook_notes" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all notifications" ON "mdt"."notifications" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can view all reports" ON "mdt"."law_reports" FOR SELECT USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow admins full access to calls" ON "mdt"."calls" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Allow service members to manage calls" ON "mdt"."calls" USING (((EXISTS ( SELECT 1
   FROM ("mdt"."units_on_duty" "uod"
     JOIN "common"."leo_profiles" "lp" ON (("lp"."id" = "uod"."character_id")))
  WHERE ("uod"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM ("mdt"."units_on_duty" "uod"
     JOIN "common"."ems_profiles" "ep" ON (("ep"."id" = "uod"."character_id")))
  WHERE ("uod"."user_id" = "auth"."uid"()))))) WITH CHECK (true);



CREATE POLICY "Auth can read tests" ON "mdt"."tests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read BOLOs" ON "mdt"."bolos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "LEO and Admins can manage BOLOs" ON "mdt"."bolos" USING (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM ("common"."characters" "c"
     JOIN "common"."leo_profiles" "lp" ON (("c"."id" = "lp"."id")))
  WHERE ("c"."user_id" = "auth"."uid"()))))) WITH CHECK (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM ("common"."characters" "c"
     JOIN "common"."leo_profiles" "lp" ON (("c"."id" = "lp"."id")))
  WHERE ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "LEO can manage signals" ON "mdt"."mdt_signals" USING ((EXISTS ( SELECT 1
   FROM "common"."leo_profiles"
  WHERE ("leo_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))));



CREATE POLICY "Medics can manage their own reports" ON "mdt"."ems_fd_reports" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "ems_fd_reports"."author_character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "ems_fd_reports"."author_character_id")) = "auth"."uid"()));



CREATE POLICY "Officers can manage their own reports" ON "mdt"."law_reports" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "law_reports"."author_character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "law_reports"."author_character_id")) = "auth"."uid"()));



CREATE POLICY "Owner can manage their own notes" ON "mdt"."notebook_notes" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "notebook_notes"."author_character_id")) = "auth"."uid"())) WITH CHECK ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "notebook_notes"."author_character_id")) = "auth"."uid"()));



CREATE POLICY "Recipient can see their notifications" ON "mdt"."mdt_signal_notifications" USING ((( SELECT "characters"."user_id" AS "owner_id"
   FROM "common"."characters"
  WHERE ("characters"."id" = "mdt_signal_notifications"."recipient_character_id")) = "auth"."uid"()));



CREATE POLICY "Report authors and admins can manage participants" ON "mdt"."report_participants" USING (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM ("mdt"."law_reports" "lr"
     JOIN "common"."characters" "c" ON (("lr"."author_character_id" = "c"."id")))
  WHERE (("lr"."id" = "report_participants"."report_id") AND ("c"."user_id" = "auth"."uid"())))))) WITH CHECK (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM ("mdt"."law_reports" "lr"
     JOIN "common"."characters" "c" ON (("lr"."author_character_id" = "c"."id")))
  WHERE (("lr"."id" = "report_participants"."report_id") AND ("c"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Service members and admins can view report participants" ON "mdt"."report_participants" FOR SELECT USING (((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role") OR (EXISTS ( SELECT 1
   FROM ("common"."characters" "c"
     JOIN "common"."leo_profiles" "lp" ON (("c"."id" = "lp"."id")))
  WHERE ("c"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM (("common"."characters" "c"
     JOIN "common"."character_career_history" "h" ON (("c"."id" = "h"."character_id")))
     JOIN "common"."divisions" "d" ON (("h"."division_id" = "d"."id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("d"."name" ~~* 'Dispatch'::"text"))))));



CREATE POLICY "Service members can view active templates" ON "mdt"."report_templates" FOR SELECT USING ((("is_active" = true) AND ((EXISTS ( SELECT 1
   FROM "common"."leo_profiles"
  WHERE ("leo_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))) OR (EXISTS ( SELECT 1
   FROM "common"."ems_profiles"
  WHERE ("ems_profiles"."id" = ( SELECT "units_on_duty"."character_id"
           FROM "mdt"."units_on_duty"
          WHERE ("units_on_duty"."user_id" = "auth"."uid"())
         LIMIT 1)))))));



CREATE POLICY "User can manage their own test sessions" ON "mdt"."test_sessions" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can see their own results" ON "mdt"."test_results" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create support tickets" ON "mdt"."support_tickets" FOR INSERT WITH CHECK (("auth"."uid"() = "author_user_id"));



CREATE POLICY "Users can manage their own applications" ON "mdt"."applications" USING (("auth"."uid"() = "author_user_id")) WITH CHECK (("auth"."uid"() = "author_user_id"));



CREATE POLICY "Users can manage their own complaints" ON "mdt"."complaints" USING (("auth"."uid"() = "author_user_id")) WITH CHECK (("auth"."uid"() = "author_user_id"));



CREATE POLICY "Users can manage their own notifications" ON "mdt"."notifications" USING (("auth"."uid"() = "recipient_user_id")) WITH CHECK (("auth"."uid"() = "recipient_user_id"));



CREATE POLICY "Users can manage their own on-duty status" ON "mdt"."units_on_duty" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own open tickets" ON "mdt"."support_tickets" FOR UPDATE USING ((("author_user_id" = "auth"."uid"()) AND ("status" = 'open'::"mdt"."support_ticket_status"))) WITH CHECK (("author_user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own support tickets" ON "mdt"."support_tickets" FOR SELECT USING (("auth"."uid"() = "author_user_id"));



ALTER TABLE "mdt"."applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."bolos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."calls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."ems_fd_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."law_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."mdt_signal_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."mdt_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."notebook_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."report_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."report_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."support_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."test_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."test_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."tests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "mdt"."units_on_duty" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Admins can manage achievements" ON "public"."achievements" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage badges" ON "public"."badges" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage joint position history" ON "public"."joint_positions_history" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage stats" ON "public"."user_stats" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage user achievements" ON "public"."user_achievements" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Admins can manage user badges" ON "public"."user_badges" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"public"."user_role"));



CREATE POLICY "Public can read achievements" ON "public"."achievements" FOR SELECT USING (true);



CREATE POLICY "Public can read badges" ON "public"."badges" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "User can see their achievements" ON "public"."user_achievements" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can see their badges" ON "public"."user_badges" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can see their own history" ON "public"."joint_positions_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can see their own stats" ON "public"."user_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own profile." ON "public"."profiles" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."joint_positions_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "mdt"."bolos";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "mdt"."calls";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "mdt"."units_on_duty";



GRANT USAGE ON SCHEMA "common" TO "service_role";



GRANT USAGE ON SCHEMA "mdt" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_new_application"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_application"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_application"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_bolo"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_bolo"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_bolo"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_call"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_call"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_call"("p_data" "jsonb") TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "common"."characters" TO "authenticated";
GRANT ALL ON TABLE "common"."characters" TO "service_user";



GRANT ALL ON FUNCTION "public"."create_new_character"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_character"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_character"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_character"("p_first_name" "text", "p_last_name" "text", "p_date_of_birth" "date", "p_ssn" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_character"("p_first_name" "text", "p_last_name" "text", "p_date_of_birth" "date", "p_ssn" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_character"("p_first_name" "text", "p_last_name" "text", "p_date_of_birth" "date", "p_ssn" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_ems_fd_report"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_ems_fd_report"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_ems_fd_report"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_law_report"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_law_report"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_law_report"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_notification"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_notification"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_notification"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_signal"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_signal"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_signal"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_unit_on_duty"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_unit_on_duty"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_unit_on_duty"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_bolo"("p_bolo_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_bolo"("p_bolo_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_bolo"("p_bolo_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_call"("p_call_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_call"("p_call_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_call"("p_call_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_character"("p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_character"("p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_character"("p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_unit_on_duty"("p_unit_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_unit_on_duty"("p_unit_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_unit_on_duty"("p_unit_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_badge_number"("department_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_badge_number"("department_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_badge_number"("department_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_employee_id"("department_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_employee_id"("department_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_employee_id"("department_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_bolos_with_author"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_bolos_with_author"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_bolos_with_author"() TO "service_role";



GRANT ALL ON TABLE "mdt"."calls" TO "service_user";



GRANT ALL ON FUNCTION "public"."get_active_calls"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_calls"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_calls"() TO "service_role";



GRANT ALL ON TABLE "mdt"."mdt_signals" TO "service_user";



GRANT ALL ON FUNCTION "public"."get_active_signals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_signals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_signals"() TO "service_role";



GRANT ALL ON TABLE "mdt"."units_on_duty" TO "service_user";



GRANT ALL ON FUNCTION "public"."get_active_units"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_units"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_units"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_characters"("p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_characters"("p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_characters"("p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_departments"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_departments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_departments"() TO "service_role";



GRANT ALL ON TABLE "mdt"."bolos" TO "service_user";



GRANT ALL ON FUNCTION "public"."get_bolo_by_id"("p_bolo_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bolo_by_id"("p_bolo_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bolo_by_id"("p_bolo_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bolos_by_author"("p_author_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bolos_by_author"("p_author_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bolos_by_author"("p_author_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bolos_by_priority"("p_priority" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bolos_by_priority"("p_priority" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bolos_by_priority"("p_priority" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bolos_by_type"("p_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bolos_by_type"("p_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bolos_by_type"("p_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_call_by_id"("p_call_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_call_by_id"("p_call_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_call_by_id"("p_call_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_calls_by_status"("p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_calls_by_status"("p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_calls_by_status"("p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_calls_by_type"("p_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_calls_by_type"("p_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_calls_by_type"("p_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_by_id"("p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_by_id"("p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_by_id"("p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_count_by_gender"("p_gender" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_count_by_gender"("p_gender" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_count_by_gender"("p_gender" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_count_by_owner"("p_owner_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_count_by_owner"("p_owner_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_count_by_owner"("p_owner_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_licenses"("p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_licenses"("p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_licenses"("p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_medical_info"("p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_medical_info"("p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_medical_info"("p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_character_with_profile"("p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_character_with_profile"("p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_character_with_profile"("p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_characters_by_age_range"("p_min_age" integer, "p_max_age" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_characters_by_age_range"("p_min_age" integer, "p_max_age" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_characters_by_age_range"("p_min_age" integer, "p_max_age" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_characters_by_birth_month"("p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_characters_by_birth_month"("p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_characters_by_birth_month"("p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_characters_by_birth_year"("p_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_characters_by_birth_year"("p_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_characters_by_birth_year"("p_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_characters_with_filters"("p_owner_id" "uuid", "p_gender" "text", "p_occupation" "text", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_characters_with_filters"("p_owner_id" "uuid", "p_gender" "text", "p_occupation" "text", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_characters_with_filters"("p_owner_id" "uuid", "p_gender" "text", "p_occupation" "text", "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_characters_with_profiles"("p_owner_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_characters_with_profiles"("p_owner_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_characters_with_profiles"("p_owner_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_characters"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_characters"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_characters"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_characters"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_characters"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_characters"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_signal_by_id"("p_signal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_signal_by_id"("p_signal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_signal_by_id"("p_signal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unit_by_id"("p_unit_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unit_by_id"("p_unit_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unit_by_id"("p_unit_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_units_by_department"("p_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_units_by_department"("p_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_units_by_department"("p_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_units_by_status"("p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_units_by_status"("p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_units_by_status"("p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_units_by_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_units_by_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_units_by_user"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "mdt"."notifications" TO "service_user";



GRANT ALL ON FUNCTION "public"."get_unread_notifications"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_notifications"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_notifications"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_notifications"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_guest_candidate"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_guest_candidate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_guest_candidate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_character_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_character_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_character_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_signal"("p_signal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_signal"("p_signal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_signal"("p_signal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_characters"("p_query" "text", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."transfer_character_ownership"("p_character_id" "uuid", "p_new_owner_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."transfer_character_ownership"("p_character_id" "uuid", "p_new_owner_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."transfer_character_ownership"("p_character_id" "uuid", "p_new_owner_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_application"("p_application_id" "uuid", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_application"("p_application_id" "uuid", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_application"("p_application_id" "uuid", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_application_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_application_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_application_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_bolo"("p_bolo_id" "uuid", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_bolo"("p_bolo_id" "uuid", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_bolo"("p_bolo_id" "uuid", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_call"("p_call_id" "uuid", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_call"("p_call_id" "uuid", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_call"("p_call_id" "uuid", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_career_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_career_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_career_history"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_category_topic_counter"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_category_topic_counter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_category_topic_counter"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_character"("p_character_id" "uuid", "p_updates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_character"("p_character_id" "uuid", "p_updates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_character"("p_character_id" "uuid", "p_updates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_character_licenses"("p_character_id" "uuid", "p_new_licenses" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_character_licenses"("p_character_id" "uuid", "p_new_licenses" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_character_licenses"("p_character_id" "uuid", "p_new_licenses" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_character_medical_info"("p_character_id" "uuid", "p_new_medical_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_character_medical_info"("p_character_id" "uuid", "p_new_medical_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_character_medical_info"("p_character_id" "uuid", "p_new_medical_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_characters_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_characters_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_characters_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reaction_counter"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reaction_counter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reaction_counter"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_signal"("p_signal_id" "uuid", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_signal"("p_signal_id" "uuid", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_signal"("p_signal_id" "uuid", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_topic_counters"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_topic_counters"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_topic_counters"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_unit_on_duty"("p_unit_id" "uuid", "p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_unit_on_duty"("p_unit_id" "uuid", "p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_unit_on_duty"("p_unit_id" "uuid", "p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_character_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_character_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_character_data"() TO "service_role";












GRANT ALL ON TABLE "common"."cargo_shipments" TO "service_user";



GRANT ALL ON TABLE "common"."character_career_history" TO "service_user";



GRANT ALL ON TABLE "common"."character_qualifications" TO "service_user";



GRANT ALL ON TABLE "common"."companies" TO "service_user";



GRANT ALL ON TABLE "common"."company_employees" TO "service_user";



GRANT ALL ON TABLE "common"."departments" TO "service_user";
GRANT SELECT ON TABLE "common"."departments" TO "anon";
GRANT SELECT ON TABLE "common"."departments" TO "authenticated";



GRANT ALL ON TABLE "common"."divisions" TO "service_user";



GRANT ALL ON TABLE "common"."ems_profiles" TO "service_user";



GRANT ALL ON TABLE "common"."impound_lots" TO "service_user";



GRANT ALL ON TABLE "common"."impounded_vehicles" TO "service_user";



GRANT ALL ON TABLE "common"."leo_profiles" TO "service_user";



GRANT ALL ON TABLE "common"."pets" TO "service_user";



GRANT ALL ON TABLE "common"."qualifications" TO "service_user";



GRANT ALL ON TABLE "common"."ranks" TO "service_user";



GRANT ALL ON TABLE "common"."units" TO "service_user";



GRANT ALL ON TABLE "common"."vehicles" TO "service_user";



GRANT ALL ON SEQUENCE "common"."vehicles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "common"."vehicles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "common"."vehicles_id_seq" TO "service_role";



GRANT ALL ON TABLE "common"."weapons" TO "service_user";



GRANT ALL ON SEQUENCE "common"."weapons_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "common"."weapons_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "common"."weapons_id_seq" TO "service_role";









GRANT ALL ON TABLE "forum"."forum_categories" TO "anon";
GRANT ALL ON TABLE "forum"."forum_categories" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_categories" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_posts" TO "anon";
GRANT ALL ON TABLE "forum"."forum_posts" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_posts" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_reactions" TO "anon";
GRANT ALL ON TABLE "forum"."forum_reactions" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_reactions" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_reactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_reactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_reactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_stats" TO "anon";
GRANT ALL ON TABLE "forum"."forum_stats" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_stats" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_stats_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_subscriptions" TO "anon";
GRANT ALL ON TABLE "forum"."forum_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_subscriptions" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_subscriptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_topics" TO "anon";
GRANT ALL ON TABLE "forum"."forum_topics" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_topics" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_topics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_topics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_topics_id_seq" TO "service_role";



GRANT ALL ON TABLE "forum"."forum_views" TO "anon";
GRANT ALL ON TABLE "forum"."forum_views" TO "authenticated";
GRANT ALL ON TABLE "forum"."forum_views" TO "service_role";



GRANT ALL ON SEQUENCE "forum"."forum_views_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "forum"."forum_views_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "forum"."forum_views_id_seq" TO "service_role";



GRANT ALL ON TABLE "mdt"."applications" TO "service_user";



GRANT ALL ON TABLE "mdt"."complaints" TO "service_user";



GRANT ALL ON TABLE "mdt"."ems_fd_reports" TO "service_user";



GRANT ALL ON TABLE "mdt"."law_reports" TO "service_user";



GRANT ALL ON TABLE "mdt"."mdt_signal_notifications" TO "service_user";



GRANT ALL ON TABLE "mdt"."notebook_notes" TO "service_user";



GRANT ALL ON TABLE "mdt"."report_participants" TO "service_user";



GRANT ALL ON TABLE "mdt"."report_templates" TO "service_user";



GRANT ALL ON TABLE "mdt"."support_tickets" TO "service_user";



GRANT ALL ON TABLE "mdt"."test_results" TO "service_user";



GRANT ALL ON TABLE "mdt"."test_sessions" TO "service_user";



GRANT ALL ON TABLE "mdt"."tests" TO "service_user";



GRANT ALL ON TABLE "public"."achievements" TO "anon";
GRANT ALL ON TABLE "public"."achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."achievements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."achievements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."achievements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."achievements_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."active_units_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."active_units_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."active_units_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."badges_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."call911_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."call911_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."call911_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."call_attachments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."call_attachments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."call_attachments_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."filled_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."filled_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."filled_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."joint_positions_history" TO "anon";
GRANT ALL ON TABLE "public"."joint_positions_history" TO "authenticated";
GRANT ALL ON TABLE "public"."joint_positions_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."joint_positions_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."joint_positions_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."joint_positions_history_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."records_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."report_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."report_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."report_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_achievements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_achievements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_achievements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_badges_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_badges_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_badges_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_stats_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "common" GRANT SELECT ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "common" GRANT ALL ON TABLES TO "service_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "mdt" GRANT SELECT ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "mdt" GRANT ALL ON TABLES TO "service_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
