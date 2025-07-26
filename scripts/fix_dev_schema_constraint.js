import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixDevSchemaConstraint() {
  console.log('🔧 ИСПРАВЛЕНИЕ ОГРАНИЧЕНИЯ В DEV_SCHEMA...');
  console.log('='.repeat(50));
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Устанавливаем схему поиска
    await client.query('SET search_path TO dev_schema, public');
    
    console.log('🔍 Проверяем существование ограничения...');
    
    // Проверяем, существует ли уже ограничение
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'dev_schema' 
      AND table_name = 'users' 
      AND constraint_name = 'users_api_token_unique'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log('✅ Ограничение users_api_token_unique уже существует');
    } else {
      console.log('🔧 Добавляем уникальное ограничение для api_token...');
      
      try {
        await client.query(`
          ALTER TABLE "users" ADD CONSTRAINT "users_api_token_unique" UNIQUE("api_token")
        `);
        console.log('✅ Уникальное ограничение добавлено успешно');
      } catch (error) {
        if (error.message.includes('duplicate key value')) {
          console.log('⚠️  Обнаружены дублирующиеся значения api_token, очищаем...');
          
          // Очищаем дублирующиеся значения
          await client.query(`
            UPDATE "users" SET "api_token" = NULL WHERE "api_token" IN (
              SELECT "api_token" FROM "users" 
              WHERE "api_token" IS NOT NULL 
              GROUP BY "api_token" 
              HAVING COUNT(*) > 1
            )
          `);
          
          // Теперь добавляем ограничение
          await client.query(`
            ALTER TABLE "users" ADD CONSTRAINT "users_api_token_unique" UNIQUE("api_token")
          `);
          console.log('✅ Уникальное ограничение добавлено после очистки дубликатов');
        } else {
          throw error;
        }
      }
    }
    
    // Финальная проверка
    console.log('\n🔍 Финальная проверка структуры таблиц...');
    
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'dev_schema' 
      AND table_name = 'users' 
      AND column_name IN ('has_2fa', 'is_dark_theme', 'sound_settings', 'api_token')
      ORDER BY column_name
    `);
    
    const charsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'dev_schema' 
      AND table_name = 'characters' 
      AND column_name IN ('gender', 'ethnicity', 'height', 'weight', 'hair_color', 'eye_color', 'phone_number', 'postal', 'occupation', 'dead', 'date_of_dead', 'missing', 'arrested', 'callsign', 'callsign2', 'suspended', 'whitelist_status', 'radio_channel_id')
      ORDER BY column_name
    `);
    
    console.log(`\n📊 ИТОГОВАЯ СТАТИСТИКА:`);
    console.log(`✅ Поля в таблице users: ${usersColumns.rows.length}/4`);
    console.log(`✅ Поля в таблице characters: ${charsColumns.rows.length}/18`);
    
    if (usersColumns.rows.length === 4 && charsColumns.rows.length === 18) {
      console.log('\n🎉 ВСЕ ПОЛЯ УСПЕШНО ДОБАВЛЕНЫ В DEV_SCHEMA!');
      console.log('\n📋 Добавленные поля из SnailyCAD:');
      console.log('='.repeat(50));
      
      console.log('\n👤 USERS:');
      usersColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      console.log('\n👥 CHARACTERS:');
      charsColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('\n⚠️  Некоторые поля не были добавлены');
    }
    
  } catch (error) {
    console.error('❌ Ошибка исправления ограничения:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDevSchemaConstraint()
  .then(() => {
    console.log('\n✅ Исправление ограничений завершено');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }); 