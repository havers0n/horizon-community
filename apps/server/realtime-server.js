import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// CORS настройки
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));

app.use(express.json());

// Хранилище для событий и подключений
const eventCache = new Map();
const connectedClients = new Set();
const clientSubscriptions = new Map(); // clientId -> Set of channels

// Генерация уникального ID для клиентов
let clientIdCounter = 0;

// WebSocket обработчики
wss.on('connection', (ws, req) => {
  const clientId = ++clientIdCounter;
  connectedClients.add(ws);
  
  console.log(`🔗 WebSocket client ${clientId} connected`);
  
  // Отправляем приветственное сообщение
  ws.send(JSON.stringify({
    type: 'connection_established',
    data: { clientId, timestamp: Date.now() },
    timestamp: Date.now()
  }));

  // Обработка сообщений от клиента
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          handleSubscribe(clientId, ws, data.data?.channels || ['all']);
          break;
        case 'unsubscribe':
          handleUnsubscribe(clientId, ws, data.data?.channels || []);
          break;
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
          }));
          break;
        default:
          console.log(`📨 Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  });

  // Обработка отключения клиента
  ws.on('close', () => {
    connectedClients.delete(ws);
    clientSubscriptions.delete(clientId);
    console.log(`🔌 WebSocket client ${clientId} disconnected`);
  });

  // Обработка ошибок
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for client ${clientId}:`, error);
    connectedClients.delete(ws);
    clientSubscriptions.delete(clientId);
  });
});

// Обработка подписки на каналы
function handleSubscribe(clientId, ws, channels) {
  if (!clientSubscriptions.has(clientId)) {
    clientSubscriptions.set(clientId, new Set());
  }
  
  const clientChannels = clientSubscriptions.get(clientId);
  channels.forEach(channel => clientChannels.add(channel));
  
  console.log(`📡 Client ${clientId} subscribed to: ${channels.join(', ')}`);
  
  // Отправляем подтверждение подписки
  ws.send(JSON.stringify({
    type: 'subscription_confirmed',
    data: { channels, timestamp: Date.now() },
    timestamp: Date.now()
  }));
}

// Обработка отписки от каналов
function handleUnsubscribe(clientId, ws, channels) {
  if (clientSubscriptions.has(clientId)) {
    const clientChannels = clientSubscriptions.get(clientId);
    channels.forEach(channel => clientChannels.delete(channel));
  }
  
  console.log(`📡 Client ${clientId} unsubscribed from: ${channels.join(', ')}`);
}

// Функция для отправки события всем подписчикам
function broadcastEvent(event) {
  const { channels = ['all'] } = event;
  
  // Сохраняем событие в кэш
  channels.forEach(channel => {
    if (!eventCache.has(channel)) {
      eventCache.set(channel, []);
    }
    eventCache.get(channel).push(event);
    
    // Ограничиваем размер кэша
    if (eventCache.get(channel).length > 100) {
      eventCache.get(channel).shift();
    }
  });
  
  // Отправляем событие всем подписчикам
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      // Находим ID клиента
      let clientId = null;
      for (const [id, subscriptions] of clientSubscriptions.entries()) {
        if (client === Array.from(connectedClients).find(c => c === client)) {
          clientId = id;
          break;
        }
      }
      
      if (clientId && clientSubscriptions.has(clientId)) {
        const clientChannels = clientSubscriptions.get(clientId);
        
        // Проверяем, подписан ли клиент на каналы события
        const hasIntersection = channels.some(channel => 
          clientChannels.has(channel) || clientChannels.has('all')
        );
        
        if (hasIntersection) {
          client.send(JSON.stringify(event));
        }
      }
    }
  });
  
  console.log(`📡 Event broadcasted: ${event.type} to ${channels.join(', ')}`);
}

// HTTP эндпоинты для Real-Time

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'RealTime server is running',
    stats: {
      connectedClients: connectedClients.size,
      totalEvents: Array.from(eventCache.values()).flat().length
    }
  });
});

// Отправка события
app.post('/api/realtime/broadcast', (req, res) => {
  try {
    const { type, data, channels = ['all'] } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }
    
    const event = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      channels
    };
    
    broadcastEvent(event);
    
    res.json({
      success: true,
      message: 'Event broadcasted successfully',
      event: { type, data, channels },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error broadcasting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast event'
    });
  }
});

