import 'dotenv/config';

console.log('🔍 Тестирование подключения клиент-сервер...\n');

// Тест 1: Проверка прямого подключения к серверу
async function testDirectServerConnection() {
  console.log('📡 Тест 1: Прямое подключение к серверу (порт 5000)');
  
  try {
    const response = await fetch('http://127.0.0.1:5000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Сервер отвечает:', data);
    } else {
      console.log('❌ Сервер отвечает с ошибкой:', response.status, response.statusText);
    }
  } catch (error: any) {
    console.log('❌ Не удалось подключиться к серверу:', error.message);
  }
}

// Тест 2: Проверка через прокси клиента
async function testClientProxyConnection() {
  console.log('\n📡 Тест 2: Подключение через прокси клиента (порт 3000)');
  
  try {
    const response = await fetch('http://127.0.0.1:3000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Клиентский прокси работает:', data);
    } else {
      console.log('❌ Клиентский прокси отвечает с ошибкой:', response.status, response.statusText);
    }
  } catch (error: any) {
    console.log('❌ Не удалось подключиться через клиентский прокси:', error.message);
  }
}

// Тест 3: Проверка аутентификации
async function testAuthEndpoint() {
  console.log('\n🔐 Тест 3: Проверка эндпоинта аутентификации');
  
  try {
    const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }),
    });
    
    console.log('📊 Статус ответа:', response.status);
    console.log('📊 Заголовки:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Аутентификация работает:', data);
    } else {
      const errorData = await response.text();
      console.log('⚠️ Ожидаемая ошибка аутентификации:', errorData);
    }
  } catch (error: any) {
    console.log('❌ Ошибка при тестировании аутентификации:', error.message);
  }
}

// Тест 4: Проверка CORS
async function testCORS() {
  console.log('\n🌐 Тест 4: Проверка CORS заголовков');
  
  try {
    const response = await fetch('http://127.0.0.1:5000/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://127.0.0.1:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    console.log('📊 CORS статус:', response.status);
    console.log('📊 CORS заголовки:');
    console.log('  Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
    console.log('  Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
    console.log('  Access-Control-Allow-Headers:', response.headers.get('Access-Control-Allow-Headers'));
  } catch (error: any) {
    console.log('❌ Ошибка при проверке CORS:', error.message);
  }
}

// Запуск всех тестов
async function runAllTests() {
  await testDirectServerConnection();
  await testClientProxyConnection();
  await testAuthEndpoint();
  await testCORS();
  
  console.log('\n🎯 Тестирование завершено!');
  console.log('\n📝 Рекомендации:');
  console.log('1. Если тест 1 не прошел - сервер не запущен на порту 5000');
  console.log('2. Если тест 2 не прошел - клиент не запущен на порту 3000');
  console.log('3. Если тест 3 показал ошибку сети - проблема с CORS или прокси');
  console.log('4. Если тест 4 не прошел - проблема с CORS настройками');
}

runAllTests(); 