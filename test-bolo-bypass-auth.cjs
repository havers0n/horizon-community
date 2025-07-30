const https = require('https');
const http = require('http');

async function testBoloBypassAuth() {
  const baseUrl = 'http://localhost:5000';
  
  // Create a mock JWT token (this won't work with real auth, but helps test the endpoint)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  try {
    console.log('Тестируем BOLO endpoint с mock токеном...');
    console.log(`URL: ${baseUrl}/api/mdt/bolos`);
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get(`${baseUrl}/api/mdt/bolos`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    console.log('Статус ответа:', response.statusCode);
    console.log('Заголовки:', response.headers);
    console.log('Тело ответа:');
    console.log(response.body);
    
    if (response.statusCode === 500) {
      console.log('\n⚠️  Получена ошибка 500 - это означает, что аутентификация прошла, но есть ошибка в базе данных');
      console.log('Проверьте логи сервера для деталей ошибки');
    } else if (response.statusCode === 401) {
      console.log('\n⚠️  Получена ошибка 401 - аутентификация не прошла');
      console.log('Нужен валидный токен для тестирования');
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании endpoint:', error.message);
  }
}

testBoloBypassAuth(); 