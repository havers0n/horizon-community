-- Миграция для проверки целостности схемы
-- Проверяем, что все foreign keys корректны и нет дублирующих таблиц users

BEGIN;

-- Проверяем, что таблица users существует только в схеме public
DO $$
DECLARE
    users_tables text[] := ARRAY[]::text[];
    table_info record;
BEGIN
    FOR table_info IN 
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name = 'users'
    LOOP
        users_tables := array_append(users_tables, table_info.table_schema || '.' || table_info.table_name);
    END LOOP;
    
    IF array_length(users_tables, 1) > 1 THEN
        RAISE WARNING 'Обнаружены дублирующие таблицы users: %', array_to_string(users_tables, ', ');
    ELSIF array_length(users_tables, 1) = 1 AND users_tables[1] != 'public.users' THEN
        RAISE WARNING 'Таблица users находится в неправильной схеме: %', users_tables[1];
    ELSE
        RAISE NOTICE 'Таблица users корректно размещена в схеме public';
    END IF;
END $$;

-- Проверяем все foreign keys, ссылающиеся на users
DO $$
DECLARE
    r RECORD;
    fk_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Проверка foreign keys, ссылающихся на users:';
    
    FOR r IN (
        SELECT 
            tc.table_schema,
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema IN ('public', 'common', 'mdt')
        AND ccu.table_name = 'users'
        ORDER BY tc.table_schema, tc.table_name
    ) LOOP
        fk_count := fk_count + 1;
        RAISE NOTICE 'FK %: %.% -> %.%', 
            fk_count,
            r.table_schema || '.' || r.table_name, r.column_name, 
            r.foreign_table_name, r.foreign_column_name;
    END LOOP;
    
    IF fk_count = 0 THEN
        RAISE NOTICE 'Foreign keys на users не найдены';
    ELSE
        RAISE NOTICE 'Всего найдено % foreign keys на users', fk_count;
    END IF;
END $$;

-- Проверяем, что все необходимые поля существуют в таблице users
DO $$
DECLARE
    required_columns text[] := ARRAY[
        'id', 'username', 'email', 'password_hash', 'role', 'status',
        'department_id', 'secondary_department_id', 'rank', 'division',
        'qualifications', 'game_warnings', 'admin_warnings', 'auth_id',
        'has_2fa', 'is_dark_theme', 'sound_settings', 'api_token',
        'cad_token', 'discord_id', 'discord_access_token', 'discord_refresh_token',
        'created_at', 'updated_at'
    ];
    missing_columns text[] := ARRAY[]::text[];
    col text;
BEGIN
    RAISE NOTICE 'Проверка наличия всех необходимых полей в users:';
    
    FOR col IN SELECT unnest(required_columns)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
            AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE WARNING 'Отсутствуют поля в users: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Все необходимые поля присутствуют в таблице users';
    END IF;
END $$;

-- Проверяем индексы на таблице users
DO $$
DECLARE
    index_count INTEGER := 0;
    idx record;
BEGIN
    RAISE NOTICE 'Проверка индексов на таблице users:';
    
    FOR idx IN 
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        ORDER BY indexname
    LOOP
        index_count := index_count + 1;
        RAISE NOTICE 'Индекс %: %', index_count, idx.indexname;
    END LOOP;
    
    IF index_count = 0 THEN
        RAISE WARNING 'Индексы на таблице users не найдены';
    ELSE
        RAISE NOTICE 'Всего найдено % индексов на users', index_count;
    END IF;
END $$;

-- Проверяем триггеры на таблице users
DO $$
DECLARE
    trigger_count INTEGER := 0;
    trig record;
BEGIN
    RAISE NOTICE 'Проверка триггеров на таблице users:';
    
    FOR trig IN 
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND event_object_schema = 'public'
        ORDER BY trigger_name
    LOOP
        trigger_count := trigger_count + 1;
        RAISE NOTICE 'Триггер %: % ON %', 
            trigger_count, trig.trigger_name, trig.event_manipulation;
    END LOOP;
    
    IF trigger_count = 0 THEN
        RAISE WARNING 'Триггеры на таблице users не найдены';
    ELSE
        RAISE NOTICE 'Всего найдено % триггеров на users', trigger_count;
    END IF;
END $$;

-- Проверяем RLS политики на таблице users
DO $$
DECLARE
    policy_count INTEGER := 0;
    pol record;
BEGIN
    RAISE NOTICE 'Проверка RLS политик на таблице users:';
    
    FOR pol IN 
        SELECT policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE tablename = 'users' 
        AND schemaname = 'public'
        ORDER BY policyname
    LOOP
        policy_count := policy_count + 1;
        RAISE NOTICE 'Политика %: % (%%)', 
            policy_count, pol.policyname, pol.cmd;
    END LOOP;
    
    IF policy_count = 0 THEN
        RAISE WARNING 'RLS политики на таблице users не найдены';
    ELSE
        RAISE NOTICE 'Всего найдено % RLS политик на users', policy_count;
    END IF;
END $$;

COMMIT; 