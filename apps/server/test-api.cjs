const fetch = require('node-fetch');

async function testAPI() {
  const token = 'test_token_123';
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Тестирование API...');
  console.log('🔑 Токен:', token);
  
  try {
    // Тест health endpoint
    console.log('\n1. Тестирование health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);
    
    // Тест BOLO endpoint с токеном
    console.log('\n2. Тестирование BOLO endpoint с токеном...');
    const boloResponse = await fetch(`${baseUrl}/api/mdt/bolos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('BOLO status:', boloResponse.status);
    
    if (boloResponse.ok) {
      const boloData = await boloResponse.json();
      console.log('BOLO data:', boloData);
    } else {
      const errorData = await boloResponse.text();
      console.log('BOLO error:', errorData);
    }
    
    // Тест без токена
    console.log('\n3. Тестирование BOLO endpoint без токена...');
    const boloNoTokenResponse = await fetch(`${baseUrl}/api/mdt/bolos`);
    console.log('BOLO no token status:', boloNoTokenResponse.status);
    const boloNoTokenData = await boloNoTokenResponse.text();
    console.log('BOLO no token data:', boloNoTokenData);
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testAPI(); 