const fetch = require('node-fetch');

// Тестовый токен (в реальности должен быть получен через Supabase Auth)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F4Z3R2dmNpbXFveXhiZnZkcm9rLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjNjViZmRmMC04MjBiLTQ0OWEtYjc5OC1mODUzMDkwZGEyYzQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU0MDAzODMxLCJpYXQiOjE3NTQwMDAyMzEsImVtYWlsIjoiZGFueXBldHJvdjIwMDBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTQwMDAyMzF9XSwic2Vzc2lvbl9pZCI6IjY5MWZlMmY1LTZlZjYtNGQxMS1hODQ1LTM3OTYxZWZmZTQzZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.OmNqVHkE_Awr3c-npu3_gDJRj954y1sYukWjxPZ3ZxE';

async function testFullIntegration() {
  console.log('🧪 Тестирование полной интеграции MDT API...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  };

  try {
    // 1. Тестируем базовый MDT endpoint (без аутентификации)
    console.log('📱 Тестирование GET /api/mdt (без аутентификации)');
    const mdtResponse = await fetch('http://localhost:5000/api/mdt');
    console.log(`Статус: ${mdtResponse.status}`);
    
    if (mdtResponse.ok) {
      const mdtData = await mdtResponse.json();
      console.log('✅ MDT endpoint успешен:', mdtData);
    } else {
      const errorText = await mdtResponse.text();
      console.log('❌ MDT endpoint ошибка:', errorText);
    }

    // 2. Тестируем units endpoint (с аутентификацией)
    console.log('\n📱 Тестирование GET /api/mdt/units (с аутентификацией)');
    const unitsResponse = await fetch('http://localhost:5000/api/mdt/units', { headers });
    console.log(`Статус: ${unitsResponse.status}`);
    
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log('✅ Units endpoint успешен:', unitsData);
    } else {
      const errorText = await unitsResponse.text();
      console.log('❌ Units endpoint ошибка:', errorText);
    }

    // 3. Тестируем calls endpoint (с аутентификацией)
    console.log('\n📞 Тестирование GET /api/mdt/calls (с аутентификацией)');
    const callsResponse = await fetch('http://localhost:5000/api/mdt/calls', { headers });
    console.log(`Статус: ${callsResponse.status}`);
    
    if (callsResponse.ok) {
      const callsData = await callsResponse.json();
      console.log('✅ Calls endpoint успешен:', callsData);
    } else {
      const errorText = await callsResponse.text();
      console.log('❌ Calls endpoint ошибка:', errorText);
    }

    // 4. Тестируем bolos endpoint (с аутентификацией)
    console.log('\n🚨 Тестирование GET /api/mdt/bolos (с аутентификацией)');
    const bolosResponse = await fetch('http://localhost:5000/api/mdt/bolos', { headers });
    console.log(`Статус: ${bolosResponse.status}`);
    
    if (bolosResponse.ok) {
      const bolosData = await bolosResponse.json();
      console.log('✅ Bolos endpoint успешен:', bolosData);
    } else {
      const errorText = await bolosResponse.text();
      console.log('❌ Bolos endpoint ошибка:', errorText);
    }

    // 5. Тестируем dashboard endpoint (с аутентификацией)
    console.log('\n📊 Тестирование GET /api/mdt/dashboard (с аутентификацией)');
    const dashboardResponse = await fetch('http://localhost:5000/api/mdt/dashboard', { headers });
    console.log(`Статус: ${dashboardResponse.status}`);
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard endpoint успешен:', dashboardData);
    } else {
      const errorText = await dashboardResponse.text();
      console.log('❌ Dashboard endpoint ошибка:', errorText);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testFullIntegration()
  .then(() => {
    console.log('\n✅ Тестирование полной интеграции завершено');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка тестирования:', error);
    process.exit(1);
  }); 