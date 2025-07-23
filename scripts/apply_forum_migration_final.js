import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyForumMigrationFinal() {
  try {
    console.log('🚀 ФИНАЛЬНОЕ ПРИМЕНЕНИЕ МИГРАЦИИ ФОРУМА...');
    
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
    
    // Выполняем команды по очереди
    let successCount = 0;
    let errorCount = 0;
    
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
            console.log(`⚠️  Команда ${i + 1} пропущена (exec_sql недоступен)`);
            errorCount++;
            continue;
          }
          
          const result = await response.json();
          if (result.error) {
            console.log(`⚠️  Команда ${i + 1} пропущена:`, result.error);
            errorCount++;
          } else {
            console.log(`✅ Команда ${i + 1} выполнена успешно`);
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️  Команда ${i + 1} пропущена:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Результаты выполнения:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
    // Проверяем создание таблиц
    console.log('\n🔍 Проверяем создание таблиц...');
    
    const tablesToCheck = [
      'forum_categories',
      'forum_topics', 
      'forum_posts',
      'forum_reactions',
      'forum_subscriptions',
      'forum_views',
      'forum_stats'
    ];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Таблица ${table}: ${error.message}`);
        } else {
          console.log(`✅ Таблица ${table} доступна`);
        }
      } catch (err) {
        console.log(`❌ Ошибка проверки таблицы ${table}:`, err.message);
      }
    }
    
    // Проверяем начальные данные
    console.log('\n🔍 Проверяем начальные данные...');
    
    try {
      const { data: categories, error: catError } = await supabase
        .from('forum_categories')
        .select('*');
      
      if (catError) {
        console.log('❌ Ошибка получения категорий:', catError.message);
      } else {
        console.log(`✅ Найдено ${categories.length} категорий форума`);
      }
      
      const { data: stats, error: statsError } = await supabase
        .from('forum_stats')
        .select('*');
      
      if (statsError) {
        console.log('❌ Ошибка получения статистики:', statsError.message);
      } else {
        console.log(`✅ Статистика форума: ${stats.length} записей`);
      }
    } catch (err) {
      console.log('❌ Ошибка проверки данных:', err.message);
    }
    
    console.log('\n🎉 Миграция форума завершена!');
    console.log('\n📋 Что нужно проверить:');
    console.log('1. Откройте /forum в браузере');
    console.log('2. Проверьте отображение категорий');
    console.log('3. Попробуйте создать тему');
    console.log('4. Проверьте API endpoints');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

applyForumMigrationFinal(); 