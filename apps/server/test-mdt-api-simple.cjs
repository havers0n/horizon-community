const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/mdt';

async function testMDTApiSimple() {
  console.log('🧪 Простое тестирование MDT API endpoints...\n');

  try {
    // Тестируем базовый endpoint
    console.log('📱 Тестирование GET /api/mdt/units');
    const response = await fetch(`${BASE_URL}/units`);
    
    console.log(`Статус ответа: ${response.status}`);
    console.log(`Заголовки:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Успешный ответ:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Ошибка:');
      console.log(errorText);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.message);
    console.error('Полная ошибка:', error);
  }
}

// Запускаем тестирование
if (require.main === module) {
  testMDTApiSimple()
    .then(() => {
      console.log('✅ Тестирование завершено');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка тестирования:', error);
      process.exit(1);
    });
}

module.exports = { testMDTApiSimple }; 