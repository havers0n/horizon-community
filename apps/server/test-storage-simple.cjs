const { config } = require('dotenv');
const { resolve } = require('path');

// Загружаем .env из корневой папки проекта
config({ path: resolve(__dirname, '../../.env') });

console.log('🔍 Тестируем простые операции storage...');

// Импортируем storage напрямую
const { storage } = require('./storage');

async function testStorage() {
  try {
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Настроен' : 'НЕ настроен');
    
    // Тест 1: Получение департаментов
    console.log('🔍 Тест 1: getAllDepartments...');
    const departments = await storage.getAllDepartments();
    console.log('✅ Departments получены:', departments.length);
    
    // Тест 2: Получение пользователей
    console.log('🔍 Тест 2: getAllUsers...');
    const users = await storage.getAllUsers();
    console.log('✅ Users получены:', users.length);
    
    // Тест 3: Поиск пользователя по email
    console.log('🔍 Тест 3: getUserByEmail...');
    const email = 'danypetrov2000@gmail.com';
    const user = await storage.getUserByEmail(email);
    console.log('✅ getUserByEmail выполнен:', user ? 'Пользователь найден' : 'Пользователь не найден');
    
    if (user) {
      console.log(`   ID: ${user.id}, Username: ${user.username}, Auth ID: ${user.auth_id}`);
    }
    
    console.log('🎉 Все тесты storage прошли успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка в storage:', error.message);
    
    if (error.message.includes('SASL')) {
      console.error('🚨 Обнаружена ошибка SASL в storage!');
    } else {
      console.log('ℹ️ Ошибка не связана с SASL');
    }
  }
}

testStorage(); 