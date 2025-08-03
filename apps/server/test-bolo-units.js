import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

async function testBoloAndUnits() {
  console.log('🔍 Тестирование BOLO и Units...\n');

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

    // Тестируем BOLO
    console.log('\n📋 Тестирование BOLO:');
    try {
      const boloResult = await pool.query('SELECT COUNT(*) FROM public.get_active_bolos_with_author()');
      console.log(`   ✅ BOLO: ${boloResult.rows[0].count} записей`);
    } catch (error) {
      console.log(`   ❌ BOLO: ${error.message}`);
    }

    // Тестируем Units
    console.log('\n📋 Тестирование Units:');
    try {
      const unitsResult = await pool.query('SELECT COUNT(*) FROM public.get_all_mdt_units()');
      console.log(`   ✅ Units: ${unitsResult.rows[0].count} записей`);
    } catch (error) {
      console.log(`   ❌ Units: ${error.message}`);
    }

    // Тестируем Calls
    console.log('\n📋 Тестирование Calls:');
    try {
      const callsResult = await pool.query('SELECT COUNT(*) FROM public.get_all_mdt_calls()');
      console.log(`   ✅ Calls: ${callsResult.rows[0].count} записей`);
    } catch (error) {
      console.log(`   ❌ Calls: ${error.message}`);
    }

    // Тестируем Departments
    console.log('\n📋 Тестирование Departments:');
    try {
      const deptResult = await pool.query('SELECT COUNT(*) FROM public.get_all_departments()');
      console.log(`   ✅ Departments: ${deptResult.rows[0].count} записей`);
    } catch (error) {
      console.log(`   ❌ Departments: ${error.message}`);
    }

    // Тестируем Characters
    console.log('\n📋 Тестирование Characters:');
    try {
      const charResult = await pool.query('SELECT COUNT(*) FROM public.get_all_characters()');
      console.log(`   ✅ Characters: ${charResult.rows[0].count} записей`);
    } catch (error) {
      console.log(`   ❌ Characters: ${error.message}`);
    }

    console.log('\n🎯 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

testBoloAndUnits().catch(console.error); 