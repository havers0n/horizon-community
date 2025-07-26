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

async function applyMigrationSimple() {
  try {
    console.log('🚀 ПРОСТОЕ ПРИМЕНЕНИЕ МИГРАЦИИ...');
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
    
    // Применяем миграцию через прямые SQL команды
    console.log('\n🔧 Применяем миграцию ExtendUsersAndCharacters...');
    console.log('-'.repeat(50));
    
    // SQL команды для добавления полей в таблицу users
    const usersCommands = [
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_2fa" boolean DEFAULT false NOT NULL',
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_dark_theme" boolean DEFAULT false NOT NULL',
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sound_settings" jsonb DEFAULT \'{}\'::jsonb',
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_token" text',
      'ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_api_token_unique" UNIQUE("api_token")'
    ];
    
    // SQL команды для добавления полей в таблицу characters
    const charactersCommands = [
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "gender" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "ethnicity" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "height" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "weight" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "hair_color" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "eye_color" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "phone_number" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "postal" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "occupation" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "dead" boolean DEFAULT false',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "date_of_dead" date',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "missing" boolean DEFAULT false',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "arrested" boolean DEFAULT false',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "callsign" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "callsign2" text',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "suspended" boolean DEFAULT false',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "whitelist_status" text DEFAULT \'PENDING\'',
      'ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "radio_channel_id" text'
    ];
    
    const allCommands = [...usersCommands, ...charactersCommands];
    
    console.log(`🔧 Найдено ${allCommands.length} SQL команд для выполнения`);
    
    // Выполняем команды по очереди
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allCommands.length; i++) {
      const command = allCommands[i];
      try {
        console.log(`  🔄 Выполняем команду ${i + 1}/${allCommands.length}...`);
        console.log(`     SQL: ${command.substring(0, 60)}...`);
        
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
    
    console.log(`\n📊 Результаты выполнения SQL команд:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    
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
    
    console.log('\n🎉 Применение миграции завершено!');
    
    // Если есть ошибки, предлагаем альтернативный способ
    if (errorCount > 0) {
      console.log('\n📋 АЛЬТЕРНАТИВНЫЕ СПОСОБЫ ПРИМЕНЕНИЯ МИГРАЦИИ:');
      console.log('1. Применить миграцию через Supabase Dashboard (SQL Editor)');
      console.log('2. Использовать Supabase CLI с правильными credentials');
      console.log('3. Создать функцию exec_sql в базе данных');
      console.log('\n📄 SQL команды для ручного применения:');
      console.log('='.repeat(50));
      allCommands.forEach((cmd, index) => {
        console.log(`${index + 1}. ${cmd}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

applyMigrationSimple(); 