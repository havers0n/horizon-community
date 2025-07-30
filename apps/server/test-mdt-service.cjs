const { mdtService } = require('./services/MDTService.js');

async function testMDTService() {
  try {
    console.log('Тестируем MDTService.getBolos()...');
    
    const bolos = await mdtService.getBolos();
    
    console.log('Результат getBolos():');
    console.log('Количество BOLO:', bolos.length);
    console.log('Данные:', JSON.stringify(bolos, null, 2));
    
  } catch (error) {
    console.error('Ошибка при тестировании MDTService:', error);
  }
}

testMDTService(); 