import { Router } from 'express';
import { z } from 'zod';
import type { ServicesContainer } from '../../../types/services';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import { CabinetController } from '../../../core/controllers/CabinetController';

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
  const { cabinetService } = services;
  const cabinetController = new CabinetController(cabinetService);

  /**
   * GET /api/v1/cabinet/dashboard-data
   * Получить все данные для дашборда пользователя
   */
  router.get(
    '/dashboard-data',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getDashboardData(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/profile
   * Получить профиль пользователя
   */
  router.get(
    '/profile',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserProfile(req, res, next)
  );

  /**
   * PUT /api/v1/cabinet/profile
   * Обновить профиль пользователя
   */
  router.put(
    '/profile',
    authenticateToken,
    validateRequest({ body: updateProfileSchema }), // Валидация с Zod
    (req, res, next) => cabinetController.updateUserProfile(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/character
   * Получить персонажа пользователя
   */
  router.get(
    '/character',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserCharacter(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/applications
   * Получить заявки пользователя
   */
  router.get(
    '/applications',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserApplications(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/reports
   * Получить отчеты пользователя
   */
  router.get(
    '/reports',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserReports(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/departments
   * Получить департаменты пользователя
   */
  router.get(
    '/departments',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserDepartments(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/settings
   * Получить настройки пользователя
   */
  router.get(
    '/settings',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserSettings(req, res, next)
  );

  /**
   * PUT /api/v1/cabinet/settings
   * Обновить настройки пользователя
   */
  router.put(
    '/settings',
    authenticateToken,
    validateRequest({ body: updateSettingsSchema }), // Валидация с Zod
    (req, res, next) => cabinetController.updateUserSettings(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/stats
   * Получить статистику пользователя
   */
  router.get(
    '/stats',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserStats(req, res, next)
  );

  /**
   * GET /api/v1/cabinet/complaints
   * Получить жалобы пользователя
   */
  router.get(
    '/complaints',
    authenticateToken,
    validateRequest({}), // Декларативная валидация (пустая для GET)
    (req, res, next) => cabinetController.getUserComplaints(req, res, next)
  );

  return router;
} 