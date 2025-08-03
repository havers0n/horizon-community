import { Router } from 'express';
import adminRoutes from '../admin';
import authRoutes from '../auth';
import cadRoutes from '../cad';
import filledReportsRoutes from '../filledReports';
import mdtRoutes from '../mdt';
import normalizedCharacterRoutes from '../normalized-character.routes';
import reportTemplatesRoutes from '../reportTemplates';
import testRoutes from '../tests';
import discordRoutes from '../discord';
import forumRoutes from '../forum';
import realtimeRoutes from '../realtime-simple';
import schedulerRoutes from '../scheduler';
import applicationLimitsRoutes from '../applicationLimits';

const router = Router();

// API v1 Routes - Современная архитектура
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/cad', cadRoutes);
router.use('/mdt', mdtRoutes);
router.use('/characters', normalizedCharacterRoutes);
router.use('/reports/templates', reportTemplatesRoutes);
router.use('/reports/filled', filledReportsRoutes);
router.use('/tests', testRoutes);
router.use('/discord', discordRoutes);
router.use('/forum', forumRoutes);
router.use('/realtime', realtimeRoutes);
router.use('/scheduler', schedulerRoutes);
router.use('/application-limits', applicationLimitsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    version: 'v1',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router; 