#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
const dotenv = await import('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyForumMigrationDirect() {
  try {
    console.log('🚀 Начинаем прямое применение миграции форума...');
    
    // Создаем таблицы по одной
    console.log('📋 Создаем таблицы...');
    
    // 1. Создаем таблицу категорий
    console.log('1️⃣ Создаем forum_categories...');
    const { error: catError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (catError) {
      console.log('⚠️  Ошибка создания forum_categories:', catError.message);
    } else {
      console.log('✅ forum_categories создана');
    }
    
    // 2. Создаем таблицу тем
    console.log('2️⃣ Создаем forum_topics...');
    const { error: topicsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (topicsError) {
      console.log('⚠️  Ошибка создания forum_topics:', topicsError.message);
    } else {
      console.log('✅ forum_topics создана');
    }
    
    // 3. Создаем таблицу сообщений
    console.log('3️⃣ Создаем forum_posts...');
    const { error: postsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (postsError) {
      console.log('⚠️  Ошибка создания forum_posts:', postsError.message);
    } else {
      console.log('✅ forum_posts создана');
    }
    
    // 4. Добавляем self-reference для parent_id
    console.log('4️⃣ Добавляем self-reference для forum_posts...');
    const { error: selfRefError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES forum_posts(id);
      `
    });
    
    if (selfRefError) {
      console.log('⚠️  Ошибка добавления self-reference:', selfRefError.message);
    } else {
      console.log('✅ Self-reference добавлен');
    }
    
    // 5. Создаем остальные таблицы
    console.log('5️⃣ Создаем остальные таблицы...');
    
    const tables = [
      {
        name: 'forum_reactions',
        sql: `
          CREATE TABLE IF NOT EXISTS forum_reactions (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES forum_posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            reaction_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            UNIQUE(post_id, user_id, reaction_type)
          );
        `
      },
      {
        name: 'forum_subscriptions',
        sql: `
          CREATE TABLE IF NOT EXISTS forum_subscriptions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
            is_email_notification BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            UNIQUE(user_id, topic_id)
          );
        `
      },
      {
        name: 'forum_views',
        sql: `
          CREATE TABLE IF NOT EXISTS forum_views (
            id SERIAL PRIMARY KEY,
            topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
            user_id INTEGER REFERENCES users(id),
            ip_address TEXT,
            user_agent TEXT,
            viewed_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'forum_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS forum_stats (
            id SERIAL PRIMARY KEY,
            total_topics INTEGER NOT NULL DEFAULT 0,
            total_posts INTEGER NOT NULL DEFAULT 0,
            total_members INTEGER NOT NULL DEFAULT 0,
            online_now INTEGER NOT NULL DEFAULT 0,
            last_update TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      }
    ];
    
    for (const table of tables) {
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.log(`⚠️  Ошибка создания ${table.name}:`, error.message);
      } else {
        console.log(`✅ ${table.name} создана`);
      }
    }
    
    // 6. Создаем индексы
    console.log('6️⃣ Создаем индексы...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON forum_topics(author_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_forum_topics_is_pinned ON forum_topics(is_pinned);',
      'CREATE INDEX IF NOT EXISTS idx_forum_topics_status ON forum_topics(status);',
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON forum_posts(topic_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_forum_reactions_post_id ON forum_reactions(post_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_id ON forum_reactions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_user_id ON forum_subscriptions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_subscriptions_topic_id ON forum_subscriptions(topic_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_views_topic_id ON forum_views(topic_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_views_user_id ON forum_views(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_forum_views_viewed_at ON forum_views(viewed_at);'
    ];
    
    for (const index of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: index });
      if (error) {
        console.log(`⚠️  Ошибка создания индекса:`, error.message);
      }
    }
    
    console.log('✅ Индексы созданы');
    
    // 7. Включаем RLS
    console.log('7️⃣ Включаем RLS...');
    const rlsTables = [
      'forum_categories',
      'forum_topics',
      'forum_posts',
      'forum_reactions',
      'forum_subscriptions',
      'forum_views',
      'forum_stats'
    ];
    
    for (const table of rlsTables) {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
      });
      if (error) {
        console.log(`⚠️  Ошибка включения RLS для ${table}:`, error.message);
      }
    }
    
    console.log('✅ RLS включен');
    
    // 8. Создаем начальные данные
    console.log('8️⃣ Создаем начальные данные...');
    
    const { error: statsError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO forum_stats (total_topics, total_posts, total_members, online_now) 
        VALUES (0, 0, 0, 0) ON CONFLICT DO NOTHING;
      `
    });
    
    if (statsError) {
      console.log('⚠️  Ошибка создания статистики:', statsError.message);
    } else {
      console.log('✅ Статистика создана');
    }
    
    // Создаем категории
    const categories = [
      ['Полицейский департамент', 'Мануалы, гайды и обсуждения полицейского департамента', 1, 'shield', 'bg-blue-500', 1],
      ['Гражданский департамент', 'Мануалы, гайды и обсуждения гражданского департамента', 2, 'users', 'bg-green-500', 2],
      ['Диспетчерский департамент', 'Мануалы, гайды и обсуждения диспетчерского департамента', 3, 'phone', 'bg-yellow-500', 3],
      ['Пожарный департамент', 'Мануалы, гайды и обсуждения пожарного департамента', 4, 'truck', 'bg-red-500', 4],
      ['Медицинский департамент', 'Мануалы, гайды и обсуждения медицинского департамента', 5, 'heart', 'bg-pink-500', 5],
      ['Общие мануалы и гайды', 'Базовые руководства для новичков', null, 'book-open', 'bg-purple-500', 6]
    ];
    
    for (const category of categories) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO forum_categories (name, description, department_id, icon, color, order_index) 
          VALUES ('${category[0]}', '${category[1]}', ${category[2] || 'NULL'}, '${category[3]}', '${category[4]}', ${category[5]}) 
          ON CONFLICT DO NOTHING;
        `
      });
      
      if (error) {
        console.log(`⚠️  Ошибка создания категории ${category[0]}:`, error.message);
      } else {
        console.log(`✅ Категория "${category[0]}" создана`);
      }
    }
    
    console.log('🎉 Миграция форума применена успешно!');
    
    // Проверяем результат
    console.log('🔍 Проверяем результат...');
    
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*');
      
      if (categoriesError) {
        console.log('❌ Ошибка получения категорий:', categoriesError.message);
      } else {
        console.log(`✅ Найдено ${categories.length} категорий форума`);
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.topics_count} тем, ${cat.posts_count} сообщений)`);
        });
      }
    } catch (err) {
      console.log('❌ Ошибка проверки результата:', err.message);
    }
    
    console.log('🎯 Миграция форума завершена!');
    console.log('📝 Следующие шаги:');
    console.log('   1. Перезапустите сервер разработки');
    console.log('   2. Проверьте работу форума по адресу /forum');
    console.log('   3. Создайте несколько тестовых тем для проверки функционала');
    
  } catch (error) {
    console.error('❌ Критическая ошибка при применении миграции:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
applyForumMigrationDirect(); 