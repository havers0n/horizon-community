async function testCurlLimits() {
  console.log('🧪 Тестирование API лимитов с curl-подобным запросом...\n');

  try {
    const response = await fetch('http://localhost:5000/api/application-limits/entry', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer mock-token-19-1234567890',
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Статус ответа: ${response.status}`);
    console.log(`📊 Заголовки ответа:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ответ API:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.restriction) {
        console.log('\n🎯 Результат проверки лимитов:');
        console.log(`Разрешено: ${data.restriction.allowed}`);
        console.log(`Причина: ${data.restriction.reason || 'Нет'}`);
        console.log(`Осталось: ${data.restriction.remainingCount || 'Нет данных'}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Ошибка API:');
      console.log(errorText);
    }

  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
  }
}

testCurlLimits().catch(console.error); 