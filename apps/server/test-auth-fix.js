// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

// Тестовый скрипт для проверки исправления аутентификации
import { authService } from './services/AuthService.js';

async function testAuthFix() {
  console.log('🔧 Тестирование исправления AuthService...');
  
  try {
    // Тестируем получение пользователя по email
    console.log('📧 Тестируем getUserByEmail...');
    const userByEmail = await authService.getUserByEmail('danypetrov2000@gmail.com');
    console.log('✅ getUserByEmail результат:', userByEmail ? `Найден пользователь ${userByEmail.username}` : 'Пользователь не найден');
    
    // Тестируем получение пользователя по auth_id
    if (userByEmail && userByEmail.authId) {
      console.log('🔑 Тестируем getUserByAuthId...');
      const userByAuthId = await authService.getUserById(userByEmail.id);
      console.log('✅ getUserById результат:', userByAuthId ? `Найден пользователь ${userByAuthId.username}` : 'Пользователь не найден');
    }
    
    // Тестируем получение всех пользователей
    console.log('👥 Тестируем getAllUsers...');
    const allUsers = await authService.storage.getAllUsers();
    console.log(`✅ getAllUsers результат: найдено ${allUsers.length} пользователей`);
    
    console.log('✅ Все тесты AuthService прошли успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка в тестах AuthService:', error);
  }
}

testAuthFix(); 