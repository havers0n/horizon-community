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

async function applyDrizzleMigration() {
  try {
    console.log('🚀 ПРИМЕНЕНИЕ МИГРАЦИИ DRIZZLE...');
    console.log('='.repeat(50));
    
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
    
    // Применяем миграцию ExtendUsersAndCharacters
    const migrationFile = '0003_ExtendUsersAndCharacters.sql';
    console.log(`\n📄 Применяем миграцию: ${migrationFile}`);
    console.log('-'.repeat(50));
    
    try {
      const migrationPath = path.join(process.cwd(), 'migrations', migrationFile);
      
      // Проверяем существование файла
      try {
        await fs.access(migrationPath);
      } catch (err) {
        console.error(`❌ Файл ${migrationFile} не найден`);
        process.exit(1);
      }
      
      const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
      
      // Разбиваем SQL на отдельные команды
      const commands = migrationSQL
        .split('--> statement-breakpoint')
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
            console.log(`  🔄 Выполняем команду ${i + 1}/${commands.length}...`);
            
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
              const errorText = await response.text();
              console.error(`    ❌ Ошибка выполнения команды: ${errorText}`);
              errorCount++;
            } else {
              console.log(`    ✅ Команда выполнена успешно`);
              successCount++;
            }
          } catch (error) {
            console.error(`    ❌ Ошибка выполнения команды: ${error.message}`);
            errorCount++;
          }
        }
      }
      
      console.log(`\n📊 Результаты выполнения миграции ${migrationFile}:`);
      console.log(`✅ Успешно: ${successCount}`);
      console.log(`❌ Ошибок: ${errorCount}`);
      
    } catch (error) {
      console.error(`❌ Ошибка при применении миграции ${migrationFile}:`, error.message);
    }
    
    // Проверяем результат
    console.log('\n🔍 Проверяем результат применения миграции...');
    
    // Проверяем новые поля в таблице users
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('has_2fa, is_dark_theme, sound_settings, api_token')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Поля в таблице users не найдены:', usersError.message);
      } else {
        console.log('✅ Новые поля в таблице users добавлены успешно');
      }
    } catch (error) {
      console.log('❌ Ошибка проверки таблицы users:', error.message);
    }
    
    // Проверяем новые поля в таблице characters
    try {
      const { data: charsData, error: charsError } = await supabase
        .from('characters')
        .select('gender, ethnicity, height, weight, hair_color, eye_color, phone_number, postal, occupation, dead, date_of_dead, missing, arrested, callsign, callsign2, suspended, whitelist_status, radio_channel_id')
        .limit(1);
      
      if (charsError) {
        console.log('❌ Поля в таблице characters не найдены:', charsError.message);
      } else {
        console.log('✅ Новые поля в таблице characters добавлены успешно');
      }
    } catch (error) {
      console.log('❌ Ошибка проверки таблицы characters:', error.message);
    }
    
    console.log('\n🎉 Применение миграции Drizzle завершено!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

applyDrizzleMigration(); 