// Тестовый скрипт для проверки API департаментов
const fetch = require('node-fetch');

async function testDepartmentsAPI() {
  console.log('🔍 Тестирование API департаментов...');
  
  try {
    // Тест 1: Проверяем публичный API
    console.log('\n1️⃣ Тестируем публичный API...');
    const response = await fetch('http://localhost:5000/api/public/departments');
    
    console.log('Статус:', response.status);
    console.log('Заголовки:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Ответ:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('✅ API работает, получено департаментов:', data.data.length);
      console.log('Первый департамент:', data.data[0]);
    } else {
      console.log('❌ API возвращает пустой массив или ошибку');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.message);
  }
  
  try {
    // Тест 2: Проверяем health check
    console.log('\n2️⃣ Тестируем health check...');
    const healthResponse = await fetch('http://localhost:5000/api/public/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', JSON.stringify(healthData, null, 2));
    
  } catch (error) {
    console.error('❌ Ошибка при health check:', error.message);
  }
}

testDepartmentsAPI(); 