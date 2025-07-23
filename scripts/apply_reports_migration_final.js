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

async function applyReportsMigrationFinal() {
  try {
    console.log('🚀 ФИНАЛЬНОЕ ПРИМЕНЕНИЕ МИГРАЦИИ СИСТЕМЫ РАПОРТОВ...');
    
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
    
    // Применяем миграции по порядку
    const migrations = [
      '010_report_templates_system.sql',
      '011_enhanced_report_templates.sql',
      '012_add_template_status.sql'
    ];
    
    for (const migrationFile of migrations) {
      console.log(`\n📄 Применяем миграцию: ${migrationFile}`);
      
      const migrationPath = path.join(__dirname, `../supabase/migrations/${migrationFile}`);
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
      
      console.log(`📊 Результаты ${migrationFile}:`);
      console.log(`✅ Успешно: ${successCount}`);
      console.log(`❌ Ошибок: ${errorCount}`);
    }
    
    // Проверяем создание таблиц
    console.log('\n🔍 Проверяем создание таблиц...');
    
    const tablesToCheck = [
      'report_templates',
      'filled_reports'
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
      const { data: templates, error: templatesError } = await supabase
        .from('report_templates')
        .select('*');
      
      if (templatesError) {
        console.log('❌ Ошибка получения шаблонов:', templatesError.message);
      } else {
        console.log(`✅ Найдено ${templates.length} шаблонов рапортов`);
        
        // Показываем категории шаблонов
        const categories = [...new Set(templates.map(t => t.category))];
        console.log(`📋 Категории: ${categories.join(', ')}`);
      }
    } catch (err) {
      console.log('❌ Ошибка проверки данных:', err.message);
    }
    
    // Проверяем новые поля
    console.log('\n🔍 Проверяем новые поля...');
    
    try {
      const { data: sampleTemplate, error: sampleError } = await supabase
        .from('report_templates')
        .select('title, category, difficulty, tags, required_fields')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Ошибка проверки новых полей:', sampleError.message);
      } else if (sampleTemplate.length > 0) {
        console.log('✅ Новые поля доступны:');
        console.log(`   - category: ${sampleTemplate[0].category}`);
        console.log(`   - difficulty: ${sampleTemplate[0].difficulty}`);
        console.log(`   - tags: ${sampleTemplate[0].tags?.length || 0} тегов`);
        console.log(`   - required_fields: ${sampleTemplate[0].required_fields?.length || 0} полей`);
      }
    } catch (err) {
      console.log('❌ Ошибка проверки новых полей:', err.message);
    }
    
    console.log('\n🎉 Миграция системы рапортов завершена!');
    console.log('\n📋 Что нужно проверить:');
    console.log('1. Откройте /reports в браузере');
    console.log('2. Проверьте вкладку "Шаблоны"');
    console.log('3. Проверьте фильтрацию по категориям');
    console.log('4. Попробуйте создать рапорт');
    console.log('5. Проверьте API endpoints');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

applyReportsMigrationFinal(); 