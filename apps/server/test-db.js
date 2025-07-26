import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../../.env') });

// Устанавливаем DATABASE_URL напрямую для тестирования
process.env.DATABASE_URL = 'postgresql://postgres.axgtvvcimqoyxbfvdrok:TtaW3kLHu9xojVOt@aws-0-eu-north-1.pooler.supabase.com:5432/postgres';

console.log('🔍 Тестируем подключение к базе данных...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Найден' : 'Не найден');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('🔌 Подключаемся к базе данных...');
    const client = await pool.connect();
    console.log('✅ Подключение успешно!');
    
    // Проверяем версию PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Версия PostgreSQL:', versionResult.rows[0].version);
    
    // Проверяем существующие схемы
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('public', 'dev_schema')
      ORDER BY schema_name
    `);
    
    console.log('📋 Найденные схемы:');
    schemasResult.rows.forEach(row => {
      console.log(`   - ${row.schema_name}`);
    });
    
    // Проверяем таблицы в dev_schema
    if (schemasResult.rows.some(row => row.schema_name === 'dev_schema')) {
      console.log('\n🔍 Проверяем таблицы в dev_schema...');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'dev_schema'
        ORDER BY table_name
      `);
      
      if (tablesResult.rows.length === 0) {
        console.log('   Нет таблиц в схеме dev_schema');
      } else {
        console.log('   Таблицы в dev_schema:');
        tablesResult.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.table_name}`);
        });
      }
    }
    
    client.release();
    console.log('\n✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.error('Детали ошибки:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 