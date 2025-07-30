import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

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
  
  // Проверяем пользователя
  console.log("\n🔍 Проверяем пользователя...");
  const authId = 'c65bfdf0-820b-449a-b798-f853090da2c4';
  const email = 'danypetrov2000@gmail.com';
  
  // Проверяем по auth_id
  const userResult = await client.query(
    'SELECT * FROM public.users WHERE auth_id = $1',
    [authId]
  );
  
  if (userResult.rows.length > 0) {
    console.log("✅ Пользователь найден по auth_id:", userResult.rows[0]);
  } else {
    console.log("❌ Пользователь НЕ найден по auth_id");
    
    // Проверяем по email
    const emailResult = await client.query(
      'SELECT * FROM public.users WHERE email = $1',
      [email]
    );
    
    if (emailResult.rows.length > 0) {
      console.log("✅ Пользователь найден по email:", emailResult.rows[0]);
    } else {
      console.log("❌ Пользователь НЕ найден по email");
    }
  }
  
  client.release();
  await pool.end();
  
  console.log("✅ Тест завершен успешно!");
  
} catch (error) {
  console.error("❌ Ошибка при подключении к базе данных:", error.message);
  process.exit(1);
} 