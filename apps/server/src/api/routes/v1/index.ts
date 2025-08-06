import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';
import { createCharacterRoutes } from './characters';
import { createAuthRoutes } from '../auth'; // <-- Импортируем фабричную функцию для auth роутов
import { authenticateToken } from '../../middleware/auth.middleware';

// Временные заглушки для остальных роутов
// TODO: Преобразовать все роуты в фабричные функции
const createAdminRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Admin routes - TODO: implement DI' }));
  return router;
};

const createReportTemplatesRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Report templates routes - TODO: implement DI' }));
  return router;
};

const createEmsFdReportsRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'EMS/FD reports routes - TODO: implement DI' }));
  return router;
};

const createLawReportsRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Law reports routes - TODO: implement DI' }));
  return router;
};

const createDiscordRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Discord routes - TODO: implement DI' }));
  return router;
};

const createForumRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Forum routes - TODO: implement DI' }));
  return router;
};

const createRealtimeRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Realtime routes - TODO: implement DI' }));
  return router;
};

/**
 * Фабричная функция для создания v1 роутера с внедренными сервисами
 * Разделяет публичные и защищенные маршруты
 */
export function createV1Router(services: ServicesContainer): Router {
  const router: Router = Router();

  // --- ШАГ 1: РЕГИСТРИСТРИРУЕМ ПУБЛИЧНЫЕ РОУТЫ ---
  // Роуты аутентификации (register, login, verify) должны быть доступны всем
  router.use('/auth', createAuthRoutes(services));

  // Health check endpoint (публичный)
  router.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      version: 'v1',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // --- ШАГ 2: ВЕШАЕМ "ОХРАННИКА" ---
  // Все, что будет зарегистрировано ПОСЛЕ этой строки,
  // будет требовать валидный токен
  router.use(authenticateToken);

  // --- ШАГ 3: РЕГИСТРИСТРИРУЕМ ЗАЩИЩЕННЫЕ РОУТЫ ---
  router.use('/admin', createAdminRoutes(services));
  router.use('/characters', createCharacterRoutes(services));
  router.use('/report-templates', createReportTemplatesRoutes(services));
  router.use('/ems-fd-reports', createEmsFdReportsRoutes(services));
  router.use('/law-reports', createLawReportsRoutes(services));
  router.use('/discord', createDiscordRoutes(services));
  router.use('/forum', createForumRoutes(services));
  router.use('/realtime', createRealtimeRoutes(services));

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createV1Router; 