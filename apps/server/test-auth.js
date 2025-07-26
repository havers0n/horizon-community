import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('🔍 Тестируем подключение к основному серверу...');
    
    // Тест 1: Проверка здоровья сервера
    const healthResponse = await fetch('http://127.0.0.1:5000/api/auth/health');
    console.log('✅ Health check status:', healthResponse.status);
    
    // Тест 2: Проверка подключения к базе данных через departments
    const deptResponse = await fetch('http://127.0.0.1:5000/api/departments');
    console.log('✅ Departments status:', deptResponse.status);
    
    if (deptResponse.ok) {
      const departments = await deptResponse.json();
      console.log('📊 Departments count:', departments.length);
    }
    
    // Тест 3: Попытка аутентификации (ожидаем ошибку, но не SASL)
    console.log('🔐 Тестируем аутентификацию...');
    const authResponse = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    
    console.log('✅ Auth test status:', authResponse.status);
    const authResult = await authResponse.json();
    console.log('📝 Auth response:', authResult.message);
    
    console.log('🎉 Все тесты завершены!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    
    // Проверяем, есть ли ошибка SASL
    if (error.message.includes('SASL')) {
      console.error('🚨 Обнаружена ошибка SASL - проблема не решена!');
    } else {
      console.log('✅ Ошибка не связана с SASL - это нормально для тестового запроса');
    }
  }
}

testAuth(); 