const https = require('https');
const http = require('http');

async function getTestToken() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('Пытаемся получить тестовый токен...');
    
    // Try to login with test credentials
    const loginData = JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
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
      req.write(loginData);
      req.end();
    });
    
    console.log('Статус ответа:', response.statusCode);
    console.log('Тело ответа:');
    console.log(response.body);
    
    if (response.statusCode === 200) {
      try {
        const responseData = JSON.parse(response.body);
        if (responseData.token) {
          console.log('\n✅ Токен получен успешно!');
          console.log('Токен:', responseData.token);
          return responseData.token;
        }
      } catch (parseError) {
        console.log('Ошибка парсинга JSON:', parseError.message);
      }
    }
    
    console.log('\n❌ Не удалось получить токен');
    
  } catch (error) {
    console.error('Ошибка при получении токена:', error.message);
  }
  
  return null;
}

getTestToken(); 