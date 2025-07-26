import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { Scheduler } from '../scheduler';

export function createSchedulerRoutes(scheduler: Scheduler): import('express').Router {
  const router = Router();

  /**
   * POST /api/scheduler/reset-limits - Ручной сброс лимитов (только для админов)
   */
  router.post('/reset-limits', authenticateToken, async (req, res) => {
    try {
      // Проверяем права администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await scheduler.manualResetLimits();
      res.json({ message: 'Monthly limits reset completed successfully' });
    } catch (error) {
      console.error('Error during manual limits reset:', error);
      res.status(500).json({ error: 'Failed to reset limits' });
    }
  });

  /**
   * POST /api/scheduler/process-leaves - Ручная обработка отпусков (только для админов)
   */
  router.post('/process-leaves', authenticateToken, async (req, res) => {
    try {
      // Проверяем права администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await scheduler.manualProcessLeaves();
      res.json({ message: 'Leave processing completed successfully' });
    } catch (error) {
      console.error('Error during manual leave processing:', error);
      res.status(500).json({ error: 'Failed to process leaves' });
    }
  });

  /**
   * GET /api/scheduler/status - Статус планировщика (только для админов)
   */
  router.get('/status', authenticateToken, async (req, res) => {
    try {
      // Проверяем права администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      nextDay.setHours(9, 0, 0, 0);

      res.json({
        scheduler: {
          status: 'running',
          nextLimitsReset: nextMonth.toISOString(),
          nextLeaveProcessing: nextDay.toISOString(),
          timezone: 'Europe/Moscow'
        },
        currentTime: now.toISOString()
      });
    } catch (error) {
      console.error('Error getting scheduler status:', error);
      res.status(500).json({ error: 'Failed to get scheduler status' });
    }
  });

  return router;
} 