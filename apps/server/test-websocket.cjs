const WebSocket = require('ws');

const WS_URL = 'ws://localhost:5000';

// Функция для тестирования WebSocket
function testWebSocket() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Подключение к WebSocket серверу...');
    
    const ws = new WebSocket(WS_URL);
    let receivedEvents = [];
    let isAuthenticated = false;
    let isSubscribed = false;
    
    ws.on('open', () => {
      console.log('✅ WebSocket соединение установлено');
      
      // Ждем немного перед отправкой аутентификации
      setTimeout(() => {
        // Аутентификация
        console.log('🔐 Отправка аутентификации...');
        ws.send(JSON.stringify({
          type: 'authenticate',
          data: { token: 'test-token' }
        }));
      }, 1000);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 Получено сообщение:', message.type);
        
        if (message.type === 'authenticated') {
          console.log('✅ Аутентификация успешна');
          isAuthenticated = true;
          
          // Подписка на каналы
          console.log('📡 Подписка на каналы...');
          ws.send(JSON.stringify({
            type: 'subscribe',
            data: { channels: ['all', 'test', 'units', 'calls', 'alerts'] }
          }));
        }
        
        if (message.type === 'subscribed') {
          console.log('✅ Подписка успешна');
          isSubscribed = true;
          
          // Ждем немного и отправляем тестовое событие
          setTimeout(() => {
            console.log('📡 Отправка тестового события через HTTP...');
            sendTestEventViaHTTP();
          }, 1000);
        }
        
        if (message.type === 'test_event' || message.type === 'unit_status_update' || message.type === 'new_call') {
          console.log('🎉 Получено real-time событие через WebSocket!');
          receivedEvents.push(message);
          
          if (receivedEvents.length >= 1) {
            console.log('✅ WebSocket тест успешен!');
            ws.close();
            resolve(true);
          }
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
      if (!isAuthenticated || !isSubscribed || receivedEvents.length === 0) {
        console.log('⏰ Таймаут теста WebSocket');
        ws.close();
        resolve(false);
      }
    }, 10000);
  });
}

// Функция для отправки тестового события через HTTP
async function sendTestEventViaHTTP() {
  const http = require('http');
  
  const postData = JSON.stringify({
    type: 'test_event',
    data: {
      message: 'Тестовое событие для WebSocket!',
      source: 'websocket-test',
      timestamp: Date.now()
    },
    channels: ['all', 'test']
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/realtime/broadcast',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.success) {
            console.log('✅ HTTP событие отправлено успешно');
            resolve(true);
          } else {
            console.log('❌ Ошибка отправки HTTP события:', response);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Ошибка парсинга HTTP ответа:', error);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Ошибка HTTP запроса:', error);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Основная функция тестирования
async function runWebSocketTest() {
  console.log('🚀 Начинаем тестирование WebSocket...\n');
  
  try {
    const result = await testWebSocket();
    
    if (result) {
      console.log('\n🎉 WebSocket тест пройден успешно!');
      console.log('✅ Epic 2: Real-time Infrastructure - WebSocket работает!');
    } else {
      console.log('\n⚠️ WebSocket тест не пройден');
    }
  } catch (error) {
    console.error('\n❌ Ошибка WebSocket теста:', error);
  }
}

// Запускаем тест
runWebSocketTest();