import { Router } from 'express';
import { z } from 'zod';
import type { ServicesContainer } from '../../../types/services';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import { CabinetController } from '../../../core/controllers/CabinetController';
import { CabinetService } from '../../../core/services/CabinetService';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';

// Валидационные схемы (Правило №4)
const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'ru']).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
  privacy: z.object({
    profile_visible: z.boolean(),
    show_email: z.boolean(),
    show_phone: z.boolean(),
  }).optional(),
});

export function createCabinetRoutes(services: ServicesContainer): Router {
  const router = Router();

  // Пер-запросная фабрика контроллера: создаем сервисы на основе req.supabase
  const buildController = (req: any): CabinetController => {
    const supa = req.supabase;
    if (!supa) {
      throw new Error('Server configuration error: missing per-request Supabase client');
    }
    const cabinetService = new CabinetService(
      supa.public,
      new ApplicationService({ system: supa.system, common: supa.common, public: supa.public }),
      new ReportService(supa.mdt)
    );
    return new CabinetController(cabinetService);
  };

  /**
   * GET /api/v1/cabinet/dashboard-data
   * Получить все данные для дашборда пользователя
   */
  router.get(
    '/dashboard-data',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getDashboardData(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/profile
   * Получить профиль пользователя
   */
  router.get(
    '/profile',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserProfile(req, res, next)
  );

  /**
   * PUT /api/v1/cabinet/profile
   * Обновить профиль пользователя
   */
  router.put(
    '/profile',
    authenticateToken,
    validateRequest({ body: updateProfileSchema }), // Валидация с Zod
    (req, res, next) => buildController(req).updateUserProfile(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/character
   * Получить персонажа пользователя
   */
  router.get(
    '/character',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserCharacter(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/applications
   * Получить заявки пользователя
   */
  router.get(
    '/applications',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserApplications(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/reports
   * Получить отчеты пользователя
   */
  router.get(
    '/reports',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserReports(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/departments
   * Получить департаменты пользователя
   */
  router.get(
    '/departments',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserDepartments(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/settings
   * Получить настройки пользователя
   */
  router.get(
    '/settings',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserSettings(req, res, next)
  );

  /**
   * PUT /api/v1/cabinet/settings
   * Обновить настройки пользователя
   */
  router.put(
    '/settings',
    authenticateToken,
    validateRequest({ body: updateSettingsSchema }), // Валидация с Zod
    (req, res, next) => buildController(req).updateUserSettings(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/stats
   * Получить статистику пользователя
   */
  router.get(
    '/stats',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserStats(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/complaints
   * Получить жалобы пользователя
   */
  router.get(
    '/complaints',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => buildController(req).getUserComplaints(req, res, next)
  );

  return router;
} 