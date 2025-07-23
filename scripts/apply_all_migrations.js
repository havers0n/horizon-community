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

async function applyAllMigrations() {
  try {
    console.log('🚀 ПРИМЕНЕНИЕ ВСЕХ МИГРАЦИЙ...');
    console.log('=' * 50);
    
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
    
    // Список всех миграций в правильном порядке
    const migrations = [
      '001_initial_schema.sql',
      '002_rls_policies.sql',
      '003_rls_candidate_guest_restrictions.sql',
      '004_test_system.sql',
      '005_cad_mdt_system.sql',
      '006_joint_positions_history.sql',
      '007_update_departments.sql',
      '008_complete_character_system.sql',
      '009_setup_rls_policies.sql',
      '010_report_templates_system.sql',
      '011_enhanced_report_templates.sql',
      '012_add_template_status.sql',
      '013_forum_system.sql'
    ];
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (const migrationFile of migrations) {
      console.log(`\n📄 Применяем миграцию: ${migrationFile}`);
      console.log('-'.repeat(50));
      
      try {
        const migrationPath = path.join(__dirname, `../supabase/migrations/${migrationFile}`);
        
        // Проверяем существование файла
        try {
          await fs.access(migrationPath);
        } catch (err) {
          console.log(`⚠️  Файл ${migrationFile} не найден, пропускаем`);
          continue;
        }
        
        const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
        
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
                errorCount++;
                continue;
              }
              
              const result = await response.json();
              if (result.error) {
                errorCount++;
              } else {
                successCount++;
              }
            } catch (err) {
              errorCount++;
            }
          }
        }
        
        console.log(`📊 Результаты ${migrationFile}:`);
        console.log(`✅ Успешно: ${successCount}`);
        console.log(`❌ Ошибок: ${errorCount}`);
        
        totalSuccess += successCount;
        totalErrors += errorCount;
        
      } catch (error) {
        console.error(`❌ Ошибка при применении ${migrationFile}:`, error.message);
        totalErrors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:');
    console.log(`✅ Всего успешно: ${totalSuccess}`);
    console.log(`❌ Всего ошибок: ${totalErrors}`);
    
    // Проверяем основные таблицы
    console.log('\n🔍 Проверяем основные таблицы...');
    
    const mainTables = [
      'users',
      'departments',
      'applications',
      'support_tickets',
      'complaints',
      'reports',
      'notifications',
      'tests',
      'characters',
      'vehicles',
      'weapons',
      'call911',
      'active_units',
      'report_templates',
      'filled_reports',
      'forum_categories',
      'forum_topics',
      'forum_posts',
      'forum_stats'
    ];
    
    let availableTables = 0;
    
    for (const table of mainTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Таблица ${table}: ${error.message}`);
        } else {
          console.log(`✅ Таблица ${table} доступна`);
          availableTables++;
        }
      } catch (err) {
        console.log(`❌ Ошибка проверки таблицы ${table}:`, err.message);
      }
    }
    
    console.log(`\n📊 Доступно таблиц: ${availableTables}/${mainTables.length}`);
    
    // Проверяем функциональность систем
    console.log('\n🔍 Проверяем функциональность систем...');
    
    // Проверяем форум
    try {
      const { data: categories, error: catError } = await supabase
        .from('forum_categories')
        .select('*');
      
      if (catError) {
        console.log('❌ Форум: таблицы не созданы');
      } else {
        console.log(`✅ Форум: ${categories.length} категорий доступно`);
      }
    } catch (err) {
      console.log('❌ Форум: система не работает');
    }
    
    // Проверяем CAD/MDT
    try {
      const { data: characters, error: charError } = await supabase
        .from('characters')
        .select('*');
      
      if (charError) {
        console.log('❌ CAD/MDT: таблицы не созданы');
      } else {
        console.log(`✅ CAD/MDT: таблица characters доступна`);
      }
    } catch (err) {
      console.log('❌ CAD/MDT: система не работает');
    }
    
    // Проверяем рапорты
    try {
      const { data: templates, error: tempError } = await supabase
        .from('report_templates')
        .select('*');
      
      if (tempError) {
        console.log('❌ Рапорты: таблицы не созданы');
      } else {
        console.log(`✅ Рапорты: ${templates.length} шаблонов доступно`);
      }
    } catch (err) {
      console.log('❌ Рапорты: система не работает');
    }
    
    console.log('\n🎉 Применение всех миграций завершено!');
    console.log('\n📋 Что нужно проверить:');
    console.log('1. Форум: /forum');
    console.log('2. CAD/MDT: /cad');
    console.log('3. Рапорты: /reports');
    console.log('4. API endpoints');
    console.log('5. WebSocket соединения');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

applyAllMigrations(); 