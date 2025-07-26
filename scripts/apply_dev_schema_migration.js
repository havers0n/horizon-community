import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function applyDevSchemaMigration() {
  console.log('🚀 ПРИМЕНЕНИЕ МИГРАЦИИ К DEV_SCHEMA...');
  console.log('='.repeat(50));
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Создаем схему dev_schema если она не существует
    console.log('📋 Создаем схему dev_schema если не существует...');
    await client.query('CREATE SCHEMA IF NOT EXISTS dev_schema');
    
    // Устанавливаем схему поиска
    await client.query('SET search_path TO dev_schema, public');
    
    console.log('✅ Схема dev_schema готова к работе');
    
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
    console.log('-'.repeat(50));
    
    // Выполняем команды по очереди
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allCommands.length; i++) {
      const command = allCommands[i];
      try {
        console.log(`  🔄 Выполняем команду ${i + 1}/${allCommands.length}...`);
        console.log(`     SQL: ${command.substring(0, 60)}...`);
        
        await client.query(command);
        console.log(`    ✅ Команда выполнена успешно`);
        successCount++;
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
      const usersResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'dev_schema' 
        AND table_name = 'users' 
        AND column_name IN ('has_2fa', 'is_dark_theme', 'sound_settings', 'api_token')
        ORDER BY column_name
      `);
      
      if (usersResult.rows.length > 0) {
        console.log('✅ Новые поля в таблице users добавлены успешно:');
        usersResult.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      } else {
        console.log('❌ Поля в таблице users не найдены');
      }
    } catch (error) {
      console.log('❌ Ошибка проверки таблицы users:', error.message);
    }
    
    // Проверяем новые поля в таблице characters
    try {
      const charsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'dev_schema' 
        AND table_name = 'characters' 
        AND column_name IN ('gender', 'ethnicity', 'height', 'weight', 'hair_color', 'eye_color', 'phone_number', 'postal', 'occupation', 'dead', 'date_of_dead', 'missing', 'arrested', 'callsign', 'callsign2', 'suspended', 'whitelist_status', 'radio_channel_id')
        ORDER BY column_name
      `);
      
      if (charsResult.rows.length > 0) {
        console.log('✅ Новые поля в таблице characters добавлены успешно:');
        charsResult.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      } else {
        console.log('❌ Поля в таблице characters не найдены');
      }
    } catch (error) {
      console.log('❌ Ошибка проверки таблицы characters:', error.message);
    }
    
    console.log('\n🎉 Применение миграции к dev_schema завершено!');
    
    // Если есть ошибки, предлагаем альтернативный способ
    if (errorCount > 0) {
      console.log('\n📋 АЛЬТЕРНАТИВНЫЕ СПОСОБЫ ПРИМЕНЕНИЯ МИГРАЦИИ:');
      console.log('1. Применить миграцию через Supabase Dashboard (SQL Editor)');
      console.log('2. Проверить существование таблиц в dev_schema');
      console.log('3. Создать таблицы если они не существуют');
      console.log('\n📄 SQL команды для ручного применения:');
      console.log('='.repeat(50));
      allCommands.forEach((cmd, index) => {
        console.log(`${index + 1}. ${cmd}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyDevSchemaMigration()
  .then(() => {
    console.log('✅ Скрипт применения миграции к dev_schema завершен');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Скрипт применения миграции к dev_schema завершился с ошибкой:', error);
    process.exit(1);
  }); 