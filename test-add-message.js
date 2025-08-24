// Тестовый скрипт для проверки API добавления сообщений
const axios = require('axios');

async function testAddMessage() {
  try {
    console.log('🔍 Тестирование API добавления сообщений...');
    
    const ticketId = 'e488fd5a-d509-475f-ab00-21661c64081a';
    const testMessage = `Тестовое сообщение ${new Date().toISOString()}`;
    
    console.log('\n📝 Тест: Добавление сообщения');
    console.log('Тикет ID:', ticketId);
    console.log('Сообщение:', testMessage);
    
    const response = await axios.post(`http://localhost:3001/api/v1/admin/support/tickets/${ticketId}/messages`, {
      content: testMessage
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ сервера:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasTicket: !!response.data.data?.ticket,
      hasMessages: !!response.data.data?.messages,
      messagesCount: response.data.data?.messages?.length || 0
    });
    
    if (response.data.data?.messages) {
      console.log('💬 Последние сообщения:');
      response.data.data.messages.slice(-3).forEach((msg, index) => {
        console.log(`  ${response.data.data.messages.length - 2 + index}. ${msg.author_username}: ${msg.content}`);
      });
    }
    
    // Проверяем, что новое сообщение добавилось
    const lastMessage = response.data.data?.messages?.[response.data.data.messages.length - 1];
    if (lastMessage && lastMessage.content === testMessage) {
      console.log('✅ Новое сообщение успешно добавлено!');
    } else {
      console.log('❌ Новое сообщение не найдено в ответе');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Запуск теста
testAddMessage();
