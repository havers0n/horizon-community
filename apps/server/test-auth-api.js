import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAuthAPI() {
  console.log('🧪 Testing MDT API Authentication...\n');

  // Тест 1: Проверка без токена
  console.log('1️⃣ Testing without token:');
  try {
    const response = await fetch(`${API_BASE}/mdt/bolos`);
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Тест 2: Проверка с неправильным токеном
  console.log('2️⃣ Testing with invalid token:');
  try {
    const response = await fetch(`${API_BASE}/mdt/bolos`, {
      headers: {
        'Authorization': 'Bearer invalid_token_123'
      }
    });
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Тест 3: Проверка с правильным форматом токена (но невалидным)
  console.log('3️⃣ Testing with malformed token:');
  try {
    const response = await fetch(`${API_BASE}/mdt/bolos`, {
      headers: {
        'Authorization': 'Bearer'
      }
    });
    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Тест 4: Проверка health endpoint
  console.log('4️⃣ Testing health endpoint:');
  try {
    const response = await fetch(`${API_BASE}/health`);
    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  console.log('✅ API authentication tests completed!');
  console.log('\n📝 Expected results:');
  console.log('   - Test 1: Should return 401 (missing token)');
  console.log('   - Test 2: Should return 401 (invalid token)');
  console.log('   - Test 3: Should return 401 (malformed token)');
  console.log('   - Test 4: Should return 200 (health check)');
}

// Запуск тестов
testAuthAPI().catch(console.error); 