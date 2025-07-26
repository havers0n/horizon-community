import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../.env') });

console.log("🔍 Тестирование подключения к базе данных...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Настроен" : "НЕ НАСТРОЕН");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL не настроен!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

try {
  console.log("🔌 Подключаемся к базе данных...");
  const client = await pool.connect();
  
  console.log("✅ Подключение успешно!");
  
  // Проверяем таблицы в схеме public
  console.log("📋 Проверяем таблицы в схеме public...");
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  console.log(`📊 Найдено ${result.rows.length} таблиц в схеме public:`);
  result.rows.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  
  // Проверяем таблицу departments
  console.log("\n🔍 Проверяем таблицу departments...");
  const deptResult = await client.query(`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'departments'
  `);
  
  if (deptResult.rows[0].count > 0) {
    console.log("✅ Таблица departments найдена!");
    
    // Проверяем данные в departments
    const dataResult = await client.query('SELECT COUNT(*) as count FROM departments');
    console.log(`📊 В таблице departments: ${dataResult.rows[0].count} записей`);
  } else {
    console.log("❌ Таблица departments НЕ найдена!");
  }
  
  client.release();
  await pool.end();
  
  console.log("✅ Тест завершен успешно!");
  
} catch (error) {
  console.error("❌ Ошибка при подключении к базе данных:", error.message);
  process.exit(1);
} 