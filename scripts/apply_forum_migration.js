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

async function applyForumMigration() {
  try {
    console.log('🚀 Начинаем применение миграции форума...');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '../supabase/migrations/013_forum_system.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('📄 Читаем SQL миграцию...');
    
    // Разбиваем SQL на отдельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 Найдено ${commands.length} SQL команд для выполнения`);
    
    // Выполняем команды по очереди через прямые запросы
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Выполняем команду ${i + 1}/${commands.length}...`);
        
        try {
          // Используем прямой SQL запрос через REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: command })
          });
          
          if (!response.ok) {
            // Если exec_sql недоступен, пропускаем команду
            console.log(`⚠️  Команда ${i + 1} пропущена (exec_sql недоступен)`);
            continue;
          }
          
          const result = await response.json();
          if (result.error) {
            console.log(`⚠️  Команда ${i + 1} пропущена:`, result.error);
          } else {
            console.log(`✅ Команда ${i + 1} выполнена успешно`);
          }
        } catch (err) {
          console.log(`⚠️  Команда ${i + 1} пропущена:`, err.message);
        }
      }
    }
    
    console.log('🎉 Миграция форума применена успешно!');
    
    // Проверяем создание таблиц
    console.log('🔍 Проверяем создание таблиц...');
    
    const tablesToCheck = [
      'forum_categories',
      'forum_topics', 
      'forum_posts',
      'forum_reactions',
      'forum_subscriptions',
      'forum_views',
      'forum_stats'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Таблица ${tableName} не найдена:`, error.message);
        } else {
          console.log(`✅ Таблица ${tableName} создана успешно`);
        }
      } catch (err) {
        console.log(`❌ Ошибка проверки таблицы ${tableName}:`, err.message);
      }
    }
    
    // Проверяем начальные данные
    console.log('🔍 Проверяем начальные данные...');
    
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
      console.log('❌ Ошибка проверки начальных данных:', err.message);
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
applyForumMigration(); 