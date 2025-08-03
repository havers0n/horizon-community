import express from 'express';
import { ApplicationLimitsService } from '../services/ApplicationLimitsService';
import { SupabaseStorage } from '../services/SupabaseStorage';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

const storage = new SupabaseStorage();
const notificationService = new NotificationService(storage);
const applicationLimitsService = new ApplicationLimitsService(storage, notificationService);

// GET /api/application-limits - Получить текущие лимиты
router.get('/', async (req, res) => {
  try {
    const limits = applicationLimitsService.getLimits();
    const stats = await applicationLimitsService.getResetStats();
    
    res.json({
      limits,
      stats
    });
  } catch (error) {
    console.error('Error getting application limits:', error);
    res.status(500).json({ error: 'Failed to get application limits' });
  }
});

// POST /api/application-limits/reset - Ручной сброс лимитов (только для админов)
router.post('/reset', async (req, res) => {
  try {
    await applicationLimitsService.manualResetLimits();
    
    res.json({
      success: true,
      message: 'Application limits reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting application limits:', error);
    res.status(500).json({ error: 'Failed to reset application limits' });
  }
});

// PUT /api/application-limits - Обновить лимиты (только для админов)
router.put('/', async (req, res) => {
  try {
    const { entryApplicationsPerMonth, leaveApplicationsPerMonth, promotionQualificationCooldownDays } = req.body;
    
    applicationLimitsService.updateLimits({
      entryApplicationsPerMonth,
      leaveApplicationsPerMonth,
      promotionQualificationCooldownDays
    });
    
    const updatedLimits = applicationLimitsService.getLimits();
    
    res.json({
      success: true,
      message: 'Application limits updated successfully',
      limits: updatedLimits,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating application limits:', error);
    res.status(500).json({ error: 'Failed to update application limits' });
  }
});

export default router;
