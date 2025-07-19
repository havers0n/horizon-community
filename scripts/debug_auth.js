import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const API_BASE = 'http://localhost:5000';

// Функция для выполнения запросов
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`Запрос: ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('Тело запроса:', options.body);
  }
  
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
  
  console.log(`Ответ: ${response.status}`, data);
  
  return {
    status: response.status,
    data,
    ok: response.ok
  };
}

async function main() {
  console.log('🔍 Отладка аутентификации...\n');
  
  // Создаем пользователя
  const testUser = {
    username: `debuguser_${Date.now()}`,
    email: `debug_${Date.now()}@example.com`,
    password: 'debugpassword123'
  };
  
  console.log('1. Регистрация пользователя...');
  const regResult = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (regResult.ok) {
    console.log('\n2. Вход пользователя...');
    const loginResult = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    if (loginResult.ok) {
      console.log('\n3. Проверка защищенного endpoint...');
      const token = loginResult.data.session.access_token;
      await apiRequest('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  }
}

main().catch(console.error);
