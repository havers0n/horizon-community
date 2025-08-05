import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';

// Импортируем фабричные функции для всех роутов
import { createCharacterRoutes } from './characters';

// Импортируем настоящие auth роуты
import authRouter from '../auth';

// Временные заглушки для остальных роутов
// TODO: Преобразовать все роуты в фабричные функции
const createAdminRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Admin routes - TODO: implement DI' }));
  return router;
};

const createReportTemplatesRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Report templates routes - TODO: implement DI' }));
  return router;
};

const createEmsFdReportsRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'EMS/FD reports routes - TODO: implement DI' }));
  return router;
};

const createLawReportsRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Law reports routes - TODO: implement DI' }));
  return router;
};

const createDiscordRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Discord routes - TODO: implement DI' }));
  return router;
};

const createForumRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Forum routes - TODO: implement DI' }));
  return router;
};

const createRealtimeRoutes = (services: ServicesContainer) => {
  const router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Realtime routes - TODO: implement DI' }));
  return router;
};

/**
 * Фабричная функция для создания v1 роутера с внедренными сервисами
 */
export function createV1Router(services: ServicesContainer) {
  const router = Router();

  // API v1 Routes - Современная архитектура с DI
  router.use('/admin', createAdminRoutes(services));
  router.use('/auth', authRouter); // ✅ Используем настоящие auth роуты
  router.use('/characters', createCharacterRoutes(services));
  router.use('/report-templates', createReportTemplatesRoutes(services));
  router.use('/ems-fd-reports', createEmsFdReportsRoutes(services));
  router.use('/law-reports', createLawReportsRoutes(services));
  router.use('/discord', createDiscordRoutes(services));
  router.use('/forum', createForumRoutes(services));
  router.use('/realtime', createRealtimeRoutes(services));

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      version: 'v1',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createV1Router; 