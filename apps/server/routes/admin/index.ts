import { Router } from 'express';
import supportRoutes from './support.routes.js';
import performanceRoutes from './performance.routes.js';

const router = Router();

// Регистрация всех admin маршрутов
router.use('/support', supportRoutes);
router.use('/performance', performanceRoutes);

export default router; 