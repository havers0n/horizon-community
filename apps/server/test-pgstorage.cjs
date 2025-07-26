const { config } = require('dotenv');
const { resolve } = require('path');

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../.env') });

const { PgStorage } = require('./db/PgStorage');
const { pool } = require('./db/index');

console.log('🔍 Тестируем PgStorage с единым пулом...');

async function testPgStorage() {
  try {
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Настроен' : 'НЕ настроен');
    
    // Создаем PgStorage с переданным пулом
    const storage = new PgStorage(pool);
    console.log('✅ PgStorage создан с единым пулом');
    
    // Тестируем подключение через PgStorage
    console.log('🔌 Тестируем подключение через PgStorage...');
    
    // Проверяем таблицу departments
    const departments = await storage.getAllDepartments();
    console.log('✅ Departments получены:', departments.length);
    
    // Проверяем таблицу users
    const users = await storage.getAllUsers();
    console.log('✅ Users получены:', users.length);
    
    // Тестируем поиск пользователя по auth_id
    console.log('🔍 Тестируем getUserByAuthId...');
    const testAuthId = 'c65bfdf0-820b-449a-b798-f853090da2c4'; // ID из логов
    const user = await storage.getUserByAuthId(testAuthId);
    console.log('✅ getUserByAuthId выполнен:', user ? 'Пользователь найден' : 'Пользователь не найден');
    
    console.log('🎉 PgStorage работает корректно!');
    
  } catch (error) {
    console.error('❌ Ошибка в PgStorage:', error.message);
    
    if (error.message.includes('SASL')) {
      console.error('🚨 Обнаружена ошибка SASL в PgStorage!');
    } else {
      console.log('ℹ️ Ошибка не связана с SASL');
    }
  }
}

testPgStorage(); 