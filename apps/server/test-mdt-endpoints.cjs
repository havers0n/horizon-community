const fetch = require('node-fetch');

async function testMDTEndpoints() {
  console.log('🧪 Тестирование MDT endpoints без аутентификации...\n');

  try {
    // 1. Тестируем базовый MDT endpoint
    console.log('📱 Тестирование GET /api/mdt');
    const mdtResponse = await fetch('http://localhost:5000/api/mdt');
    console.log(`Статус: ${mdtResponse.status}`);
    
    if (mdtResponse.ok) {
      const mdtData = await mdtResponse.json();
      console.log('✅ MDT endpoint успешен:', mdtData);
    } else {
      const errorText = await mdtResponse.text();
      console.log('❌ MDT endpoint ошибка:', errorText);
    }

    // 2. Тестируем units test endpoint
    console.log('\n📱 Тестирование GET /api/mdt/units/test');
    const unitsResponse = await fetch('http://localhost:5000/api/mdt/units/test');
    console.log(`Статус: ${unitsResponse.status}`);
    
    if (unitsResponse.ok) {
      const unitsData = await unitsResponse.json();
      console.log('✅ Units test endpoint успешен:', unitsData);
    } else {
      const errorText = await unitsResponse.text();
      console.log('❌ Units test endpoint ошибка:', errorText);
    }

    // 3. Тестируем calls test endpoint
    console.log('\n📞 Тестирование GET /api/mdt/calls/test');
    const callsResponse = await fetch('http://localhost:5000/api/mdt/calls/test');
    console.log(`Статус: ${callsResponse.status}`);
    
    if (callsResponse.ok) {
      const callsData = await callsResponse.json();
      console.log('✅ Calls test endpoint успешен:', callsData);
    } else {
      const errorText = await callsResponse.text();
      console.log('❌ Calls test endpoint ошибка:', errorText);
    }

    // 4. Тестируем bolos test endpoint
    console.log('\n🚨 Тестирование GET /api/mdt/bolos/test');
    const bolosResponse = await fetch('http://localhost:5000/api/mdt/bolos/test');
    console.log(`Статус: ${bolosResponse.status}`);
    
    if (bolosResponse.ok) {
      const bolosData = await bolosResponse.json();
      console.log('✅ Bolos test endpoint успешен:', bolosData);
    } else {
      const errorText = await bolosResponse.text();
      console.log('❌ Bolos test endpoint ошибка:', errorText);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testMDTEndpoints()
  .then(() => {
    console.log('\n✅ Тестирование завершено');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка тестирования:', error);
    process.exit(1);
  }); 