// Получение событий (для polling fallback)
app.get('/api/realtime/events', (req, res) => {
  try {
    const channels = req.query.channels || 'all';
    const since = req.query.since ? parseInt(req.query.since) : undefined;
    
    const channelList = channels.split(',').map(ch => ch.trim());
    
    const allEvents = [];
    const cutoffTime = since || (Date.now() - 5 * 60 * 1000); // 5 минут по умолчанию
    
    channelList.forEach(channel => {
      const channelEvents = eventCache.get(channel) || [];
      const filteredEvents = channelEvents.filter(event => 
        event.timestamp > cutoffTime
      );
      allEvents.push(...filteredEvents);
    });
    
    // Убираем дубликаты
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    res.json({
      success: true,
      events: uniqueEvents,
      timestamp: Date.now(),
      count: uniqueEvents.length
    });
  } catch (error) {
    console.error('Error getting realtime events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime events'
    });
  }
});

// Статистика
app.get('/api/realtime/stats', (req, res) => {
  try {
    const stats = {};
    let totalEvents = 0;
    
    for (const [channel, events] of eventCache.entries()) {
      stats[channel] = events.length;
      totalEvents += events.length;
    }
    
    res.json({
      success: true,
      cache: {
        channels: stats,
        totalEvents,
        maxCacheSize: 1000,
        cacheTimeout: 5 * 60 * 1000
      },
      websocket: {
        connectedClients: connectedClients.size,
        totalEvents: totalEvents
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime stats'
    });
  }
});

// MDT эндпоинты для тестирования

// BOLO
app.get('/api/mdt/bolos', (req, res) => {
  const testBolos = [
    {
      id: 1,
      type: 'vehicle',
      description: 'Красный спортивный автомобиль',
      vehicle: 'Sultan RS',
      plate: 'ABC123',
      reason: 'Нарушение ПДД',
      priority: 'high',
      status: 'active',
      location: 'Центр города',
      issuedBy: 'Диспетчер Джон',
      timestamp: new Date().toISOString(),
      additionalInfo: 'Скорость превышена в 2 раза'
    },
    {
      id: 2,
      type: 'person',
      description: 'Мужчина в черной куртке',
      reason: 'Подозрение в краже',
      priority: 'medium',
      status: 'active',
      location: 'Торговый центр',
      issuedBy: 'Диспетчер Джейн',
      timestamp: new Date().toISOString(),
      additionalInfo: 'Последний раз видели у входа'
    }
  ];
  
  res.json({
    success: true,
    data: testBolos
  });
});

// Units
app.get('/api/mdt/units', (req, res) => {
  const testUnits = [
    {
      id: 1,
      characterId: 1,
      unitNumber: '1-ADAM-12',
      departmentId: 1,
      status: 'available',
      location: { x: 100, y: 200, z: 0 },
      isPanic: false,
      isActive: true,
      lastUpdate: new Date().toISOString(),
      characterName: 'Офицер Джонсон',
      badgeNumber: '12345'
    },
    {
      id: 2,
      characterId: 2,
      unitNumber: '1-ADAM-14',
      departmentId: 1,
      status: 'busy',
      location: { x: 150, y: 250, z: 0 },
      isPanic: false,
      isActive: true,
      lastUpdate: new Date().toISOString(),
      characterName: 'Офицер Смит',
      badgeNumber: '12346'
    }
  ];
  
  res.json({
    success: true,
    data: testUnits
  });
});

// Запуск сервера
const port = process.env.PORT || 5002;
const host = '127.0.0.1';

server.listen(port, host, () => {
  console.log(`🚀 RealTime server running on ${host}:${port}`);
  console.log(`📡 WebSocket endpoint: ws://${host}:${port}`);
  console.log(`📡 Health check: http://${host}:${port}/api/health`);
  console.log(`📡 Realtime endpoints: http://${host}:${port}/api/realtime/*`);
  console.log(`🚨 MDT endpoints: http://${host}:${port}/api/mdt/*`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

// Экспортируем функцию для использования в других модулях
export { broadcastEvent }; 