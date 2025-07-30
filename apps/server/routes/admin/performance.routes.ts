import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/auth.middleware';
import { databaseService } from '../../services/DatabaseService.js';
import { cacheService } from '../../services/CacheService.js';
import { logger } from '../../services/LoggerService.js';

const router: import('express').Router = Router();

// GET /api/admin/performance/cache-info
router.get('/cache-info', authenticateToken, ...requireAdmin, async (req, res) => {
  try {
    const cacheInfo = databaseService.getCacheInfo();
    
    res.status(200).json({
      success: true,
      data: {
        cacheSize: cacheInfo.size,
        cacheKeys: cacheInfo.keys,
        cacheStats: {
          totalKeys: cacheInfo.size,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      }
    });
  } catch (error) {
    logger.error('Error getting cache info', { error });
    res.status(500).json({ error: 'Ошибка получения информации о кэше' });
  }
});

// POST /api/admin/performance/invalidate-cache
router.post('/invalidate-cache', authenticateToken, ...requireAdmin, async (req, res) => {
  try {
    const { type } = req.body;
    
    switch (type) {
      case 'citizens':
        databaseService.invalidateCitizensCache();
        break;
      case 'departments':
        databaseService.invalidateDepartmentsCache();
        break;
      case 'stats':
        databaseService.invalidateStatsCache();
        break;
      case 'all':
        databaseService.invalidateAllCache();
        break;
      default:
        return res.status(400).json({ error: 'Неверный тип кэша' });
    }
    
    logger.info('Cache invalidated', { type, userId: req.user?.id });
    res.status(200).json({ success: true, message: `Кэш ${type} очищен` });
  } catch (error) {
    logger.error('Error invalidating cache', { error });
    res.status(500).json({ error: 'Ошибка очистки кэша' });
  }
});

// GET /api/admin/performance/stats
router.get('/stats', authenticateToken, ...requireAdmin, async (req, res) => {
  try {
    const systemStats = await databaseService.getSystemStats();
    
    res.status(200).json({
      success: true,
      data: {
        system: systemStats,
        performance: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });
  } catch (error) {
    logger.error('Error getting performance stats', { error });
    res.status(500).json({ error: 'Ошибка получения статистики производительности' });
  }
});

// GET /api/admin/performance/health
router.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: {
        size: cacheService.size(),
        status: 'operational'
      }
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router; 