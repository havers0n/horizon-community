import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getCADWebSocket } from '../../websocket';

const router: Router = Router();

// Простой кэш для тестирования
const eventCache = new Map<string, any[]>();

/**
 * POST /api/realtime/broadcast
 * Отправка события всем клиентам
 */
router.post('/broadcast', authenticateToken, (req: Request, res: Response) => {
  try {
    const { type, data, channels = ['all'] } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }
    
    // Создаем событие
    const event = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      channels
    };
    
    // Сохраняем событие в кэш для HTTP polling
    channels.forEach(channel => {
      if (!eventCache.has(channel)) {
        eventCache.set(channel, []);
      }
      eventCache.get(channel)!.push(event);
    });
    
    // Отправляем через WebSocket
    const wsServer = getCADWebSocket();
    if (wsServer) {
      wsServer.broadcastEvent({
        type,
        data,
        timestamp: Date.now()
      }, channels);
    }
    
    console.log(`📡 Event broadcasted: ${type} to channels: ${channels.join(', ')}`);
    
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

/**
 * GET /api/realtime/events
 * Получение событий для HTTP polling клиентов
 */
router.get('/events', authenticateToken, (req: Request, res: Response) => {
  try {
    const channels = req.query.channels as string || 'all';
    const since = req.query.since ? parseInt(req.query.since as string) : undefined;
    
    const channelList = channels.split(',').map(ch => ch.trim());
    
    const allEvents: any[] = [];
    const cutoffTime = since || (Date.now() - 5 * 60 * 1000); // 5 минут
    
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

/**
 * GET /api/realtime/stats
 * Получение статистики real-time системы
 */
router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const stats: Record<string, number> = {};
    let totalEvents = 0;
    
    for (const [channel, events] of eventCache.entries()) {
      stats[channel] = events.length;
      totalEvents += events.length;
    }
    
    // Получаем статистику WebSocket сервера
    const wsServer = getCADWebSocket();
    const wsStats = wsServer ? wsServer.getStats() : { totalClients: 0, authenticatedClients: 0, dispatchers: 0, admins: 0 };
    
    res.json({
      success: true,
      cache: {
        channels: stats,
        totalEvents,
        maxCacheSize: 1000,
        cacheTimeout: 5 * 60 * 1000
      },
      websocket: {
        connectedClients: wsStats.totalClients || 0,
        totalEvents: totalEvents || 0
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

/**
 * POST /api/realtime/subscribe
 * Подписка на каналы (для совместимости с WebSocket)
 */
router.post('/subscribe', authenticateToken, (req: Request, res: Response) => {
  try {
    const { channels } = req.body;
    
    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({
        success: false,
        error: 'Channels array is required'
      });
    }
    
    res.json({
      success: true,
      message: 'Subscribed to channels',
      channels,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error subscribing to channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to channels'
    });
  }
});

/**
 * POST /api/realtime/unsubscribe
 * Отписка от каналов (для совместимости с WebSocket)
 */
router.post('/unsubscribe', authenticateToken, (req: Request, res: Response) => {
  try {
    const { channels } = req.body;
    
    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({
        success: false,
        error: 'Channels array is required'
      });
    }
    
    res.json({
      success: true,
      message: 'Unsubscribed from channels',
      channels,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error unsubscribing from channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe from channels'
    });
  }
});

/**
 * POST /api/realtime/heartbeat
 * Heartbeat для поддержания соединения
 */
router.post('/heartbeat', authenticateToken, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      timestamp: Date.now(),
      message: 'Heartbeat received'
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process heartbeat'
    });
  }
});

export default router;