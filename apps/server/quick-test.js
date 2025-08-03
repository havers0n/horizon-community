import { Pool } from 'pg';

console.log("🔍 Быстрый тест базы данных...");

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

async function testDatabase() {
  try {
    console.log("🔌 Подключаемся к базе данных...");
    const client = await pool.connect();
    
    console.log("✅ Подключение успешно!");
    
    // Тест 1: Проверяем departments
    console.log("\n🏢 Тест 1: Проверяем таблицу departments...");
    const deptResult = await client.query('SELECT * FROM departments LIMIT 3');
    console.log(`📊 Найдено ${deptResult.rows.length} департаментов:`);
    deptResult.rows.forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.name} (${dept.full_name})`);
    });
    
    // Тест 2: Проверяем users
    console.log("\n👥 Тест 2: Проверяем таблицу users...");
    const userResult = await client.query('SELECT id, username, email, role FROM users LIMIT 3');
    console.log(`📊 Найдено ${userResult.rows.length} пользователей:`);
    userResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
    });
    
    // Тест 3: Проверяем characters
    console.log("\n🎭 Тест 3: Проверяем таблицу characters...");
    const charResult = await client.query('SELECT id, first_name, last_name, type FROM characters LIMIT 3');
    console.log(`📊 Найдено ${charResult.rows.length} персонажей:`);
    charResult.rows.forEach((char, index) => {
      console.log(`  ${index + 1}. ${char.first_name} ${char.last_name} (${char.type})`);
    });
    
    // Тест 4: Проверяем общую статистику
    console.log("\n📊 Тест 4: Общая статистика...");
    const statsResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM departments) as departments_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM characters) as characters_count,
        (SELECT COUNT(*) FROM applications) as applications_count
    `);
    
    const stats = statsResult.rows[0];
    console.log(`📈 Статистика базы данных:`);
    console.log(`  - Департаменты: ${stats.departments_count}`);
    console.log(`  - Пользователи: ${stats.users_count}`);
    console.log(`  - Персонажи: ${stats.characters_count}`);
    console.log(`  - Заявки: ${stats.applications_count}`);
    
    client.release();
    await pool.end();
    
    console.log("\n✅ Все тесты прошли успешно!");
    console.log("🎉 База данных работает корректно!");
    
  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error.message);
    process.exit(1);
  }
}

testDatabase(); 