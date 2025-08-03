import express from 'express';
import { IStorage } from '../storage';
import { ApplicationService } from '../services/ApplicationService';
import { authenticateToken, requireRole } from '../middleware/auth-fixed.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Мокаем ApplicationService для тестов
jest.mock('../services/ApplicationService', () => ({
  ApplicationService: jest.fn().mockImplementation(() => ({
    canSubmitApplication: jest.fn(),
    getUserApplicationStats: jest.fn(),
    advanceApplicationStatus: jest.fn(),
    getActiveJointPositions: jest.fn(),
    processJointApplication: jest.fn(),
    removeJointPosition: jest.fn(),
    resetMonthlyLimits: jest.fn()
  }))
}));

export function createTestRoutes(storage: IStorage, applicationService: ApplicationService): import('express').Router {
  // ===========================================
  // ТЕСТИРОВАНИЕ ЗАЯВОК
  // ===========================================

  router.post('/test/application-check', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, type } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const restriction = await applicationService.canSubmitApplication(userId, type);
      const stats = await applicationService.getUserApplicationStats(userId);

      res.json({
        restriction,
        stats,
        testInfo: {
          requestedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in application check test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===========================================
  // ТЕСТИРОВАНИЕ СОВМЕСТНЫХ ПОЗИЦИЙ
  // ===========================================

  router.get('/test/joint-positions/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const activeJoints = await applicationService.getActiveJointPositions(userId);

      res.json({
        activeJoints,
        testInfo: {
          requestedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in joint positions test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/test/joint-positions/:id/process', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { approved, comment } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await applicationService.processJointApplication(id, approved, req.user.id, comment);

      res.json({
        success: true,
        testInfo: {
          processedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in joint position processing test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===========================================
  // ТЕСТИРОВАНИЕ СТАТУСОВ ЗАЯВОК
  // ===========================================

  router.post('/test/application-status/:id', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { newStatus, comment } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const updatedApplication = await applicationService.advanceApplicationStatus(
        id,
        newStatus,
        req.user.id,
        comment
      );

      res.json({
        application: updatedApplication,
        testInfo: {
          updatedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in application status test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===========================================
  // ТЕСТИРОВАНИЕ СБРОСА ЛИМИТОВ
  // ===========================================

  router.post('/test/reset-limits', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await applicationService.resetMonthlyLimits();

      res.json({
        success: true,
        message: 'Monthly limits reset successfully',
        testInfo: {
          resetBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in reset limits test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===========================================
  // ТЕСТИРОВАНИЕ УДАЛЕНИЯ СОВМЕСТНЫХ ПОЗИЦИЙ
  // ===========================================

  router.delete('/test/joint-positions/:userId', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await applicationService.removeJointPosition(userId, reason);

      res.json({
        success: true,
        message: 'Joint position removed successfully',
        testInfo: {
          removedBy: req.user.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in joint position removal test:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
} 