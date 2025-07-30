// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

async function testBoloAPI() {
  console.log('🔧 Тестирование BOLO API после исправления аутентификации...');
  
  try {
    // Тестируем запрос к BOLO API
    const response = await fetch('http://localhost:5000/api/mdt/bolos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token_1_1703123456789' // Тестовый токен
      }
    });

    console.log('📊 Статус ответа:', response.status);
    console.log('📊 Заголовки ответа:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ BOLO API работает!');
      console.log('📋 Данные:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Ошибка BOLO API:');
      console.log('📋 Ошибка:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании BOLO API:', error.message);
  }
}

// Ждем немного, чтобы сервер запустился
setTimeout(testBoloAPI, 3000); 