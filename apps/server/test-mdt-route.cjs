require('dotenv').config();

async function testMDTRoute() {
  try {
    console.log('Тестируем импорт mdtService в контексте маршрута...');
    
    // Импортируем mdtService из routes/mdt.ts
    const mdtRoutes = await import('./routes/mdt.js');
    
    console.log('mdtRoutes импортирован успешно');
    console.log('mdtRoutes:', mdtRoutes);
    
    // Проверяем, есть ли mdtService в экспорте
    if (mdtRoutes.mdtService) {
      console.log('mdtService найден в экспорте');
    } else {
      console.log('mdtService не найден в экспорте');
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании импорта mdtService:', error);
  }
}

testMDTRoute(); 