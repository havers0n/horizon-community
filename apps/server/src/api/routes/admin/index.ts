import { Router } from 'express';
import supportRoutes from './support.routes';
import userMetadataRoutes from './user-metadata';
import testsRoutes from './tests.routes';

const router: Router = Router();

// Регистрация всех admin маршрутов
router.use('/support', supportRoutes);
router.use('/user-metadata', userMetadataRoutes);
router.use('/tests', testsRoutes);

export default router; 