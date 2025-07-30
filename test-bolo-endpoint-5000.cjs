const https = require('https');
const http = require('http');

async function testBoloEndpoint() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('Тестируем BOLO endpoint на порту 5000...');
    console.log(`URL: ${baseUrl}/api/mdt/bolos`);
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get(`${baseUrl}/api/mdt/bolos`, (res) => {
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
    
  } catch (error) {
    console.error('Ошибка при тестировании endpoint:', error.message);
  }
}

testBoloEndpoint(); 