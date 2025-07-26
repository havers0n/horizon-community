import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

async function checkSchema() {
  try {
    console.log('🔍 Проверяем схему dev_schema...');
    
    // Проверяем существование схемы
    const schemaResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'dev_schema'
    `);
    
    if (schemaResult.rows.length === 0) {
      console.log('❌ Схема dev_schema не существует');
      return;
    }
    
    console.log('✅ Схема dev_schema существует');
    
    // Получаем список всех таблиц в схеме
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'dev_schema'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Таблицы в схеме dev_schema:');
    if (tablesResult.rows.length === 0) {
      console.log('   Нет таблиц');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    // Проверяем структуру каждой таблицы
    for (const table of tablesResult.rows) {
      console.log(`\n🔍 Структура таблицы ${table.table_name}:`);
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'dev_schema' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке схемы:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema(); 