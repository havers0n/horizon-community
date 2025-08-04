import { Router } from 'express';
import adminRoutes from '../admin';
import authRoutes from '../auth';
import characterRoutes from './characters';
import reportTemplatesRoutes from './report-templates';
import emsFdReportsRoutes from './ems-fd-reports';
import lawReportsRoutes from './law-reports';
import discordRoutes from '../discord';
import forumRoutes from '../forum';
import realtimeRoutes from '../realtime-simple';

const router = Router();

// API v1 Routes - Современная архитектура
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/characters', characterRoutes);
router.use('/report-templates', reportTemplatesRoutes);
router.use('/ems-fd-reports', emsFdReportsRoutes);
router.use('/law-reports', lawReportsRoutes);
router.use('/discord', discordRoutes);
router.use('/forum', forumRoutes);
router.use('/realtime', realtimeRoutes);

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