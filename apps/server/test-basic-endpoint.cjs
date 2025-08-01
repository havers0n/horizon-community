const fetch = require('node-fetch');

async function testBasicEndpoint() {
  console.log('🧪 Тестирование базового endpoint...\n');

  try {
    // Тестируем health check
    console.log('🏥 Тестирование GET /api/health');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log(`Статус: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check успешен:', healthData);
    } else {
      const errorText = await healthResponse.text();
      console.log('❌ Health check ошибка:', errorText);
    }

    // Тестируем базовый MDT endpoint
    console.log('\n📱 Тестирование GET /api/mdt');
    const mdtResponse = await fetch('http://localhost:5000/api/mdt');
    console.log(`Статус: ${mdtResponse.status}`);
    
    if (mdtResponse.ok) {
      const mdtData = await mdtResponse.json();
      console.log('✅ MDT endpoint успешен:', mdtData);
    } else {
      const errorText = await mdtResponse.text();
      console.log('❌ MDT endpoint ошибка:', errorText);
    }

    // Тестируем units endpoint
    console.log('\n📱 Тестирование GET /api/mdt/units');
    const unitsResponse = await fetch('http://localhost:5000/api/mdt/units');
    console.log(`Статус: ${unitsResponse.status}`);
    
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log('✅ Units endpoint успешен:', unitsData);
    } else {
      const errorText = await unitsResponse.text();
      console.log('❌ Units endpoint ошибка:', errorText);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testBasicEndpoint()
  .then(() => {
    console.log('\n✅ Тестирование завершено');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка тестирования:', error);
    process.exit(1);
  }); 