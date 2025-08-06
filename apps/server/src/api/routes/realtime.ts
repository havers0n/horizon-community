import { Router, Request, Response } from 'express';
import { realTimeService } from '../../core/services/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getCADWebSocket } from '../../websocket.js';

const router: Router = Router();

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
    
    realTimeService.broadcastEvent(type, data, channels);
    
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
    
    const events = realTimeService.getEventsForChannels(channelList, since);
    
    res.json({
      success: true,
      events,
      timestamp: Date.now(),
      count: events.length
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
    const stats = realTimeService.getCacheStats();
    const wsServer = getCADWebSocket();
    
    res.json({
      success: true,
      cache: stats,
      websocket: {
        connectedClients: wsServer ? wsServer.getStats().connectedClients : 0,
        totalEvents: wsServer ? wsServer.getStats().totalEvents : 0
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