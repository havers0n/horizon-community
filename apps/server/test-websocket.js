import WebSocket from 'ws';

const WS_URL = 'ws://127.0.0.1:5002/ws';

async function testWebSocket() {
  console.log('🔍 Тестирование WebSocket сервера...\n');

  try {
    console.log(`📡 Подключение к ${WS_URL}...`);
    
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log('✅ WebSocket подключение установлено');
      
      // Подписываемся на каналы
      ws.send(JSON.stringify({
        type: 'subscribe',
        data: { channels: ['all', 'units', 'calls'] }
      }));
      
      console.log('📡 Подписка на каналы отправлена');
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`📨 Получено сообщение: ${message.type}`);
        
        if (message.type === 'connection_established') {
          console.log('✅ Подключение подтверждено сервером');
        } else if (message.type === 'subscription_confirmed') {
          console.log('✅ Подписка подтверждена сервером');
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга сообщения:', error);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket соединение закрыто');
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket ошибка:', error.message);
    });

    // Ждем 5 секунд и закрываем соединение
    setTimeout(() => {
      console.log('🛑 Закрытие тестового соединения...');
      ws.close();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Ошибка тестирования WebSocket:', error);
    process.exit(1);
  }
}

testWebSocket(); 