// Тестовый скрипт для проверки API поддержки
const axios = require('axios');

async function testSupportAPI() {
  try {
    console.log('🔍 Тестирование API поддержки...');
    
    // Тест 1: Получение списка тикетов
    console.log('\n📋 Тест 1: Получение списка тикетов');
    const ticketsResponse = await axios.get('http://localhost:3001/api/v1/admin/support/tickets', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Список тикетов получен:', {
      success: ticketsResponse.data.success,
      count: ticketsResponse.data.data?.length || 0
    });
    
    if (ticketsResponse.data.data && ticketsResponse.data.data.length > 0) {
      const firstTicket = ticketsResponse.data.data[0];
      console.log('📝 Первый тикет:', {
        id: firstTicket.id,
        title: firstTicket.title,
        status: firstTicket.status_code
      });
      
      // Тест 2: Получение деталей тикета
      console.log('\n🔍 Тест 2: Получение деталей тикета');
      const detailsResponse = await axios.get(`http://localhost:3001/api/v1/admin/support/tickets/${firstTicket.id}`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Детали тикета получены:', {
        success: detailsResponse.data.success,
        hasTicket: !!detailsResponse.data.data?.ticket,
        hasMessages: !!detailsResponse.data.data?.messages,
        messagesCount: detailsResponse.data.data?.messages?.length || 0
      });
      
      if (detailsResponse.data.data?.ticket) {
        const ticket = detailsResponse.data.data.ticket;
        console.log('📝 Детали тикета:', {
          id: ticket.id,
          title: ticket.title,
          author: ticket.author_username,
          status: ticket.status_code,
          created_at: ticket.created_at
        });
      }
      
      if (detailsResponse.data.data?.messages) {
        console.log('💬 Сообщения:', detailsResponse.data.data.messages.length);
        detailsResponse.data.data.messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.author_username}: ${msg.content.substring(0, 50)}...`);
        });
      }
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
testSupportAPI();
