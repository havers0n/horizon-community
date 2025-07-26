import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Начинаем тест подключения...');
console.log('📁 Текущая директория:', __dirname);

// Загружаем .env из папки apps/server/
config({ path: resolve(__dirname, '.env') });

console.log('📋 .env файл загружен');

async function testNewConnection() {
  try {
    console.log('🔍 Тестируем новую логику подключения с DB_PASSWORD...');
    
    // 1. Получаем ШАБЛОН строки подключения
    let connectionStringTemplate = process.env.DATABASE_URL;
    console.log('📋 DATABASE_URL template:', connectionStringTemplate ? 'Найден' : 'НЕ найден');
    
    // 2. Получаем пароль из отдельной переменной
    const dbPassword = process.env.DB_PASSWORD;
    console.log('🔑 DB_PASSWORD:', dbPassword ? 'Найден' : 'НЕ найден');
    
    // 3. Проверяем, что все переменные на месте
    if (!connectionStringTemplate || !dbPassword) {
      throw new Error("DATABASE_URL и DB_PASSWORD должны быть установлены в .env файле!");
    }
    
    // 4. Подставляем пароль в шаблон
    const connectionString = connectionStringTemplate.replace(
      '[YOUR-PASSWORD]', 
      encodeURIComponent(dbPassword)
    );
    
    console.log('🔗 Final connection string (masked):', connectionString.replace(/:(.*)@/, ':***@'));
    
    // 5. Тестируем подключение
    const pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    const client = await pool.connect();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Простой тестовый запрос
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Время сервера БД:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Тест новой логики подключения прошел успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    process.exit(1);
  }
}

console.log('🔄 Запускаем тест...');
testNewConnection(); 