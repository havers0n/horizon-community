import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

async function testSchemas() {
  console.log('🔍 Проверка схем базы данных...\n');

  let connectionStringTemplate = process.env.DATABASE_URL;
  const dbPassword = process.env.DB_PASSWORD;

  if (!connectionStringTemplate || !dbPassword) {
    console.error('❌ DATABASE_URL и DB_PASSWORD должны быть установлены!');
    return;
  }

  const connectionString = connectionStringTemplate.replace(
    '[YOUR-PASSWORD]', 
    encodeURIComponent(dbPassword)
  );

  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('✅ Подключение установлено');

    // Проверяем схемы
    const schemas = ['public', 'common', 'mdt'];
    
    for (const schema of schemas) {
      console.log(`\n📋 Схема: ${schema}`);
      
      // Проверяем существование схемы
      const schemaResult = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `, [schema]);
      
      if (schemaResult.rows.length === 0) {
        console.log(`❌ Схема ${schema} не найдена`);
        continue;
      }
      
      console.log(`✅ Схема ${schema} найдена`);
      
      // Получаем таблицы в схеме
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        ORDER BY table_name
      `, [schema]);
      
      if (tablesResult.rows.length === 0) {
        console.log(`⚠️  В схеме ${schema} нет таблиц`);
      } else {
        console.log(`📊 Таблицы в ${schema}:`);
        tablesResult.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
      }
    }

    console.log('\n🎯 Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

testSchemas().catch(console.error); 