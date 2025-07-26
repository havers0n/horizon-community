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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false
});

async function migrateSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Начинаем миграцию схемы из dev_schema в public...');
    
    // Получаем список всех таблиц в dev_schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'dev_schema'
      ORDER BY table_name
    `);
    
    console.log(`📋 Найдено ${tablesResult.rows.length} таблиц для миграции`);
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n🔧 Мигрируем таблицу: ${tableName}`);
      
      try {
        // 1. Создаем таблицу в public схеме
        console.log(`   📝 Создаем структуру таблицы ${tableName}...`);
        const createTableResult = await client.query(`
          CREATE TABLE IF NOT EXISTS public.${tableName} AS 
          SELECT * FROM dev_schema.${tableName} WHERE 1=0
        `);
        
        // 2. Копируем данные
        console.log(`   📊 Копируем данные в ${tableName}...`);
        const copyResult = await client.query(`
          INSERT INTO public.${tableName} 
          SELECT * FROM dev_schema.${tableName}
        `);
        
        // 3. Получаем количество скопированных строк
        const countResult = await client.query(`
          SELECT COUNT(*) as count FROM public.${tableName}
        `);
        
        console.log(`   ✅ Таблица ${tableName} успешно мигрирована (${countResult.rows[0].count} записей)`);
        
      } catch (error) {
        console.error(`   ❌ Ошибка при миграции таблицы ${tableName}:`, error.message);
      }
    }
    
    // Создаем индексы и ограничения
    console.log('\n🔧 Создаем индексы и ограничения...');
    
    // Получаем информацию об индексах
    const indexesResult = await client.query(`
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'dev_schema'
      ORDER BY tablename, indexname
    `);
    
    for (const index of indexesResult.rows) {
      try {
        const newIndexName = index.indexname.replace('dev_schema_', 'public_');
        const newIndexDef = index.indexdef
          .replace('dev_schema.', 'public.')
          .replace(index.indexname, newIndexName);
        
        await client.query(newIndexDef);
        console.log(`   ✅ Создан индекс: ${newIndexName}`);
      } catch (error) {
        console.log(`   ⚠️  Пропускаем индекс ${index.indexname}: ${error.message}`);
      }
    }
    
    // Создаем последовательности (sequences)
    console.log('\n🔧 Создаем последовательности...');
    const sequencesResult = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'dev_schema'
    `);
    
    for (const seq of sequencesResult.rows) {
      try {
        const newSeqName = seq.sequence_name.replace('dev_schema_', 'public_');
        await client.query(`
          CREATE SEQUENCE IF NOT EXISTS public.${newSeqName}
        `);
        console.log(`   ✅ Создана последовательность: ${newSeqName}`);
      } catch (error) {
        console.log(`   ⚠️  Пропускаем последовательность ${seq.sequence_name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Миграция завершена успешно!');
    console.log('📊 Статистика:');
    
    // Показываем статистику
    const publicTablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`   - Таблиц в public: ${publicTablesResult.rows[0].count}`);
    
    const totalRecordsResult = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM public."${table.table_name}") as record_count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Количество записей в таблицах:');
    for (const table of totalRecordsResult.rows) {
      console.log(`   - ${table.table_name}: ${table.record_count} записей`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Функция для проверки существующих таблиц в public
async function checkPublicSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Проверяем схему public...');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Таблиц в public: ${tablesResult.rows.length}`);
    
    if (tablesResult.rows.length > 0) {
      console.log('   Существующие таблицы:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем миграцию
const command = process.argv[2];

if (command === 'check') {
  checkPublicSchema();
} else {
  migrateSchema();
} 