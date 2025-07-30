import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

async function testSchemaConnection() {
  console.log('🔍 Тестирование подключения к базе данных и проверка схем...\n');

  // Получаем строку подключения
  let connectionStringTemplate = process.env.DATABASE_URL;
  const dbPassword = process.env.DB_PASSWORD;

  if (!connectionStringTemplate || !dbPassword) {
    console.error('❌ DATABASE_URL и DB_PASSWORD должны быть установлены в .env файле!');
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
    console.log('✅ Подключение к базе данных установлено');

    // Тестируем схемы
    const schemas = ['public', 'common', 'mdt'];
    
    for (const schema of schemas) {
      console.log(`\n📋 Проверяем схему: ${schema}`);
      
      try {
        // Проверяем существование схемы
        const schemaResult = await pool.query(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name = $1
        `, [schema]);
        
        if (schemaResult.rows.length === 0) {
          console.log(`❌ Схема ${schema} не существует`);
          continue;
        }
        
        console.log(`✅ Схема ${schema} существует`);
        
        // Получаем список таблиц в схеме
        const tablesResult = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          ORDER BY table_name
        `, [schema]);
        
        if (tablesResult.rows.length === 0) {
          console.log(`⚠️  В схеме ${schema} нет таблиц`);
        } else {
          console.log(`📊 Таблицы в схеме ${schema}:`);
          tablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
          });
        }
        
        // Тестируем основные таблицы
        if (schema === 'public') {
          await testTable(pool, 'public.users', 'SELECT COUNT(*) FROM public.users');
          await testTable(pool, 'public.applications', 'SELECT COUNT(*) FROM public.applications');
          await testTable(pool, 'public.reports', 'SELECT COUNT(*) FROM public.reports');
        }
        
        if (schema === 'common') {
          await testTable(pool, 'common.departments', 'SELECT COUNT(*) FROM common.departments');
          await testTable(pool, 'common.characters', 'SELECT COUNT(*) FROM common.characters');
          await testTable(pool, 'common.vehicles', 'SELECT COUNT(*) FROM common.vehicles');
        }
        
        if (schema === 'mdt') {
          await testTable(pool, 'mdt.bolos', 'SELECT COUNT(*) FROM mdt.bolos');
          await testTable(pool, 'mdt.mdt_units', 'SELECT COUNT(*) FROM mdt.mdt_units');
          await testTable(pool, 'mdt.mdt_calls_911', 'SELECT COUNT(*) FROM mdt.mdt_calls_911');
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при проверке схемы ${schema}:`, error.message);
      }
    }

    console.log('\n🎯 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
  } finally {
    await pool.end();
  }
}

async function testTable(pool, tableName, query) {
  try {
    const result = await pool.query(query);
    console.log(`   ✅ ${tableName}: ${result.rows[0].count} записей`);
  } catch (error) {
    console.log(`   ❌ ${tableName}: ${error.message}`);
  }
}

// Запускаем тест
testSchemaConnection().catch(console.error); 