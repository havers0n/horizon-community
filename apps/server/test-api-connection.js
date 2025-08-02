// Тестовый скрипт для проверки подключения к API
const http = require('http');

const testApiConnection = () => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ API Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📄 Response:', response);
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ API Connection Error:', err.message);
    console.log('💡 Убедитесь, что сервер запущен: npm run dev');
  });

  req.end();
};

console.log('🔍 Testing API connection...');
testApiConnection(); 