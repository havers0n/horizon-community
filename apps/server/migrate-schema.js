import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

console.log("🔄 Запуск миграции схемы базы данных...");

// БЕЗОПАСНАЯ ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ КРИТИЧЕСКАЯ ОШИБКА: DATABASE_URL не установлен!");
  console.error("Установите переменную окружения DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function migrateSchema() {
  try {
    console.log("🔌 Подключаемся к базе данных...");
    const client = await pool.connect();
    
    console.log("✅ Подключение успешно!");
    
    // Читаем SQL файлы из папки supabase/migrations
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.error("❌ Папка migrations не найдена:", migrationsDir);
      process.exit(1);
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Сортируем по алфавиту для правильного порядка
    
    console.log(`📁 Найдено ${migrationFiles.length} файлов миграции`);
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`\n🔄 Применяем миграцию: ${file}`);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`✅ Миграция ${file} применена успешно`);
      } catch (error) {
        console.error(`❌ Ошибка при применении миграции ${file}:`, error.message);
        // Продолжаем с другими миграциями
      }
    }
    
    // Проверяем результат
    console.log("\n📊 Проверяем результат миграции...");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log("📋 Созданные таблицы:");
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log("\n✅ Миграция схемы завершена успешно!");
    
  } catch (error) {
    console.error("❌ Ошибка при миграции:", error.message);
    process.exit(1);
  }
}

migrateSchema(); 