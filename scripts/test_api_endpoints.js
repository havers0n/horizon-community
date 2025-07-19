import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const API_BASE = 'http://localhost:5000';

// Функция для выполнения запросов
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = await response.text();
  }
  
  return {
    status: response.status,
    data,
    ok: response.ok
  };
}

// Тестовые функции
async function testPublicEndpoints() {
  console.log('🔍 Тестирование публичных endpoints...');
  
  // Тест получения департаментов
  const departments = await apiRequest('/api/departments');
  console.log('GET /api/departments:', departments.status, departments.ok ? '✅' : '❌');
  
  return departments.ok;
}

async function testRegistration() {
  console.log('\n📝 Тестирование регистрации...');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123'
  };
  
  const result = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  console.log('POST /api/auth/register:', result.status, result.ok ? '✅' : '❌');
  if (!result.ok) {
    console.log('Error:', result.data);
  }
  
  return result.ok ? { user: result.data.user, testUser } : null;
}

async function testLogin(credentials) {
  console.log('\n🔐 Тестирование входа...');
  
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  
  console.log('POST /api/auth/login:', result.status, result.ok ? '✅' : '❌');
  if (!result.ok) {
    console.log('Error:', result.data);
  }
  
  return result.ok ? result.data : null;
}

async function testProtectedEndpoints(token) {
  console.log('\n🛡️  Тестирование защищенных endpoints...');
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Тест получения профиля
  const profile = await apiRequest('/api/auth/me', { headers });
  console.log('GET /api/auth/me:', profile.status, profile.ok ? '✅' : '❌');
  
  // Тест получения заявок пользователя
  const applications = await apiRequest('/api/applications', { headers });
  console.log('GET /api/applications:', applications.status, applications.ok ? '✅' : '❌');
  
  // Тест получения уведомлений
  const notifications = await apiRequest('/api/notifications', { headers });
  console.log('GET /api/notifications:', notifications.status, notifications.ok ? '✅' : '❌');
  
  return profile.ok && applications.ok && notifications.ok;
}

async function testWithoutToken() {
  console.log('\n🚫 Тестирование доступа без токена...');
  
  const result = await apiRequest('/api/auth/me');
  console.log('GET /api/auth/me (без токена):', result.status, result.status === 401 ? '✅' : '❌');
  
  return result.status === 401;
}

async function main() {
  console.log('🚀 Запуск тестов API endpoints...\n');
  
  try {
    // Тест публичных endpoints
    const publicOk = await testPublicEndpoints();
    
    // Тест регистрации
    const registrationResult = await testRegistration();
    
    if (registrationResult) {
      // Тест входа
      const loginResult = await testLogin(registrationResult.testUser);
      
      if (loginResult && loginResult.session) {
        // Тест защищенных endpoints
        const protectedOk = await testProtectedEndpoints(loginResult.session.access_token);
        
        // Тест без токена
        const withoutTokenOk = await testWithoutToken();
        
        console.log('\n📊 Результаты тестов:');
        console.log('Публичные endpoints:', publicOk ? '✅' : '❌');
        console.log('Регистрация:', registrationResult ? '✅' : '❌');
        console.log('Вход:', loginResult ? '✅' : '❌');
        console.log('Защищенные endpoints:', protectedOk ? '✅' : '❌');
        console.log('Защита без токена:', withoutTokenOk ? '✅' : '❌');
        
        const allPassed = publicOk && registrationResult && loginResult && protectedOk && withoutTokenOk;
        console.log('\n🎉 Все тесты:', allPassed ? 'ПРОЙДЕНЫ ✅' : 'ПРОВАЛЕНЫ ❌');
        
        process.exit(allPassed ? 0 : 1);
      } else {
        console.log('❌ Ошибка при входе');
        process.exit(1);
      }
    } else {
      console.log('❌ Ошибка при регистрации');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка при выполнении тестов:', error);
    process.exit(1);
  }
}

main();
