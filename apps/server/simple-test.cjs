const axios = require('axios');

async function testConnection() {
  try {
    console.log('🔍 Тестируем подключение к серверу...');
    
    const response = await axios.get('http://127.0.0.1:5000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Сервер отвечает:', response.data);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Сервер не запущен или недоступен на порту 5000');
    }
  }
}

testConnection();