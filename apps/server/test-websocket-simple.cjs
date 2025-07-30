const WebSocket = require('ws');

const WS_URL = 'ws://localhost:5000';

function testWebSocketSimple() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Подключение к WebSocket серверу...');
    
    const ws = new WebSocket(WS_URL);
    let receivedMessages = [];
    
    ws.on('open', () => {
      console.log('✅ WebSocket соединение установлено');
      
      // Отправляем ping для проверки
      console.log('🏓 Отправка ping...');
      ws.send(JSON.stringify({
        type: 'ping',
        data: { timestamp: Date.now() }
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Получено сообщение:', message.type, message.data);
        receivedMessages.push(message);
        
        if (message.type === 'pong') {
          console.log('✅ Ping/Pong работает!');
          ws.close();
          resolve(true);
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга сообщения:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket соединение закрыто');
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket ошибка:', error);
      reject(error);
    });
    
    // Таймаут для теста
    setTimeout(() => {
      if (receivedMessages.length === 0) {
        console.log('⏰ Таймаут теста WebSocket');
        ws.close();
        resolve(false);
      }
    }, 5000);
  });
}

async function runSimpleTest() {
  console.log('🚀 Начинаем простой тест WebSocket...\n');
  
  try {
    const result = await testWebSocketSimple();
    
    if (result) {
      console.log('\n🎉 Простой WebSocket тест пройден!');
    } else {
      console.log('\n⚠️ Простой WebSocket тест не пройден');
    }
  } catch (error) {
    console.error('\n❌ Ошибка WebSocket теста:', error);
  }
}

runSimpleTest();