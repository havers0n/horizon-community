const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/mdt';

async function testMDTApi() {
  console.log('🧪 Тестирование MDT API endpoints...\n');

  try {
    // 1. Тестируем получение активных юнитов
    console.log('📱 Тестирование GET /api/mdt/units/active');
    const unitsResponse = await fetch(`${BASE_URL}/units/active`);
    const unitsData = await unitsResponse.json();
    
    if (unitsResponse.ok) {
      console.log(`✅ Успешно получено ${unitsData.data?.length || 0} юнитов`);
      if (unitsData.data && unitsData.data.length > 0) {
        console.log(`   Пример юнита: ${unitsData.data[0].unitNumber} - ${unitsData.data[0].status}`);
      }
    } else {
      console.log(`❌ Ошибка: ${unitsData.error || 'Неизвестная ошибка'}`);
    }

    // 2. Тестируем получение активных вызовов
    console.log('\n📞 Тестирование GET /api/mdt/calls/active');
    const callsResponse = await fetch(`${BASE_URL}/calls/active`);
    const callsData = await callsResponse.json();
    
    if (callsResponse.ok) {
      console.log(`✅ Успешно получено ${callsData.data?.length || 0} вызовов`);
      if (callsData.data && callsData.data.length > 0) {
        console.log(`   Пример вызова: ${callsData.data[0].location} - ${callsData.data[0].status}`);
      }
    } else {
      console.log(`❌ Ошибка: ${callsData.error || 'Неизвестная ошибка'}`);
    }

    // 3. Тестируем получение активных BOLO
    console.log('\n🚨 Тестирование GET /api/mdt/bolos/active');
    const bolosResponse = await fetch(`${BASE_URL}/bolos/active`);
    const bolosData = await bolosResponse.json();
    
    if (bolosResponse.ok) {
      console.log(`✅ Успешно получено ${bolosData.data?.length || 0} BOLO`);
      if (bolosData.data && bolosData.data.length > 0) {
        console.log(`   Пример BOLO: ${bolosData.data[0].type} - ${bolosData.data[0].priority}`);
      }
    } else {
      console.log(`❌ Ошибка: ${bolosData.error || 'Неизвестная ошибка'}`);
    }

    // 4. Тестируем получение всех юнитов
    console.log('\n📱 Тестирование GET /api/mdt/units');
    const allUnitsResponse = await fetch(`${BASE_URL}/units`);
    const allUnitsData = await allUnitsResponse.json();
    
    if (allUnitsResponse.ok) {
      console.log(`✅ Успешно получено ${allUnitsData.data?.length || 0} юнитов`);
    } else {
      console.log(`❌ Ошибка: ${allUnitsData.error || 'Неизвестная ошибка'}`);
    }

    // 5. Тестируем получение всех вызовов
    console.log('\n📞 Тестирование GET /api/mdt/calls');
    const allCallsResponse = await fetch(`${BASE_URL}/calls`);
    const allCallsData = await allCallsResponse.json();
    
    if (allCallsResponse.ok) {
      console.log(`✅ Успешно получено ${allCallsData.data?.length || 0} вызовов`);
    } else {
      console.log(`❌ Ошибка: ${allCallsData.error || 'Неизвестная ошибка'}`);
    }

    // 6. Тестируем получение всех BOLO
    console.log('\n🚨 Тестирование GET /api/mdt/bolos');
    const allBolosResponse = await fetch(`${BASE_URL}/bolos`);
    const allBolosData = await allBolosResponse.json();
    
    if (allBolosResponse.ok) {
      console.log(`✅ Успешно получено ${allBolosData.data?.length || 0} BOLO`);
    } else {
      console.log(`❌ Ошибка: ${allBolosData.error || 'Неизвестная ошибка'}`);
    }

    // 7. Тестируем получение дашборда
    console.log('\n📊 Тестирование GET /api/mdt/dashboard');
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard`);
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardResponse.ok) {
      console.log('✅ Дашборд получен успешно');
      if (dashboardData.data && dashboardData.data.stats) {
        const stats = dashboardData.data.stats;
        console.log(`   Статистика: ${stats.totalUnits} юнитов, ${stats.totalCalls} вызовов, ${stats.totalSignals} сигналов`);
      }
    } else {
      console.log(`❌ Ошибка: ${dashboardData.error || 'Неизвестная ошибка'}`);
    }

    console.log('\n🎉 Тестирование API завершено!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.message);
  }
}

// Запускаем тестирование
if (require.main === module) {
  testMDTApi()
    .then(() => {
      console.log('✅ Тестирование завершено');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка тестирования:', error);
      process.exit(1);
    });
}

module.exports = { testMDTApi }; 