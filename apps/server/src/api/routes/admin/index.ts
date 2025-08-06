import { Router } from 'express';
import supportRoutes from './support.routes';
import userMetadataRoutes from './user-metadata';

const router: Router = Router();

// Регистрация всех admin маршрутов
router.use('/support', supportRoutes);
router.use('/user-metadata', userMetadataRoutes);

export default router; 