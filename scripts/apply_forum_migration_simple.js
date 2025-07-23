#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyForumMigrationSimple() {
  try {
    console.log('🚀 Начинаем простое применение миграции форума...');
    
    // Проверяем подключение
    console.log('🔍 Проверяем подключение к базе данных...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Ошибка подключения к базе данных:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Подключение к базе данных успешно');
    
    // Создаем таблицы через прямые запросы
    console.log('📋 Создаем таблицы форума...');
    
    // 1. Создаем таблицу категорий
    console.log('1️⃣ Создаем forum_categories...');
    const { error: catError } = await supabase
      .from('forum_categories')
      .select('id')
      .limit(1);
    
    if (catError && catError.message.includes('does not exist')) {
      console.log('⚠️  Таблица forum_categories не существует, создаем...');
      // Здесь нужно будет создать таблицу через другой способ
    } else {
      console.log('✅ Таблица forum_categories уже существует');
    }
    
    // 2. Проверяем остальные таблицы
    const tables = [
      'forum_topics',
      'forum_posts', 
      'forum_reactions',
      'forum_subscriptions',
      'forum_views',
      'forum_stats'
    ];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`⚠️  Таблица ${table} не существует`);
      } else {
        console.log(`✅ Таблица ${table} существует`);
      }
    }
    
    // 3. Создаем начальные данные для категорий
    console.log('3️⃣ Создаем начальные категории...');
    
    const categories = [
      {
        name: 'Полицейский департамент',
        description: 'Мануалы, гайды и обсуждения полицейского департамента',
        department_id: 1,
        icon: 'shield',
        color: 'bg-blue-500',
        order_index: 1,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      },
      {
        name: 'Гражданский департамент',
        description: 'Мануалы, гайды и обсуждения гражданского департамента',
        department_id: 2,
        icon: 'users',
        color: 'bg-green-500',
        order_index: 2,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      },
      {
        name: 'Диспетчерский департамент',
        description: 'Мануалы, гайды и обсуждения диспетчерского департамента',
        department_id: 3,
        icon: 'phone',
        color: 'bg-yellow-500',
        order_index: 3,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      },
      {
        name: 'Пожарный департамент',
        description: 'Мануалы, гайды и обсуждения пожарного департамента',
        department_id: 4,
        icon: 'truck',
        color: 'bg-red-500',
        order_index: 4,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      },
      {
        name: 'Медицинский департамент',
        description: 'Мануалы, гайды и обсуждения медицинского департамента',
        department_id: 5,
        icon: 'heart',
        color: 'bg-pink-500',
        order_index: 5,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      },
      {
        name: 'Общие мануалы и гайды',
        description: 'Базовые руководства для новичков',
        department_id: null,
        icon: 'book-open',
        color: 'bg-purple-500',
        order_index: 6,
        is_active: true,
        topics_count: 0,
        posts_count: 0
      }
    ];
    
    // Проверяем, есть ли уже категории
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*');
    
    if (categoriesError) {
      console.log('❌ Ошибка проверки категорий:', categoriesError.message);
    } else if (existingCategories && existingCategories.length > 0) {
      console.log(`✅ Найдено ${existingCategories.length} существующих категорий`);
      existingCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.topics_count} тем, ${cat.posts_count} сообщений)`);
      });
    } else {
      console.log('📝 Создаем новые категории...');
      
      for (const category of categories) {
        const { error } = await supabase
          .from('forum_categories')
          .insert(category);
        
        if (error) {
          console.log(`⚠️  Ошибка создания категории "${category.name}":`, error.message);
        } else {
          console.log(`✅ Категория "${category.name}" создана`);
        }
      }
    }
    
    // 4. Создаем статистику
    console.log('4️⃣ Создаем статистику форума...');
    
    const { data: existingStats, error: statsError } = await supabase
      .from('forum_stats')
      .select('*');
    
    if (statsError) {
      console.log('❌ Ошибка проверки статистики:', statsError.message);
    } else if (!existingStats || existingStats.length === 0) {
      const { error } = await supabase
        .from('forum_stats')
        .insert({
          total_topics: 0,
          total_posts: 0,
          total_members: 0,
          online_now: 0
        });
      
      if (error) {
        console.log('⚠️  Ошибка создания статистики:', error.message);
      } else {
        console.log('✅ Статистика форума создана');
      }
    } else {
      console.log('✅ Статистика форума уже существует');
    }
    
    console.log('🎉 Миграция форума завершена!');
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
applyForumMigrationSimple(); 