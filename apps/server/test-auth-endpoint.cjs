const http = require('http');

console.log('🔍 Тестирование аутентификации...');

// Тест без токена
const testWithoutToken = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📤 Запрос без токена:');
        console.log('   Статус:', res.statusCode);
        console.log('   Ответ:', data);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      resolve();
    });
    
    req.end();
  });
};

// Тест с неверным токеном
const testWithInvalidToken = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid.token.here'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📤 Запрос с неверным токеном:');
        console.log('   Статус:', res.statusCode);
        console.log('   Ответ:', data);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      resolve();
    });
    
    req.end();
  });
};

// Тест с токеном из вашего запроса
const testWithYourToken = () => {
  return new Promise((resolve) => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F4Z3R2dmNpbXFveXhiZnZkcm9rLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjNjViZmRmMC04MjBiLTQ0OWEtYjc5OC1mODUzMDkwZGEyYzQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzOTExMTU2LCJpYXQiOjE3NTM5MDc1NTYsImVtYWlsIjoiZGFueXBldHJvdjIwMDBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM5MDc1NTZ9XSwic2Vzc2lvbl9pZCI6ImQ4YThjZmI0LWI2MDgtNDQ3YS1iYjYxLWY2NTE0MGYzMTFiMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.hkyFHUBOH3z5ZbjFzTSHcv-JFG_NVAETFwxYqiZqSYw';
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📤 Запрос с вашим токеном:');
        console.log('   Статус:', res.statusCode);
        console.log('   Ответ:', data);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      resolve();
    });
    
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Запуск тестов аутентификации...\n');
  
  await testWithoutToken();
  console.log('');
  
  await testWithInvalidToken();
  console.log('');
  
  await testWithYourToken();
  console.log('');
  
  console.log('✅ Тесты завершены');
}

runTests(); 