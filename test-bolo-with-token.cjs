const https = require('https');
const http = require('http');

async function testBoloWithToken() {
  const baseUrl = 'http://localhost:5000';
  
  // You'll need to replace this with a valid token
  const token = process.env.TEST_TOKEN || 'your-valid-token-here';
  
  try {
    console.log('Тестируем BOLO endpoint с токеном...');
    console.log(`URL: ${baseUrl}/api/mdt/bolos`);
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get(`${baseUrl}/api/mdt/bolos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      console.log('\n⚠️  Получена ошибка 500 - проверьте логи сервера для деталей');
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании endpoint:', error.message);
  }
}

testBoloWithToken(); 