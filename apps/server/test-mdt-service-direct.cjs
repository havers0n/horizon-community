require('dotenv').config();

async function testMDTServiceDirect() {
  try {
    console.log('Тестируем MDTService напрямую...');
    
    // Импортируем MDTService
    const { MDTService } = await import('./services/MDTService');
    
    console.log('MDTService импортирован успешно');
    
    // Создаем экземпляр MDTService
    const mdtService = new MDTService();
    console.log('MDTService создан успешно');
    
    // Тестируем getBolos
    console.log('Тестируем getBolos...');
    const bolos = await mdtService.getBolos();
    
    console.log('Результат getBolos:');
    console.log('Количество BOLO:', bolos.length);
    console.log('Данные:', JSON.stringify(bolos, null, 2));
    
  } catch (error) {
    console.error('Ошибка при тестировании MDTService:', error);
  }
}

testMDTServiceDirect(); 