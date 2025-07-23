-- Создание таблиц для системы форума
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Создаем таблицу категорий форума
CREATE TABLE IF NOT EXISTS forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(id),
    icon TEXT,
    color TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    topics_count INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Создаем таблицу тем форума
CREATE TABLE IF NOT EXISTS forum_topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES forum_categories(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0,
    replies_count INTEGER NOT NULL DEFAULT 0,
    last_post_id INTEGER,
    last_post_author_id INTEGER REFERENCES users(id),
    last_post_at TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Создаем таблицу сообщений
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    parent_id INTEGER,
    content TEXT NOT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    edited_at TIMESTAMP,
    edited_by INTEGER REFERENCES users(id),
    reactions_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. Добавляем self-reference для parent_id в forum_posts
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES forum_posts(id);

-- 5. Создаем таблицу реакций
CREATE TABLE IF NOT EXISTS forum_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id, reaction_type)
);

-- 6. Создаем таблицу подписок
CREATE TABLE IF NOT EXISTS forum_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
    is_email_notification BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, topic_id)
);

-- 7. Создаем таблицу просмотров
CREATE TABLE IF NOT EXISTS forum_views (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
    user_id INTEGER REFERENCES users(id),
    ip_address TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 8. Создаем таблицу статистики
CREATE TABLE IF NOT EXISTS forum_stats (
    id SERIAL PRIMARY KEY,
    total_topics INTEGER NOT NULL DEFAULT 0,
    total_posts INTEGER NOT NULL DEFAULT 0,
    total_members INTEGER NOT NULL DEFAULT 0,
    online_now INTEGER NOT NULL DEFAULT 0,
    last_update TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 9. Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_topics_is_pinned ON forum_topics(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_topics_status ON forum_topics(status);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_reactions_post_id ON forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_id ON forum_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_user_id ON forum_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_topic_id ON forum_subscriptions(topic_id);

CREATE INDEX IF NOT EXISTS idx_forum_views_topic_id ON forum_views(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_views_user_id ON forum_views(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_views_viewed_at ON forum_views(viewed_at);

-- 10. Включаем RLS для всех таблиц
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_stats ENABLE ROW LEVEL SECURITY;

-- 11. Создаем RLS политики
-- Политики для категорий (чтение для всех, создание/редактирование только для админов)
CREATE POLICY "forum_categories_read_policy" ON forum_categories
    FOR SELECT USING (true);

CREATE POLICY "forum_categories_admin_policy" ON forum_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для тем (чтение для всех, создание для авторизованных)
CREATE POLICY "forum_topics_read_policy" ON forum_topics
    FOR SELECT USING (true);

CREATE POLICY "forum_topics_insert_policy" ON forum_topics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.status = 'active'
        )
    );

CREATE POLICY "forum_topics_update_policy" ON forum_topics
    FOR UPDATE USING (
        author_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "forum_topics_delete_policy" ON forum_topics
    FOR DELETE USING (
        author_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для сообщений
CREATE POLICY "forum_posts_read_policy" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert_policy" ON forum_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.status = 'active'
        )
    );

CREATE POLICY "forum_posts_update_policy" ON forum_posts
    FOR UPDATE USING (
        author_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "forum_posts_delete_policy" ON forum_posts
    FOR DELETE USING (
        author_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для реакций
CREATE POLICY "forum_reactions_read_policy" ON forum_reactions
    FOR SELECT USING (true);

CREATE POLICY "forum_reactions_insert_policy" ON forum_reactions
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.status = 'active'
        )
    );

CREATE POLICY "forum_reactions_delete_policy" ON forum_reactions
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для подписок
CREATE POLICY "forum_subscriptions_read_policy" ON forum_subscriptions
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "forum_subscriptions_insert_policy" ON forum_subscriptions
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.status = 'active'
        )
    );

CREATE POLICY "forum_subscriptions_delete_policy" ON forum_subscriptions
    FOR DELETE USING (
        user_id = (SELECT id FROM users WHERE users.auth_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политики для просмотров (только чтение и вставка)
CREATE POLICY "forum_views_read_policy" ON forum_views
    FOR SELECT USING (true);

CREATE POLICY "forum_views_insert_policy" ON forum_views
    FOR INSERT WITH CHECK (true);

-- Политики для статистики (только чтение для всех, обновление для админов)
CREATE POLICY "forum_stats_read_policy" ON forum_stats
    FOR SELECT USING (true);

CREATE POLICY "forum_stats_admin_policy" ON forum_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- 12. Создаем начальные данные
INSERT INTO forum_stats (total_topics, total_posts, total_members, online_now) 
VALUES (0, 0, 0, 0) ON CONFLICT DO NOTHING;

-- 13. Создаем категории на основе существующих департаментов
-- Сначала создаем общую категорию (без привязки к департаменту)
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index) VALUES
('Общие мануалы и гайды', 'Базовые руководства для новичков', NULL, 'book-open', 'bg-purple-500', 999)
ON CONFLICT DO NOTHING;

-- Затем создаем категории для каждого существующего департамента
-- Полицейский департамент
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Полицейский департамент', 'Мануалы, гайды и обсуждения полицейского департамента', id, 'shield', 'bg-blue-500', 1
FROM departments 
WHERE name ILIKE '%полиц%' OR name ILIKE '%police%' OR name ILIKE '%law%'
ON CONFLICT DO NOTHING;

-- Гражданский департамент
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Гражданский департамент', 'Мануалы, гайды и обсуждения гражданского департамента', id, 'users', 'bg-green-500', 2
FROM departments 
WHERE name ILIKE '%гражд%' OR name ILIKE '%civil%' OR name ILIKE '%citizen%'
ON CONFLICT DO NOTHING;

-- Диспетчерский департамент
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Диспетчерский департамент', 'Мануалы, гайды и обсуждения диспетчерского департамента', id, 'phone', 'bg-yellow-500', 3
FROM departments 
WHERE name ILIKE '%диспетч%' OR name ILIKE '%dispatch%' OR name ILIKE '%call%'
ON CONFLICT DO NOTHING;

-- Пожарный департамент
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Пожарный департамент', 'Мануалы, гайды и обсуждения пожарного департамента', id, 'truck', 'bg-red-500', 4
FROM departments 
WHERE name ILIKE '%пожар%' OR name ILIKE '%fire%' OR name ILIKE '%firefighter%'
ON CONFLICT DO NOTHING;

-- Медицинский департамент
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Медицинский департамент', 'Мануалы, гайды и обсуждения медицинского департамента', id, 'heart', 'bg-pink-500', 5
FROM departments 
WHERE name ILIKE '%медиц%' OR name ILIKE '%medical%' OR name ILIKE '%ems%' OR name ILIKE '%ambulance%'
ON CONFLICT DO NOTHING;

-- Если департаменты не найдены, создаем категории без привязки
INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Полицейский департамент', 'Мануалы, гайды и обсуждения полицейского департамента', NULL, 'shield', 'bg-blue-500', 1
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Полицейский департамент')
ON CONFLICT DO NOTHING;

INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Гражданский департамент', 'Мануалы, гайды и обсуждения гражданского департамента', NULL, 'users', 'bg-green-500', 2
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Гражданский департамент')
ON CONFLICT DO NOTHING;

INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Диспетчерский департамент', 'Мануалы, гайды и обсуждения диспетчерского департамента', NULL, 'phone', 'bg-yellow-500', 3
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Диспетчерский департамент')
ON CONFLICT DO NOTHING;

INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Пожарный департамент', 'Мануалы, гайды и обсуждения пожарного департамента', NULL, 'truck', 'bg-red-500', 4
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Пожарный департамент')
ON CONFLICT DO NOTHING;

INSERT INTO forum_categories (name, description, department_id, icon, color, order_index)
SELECT 'Медицинский департамент', 'Мануалы, гайды и обсуждения медицинского департамента', NULL, 'heart', 'bg-pink-500', 5
WHERE NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Медицинский департамент')
ON CONFLICT DO NOTHING;

-- 14. Создаем триггеры для обновления счетчиков
CREATE OR REPLACE FUNCTION update_topic_counters()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_posts_counter_trigger
    AFTER INSERT OR DELETE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_topic_counters();

-- Триггер для обновления счетчика тем в категории
CREATE OR REPLACE FUNCTION update_category_topic_counter()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_topics_category_counter_trigger
    AFTER INSERT OR DELETE ON forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_category_topic_counter();

-- Триггер для обновления счетчика реакций
CREATE OR REPLACE FUNCTION update_reaction_counter()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_reactions_counter_trigger
    AFTER INSERT OR DELETE ON forum_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_reaction_counter();

-- Готово! Таблицы форума созданы и настроены 