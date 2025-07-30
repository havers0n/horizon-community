const http = require('http');

console.log('🔍 Тест magic link токена...');

// Токен из magic link
const magicLinkToken = 'a1240dc7fd3df8ffb7e4f79b39c522831680d55770497bd00c601837';

// Тест с magic link токеном
const testMagicLinkToken = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${magicLinkToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📤 Запрос с magic link токеном:');
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

// Тест с service role токеном (для сравнения)
const testServiceRoleToken = () => {
  return new Promise((resolve) => {
    const serviceRoleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U';
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📤 Запрос с service role токеном:');
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
  console.log('🚀 Запуск тестов токенов...\n');
  
  await testMagicLinkToken();
  console.log('');
  
  await testServiceRoleToken();
  console.log('');
  
  console.log('✅ Тесты завершены');
  console.log('');
  console.log('💡 Magic Link токен нужно активировать через браузер:');
  console.log('https://axgtvvcimqoyxbfvdrok.supabase.co/auth/v1/verify?token=a1240dc7fd3df8ffb7e4f79b39c522831680d55770497bd00c601837&type=magiclink&redirect_to=http://localhost:3000');
}

runTests(); 