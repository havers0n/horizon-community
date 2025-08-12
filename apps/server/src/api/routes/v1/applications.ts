import { Router } from 'express';
import { z } from 'zod';
import type { ServicesContainer } from '../../../types/services';
import { validateRequest } from '../../../utils/validation';
import { ApplicationController } from '../../../core/controllers/ApplicationController';

// Схема для ТЕЛА запроса на создание заявки
const createApplicationBodySchema = z.object({
  type: z.string().min(1, "Тип заявки обязателен"),
  data: z.any().optional(),
});

// Схема для ПАРАМЕТРОВ запроса
const paramsSchema = z.object({
  id: z.string().uuid("ID должен быть в формате UUID"),
});

// Схема для ТЕЛА запроса на обновление статуса
const updateStatusBodySchema = z.object({
  status: z.enum([
      'awaiting_review',
      'awaiting_interview',
      'interview_scheduled',
      'approved',
      'rejected',
      'on_hold',
      'withdrawn'
  ]),
});

export function createApplicationRoutes(services: ServicesContainer): Router {
  const router = Router();
  const { applicationService, testSessionService } = services;
  const applicationController = new ApplicationController(applicationService, testSessionService);

  /**
   * POST /api/v1/applications
   * Создать новую заявку
   */
  router.post(
    '/',
    validateRequest({ body: createApplicationBodySchema }),
    (req, res, next) => applicationController.createApplication(req, res, next)
  );

  /**
   * GET /api/v1/applications/:id
   * Получить заявку по ID
   */
  router.get(
    '/:id',
    validateRequest({ params: paramsSchema }),
    (req, res, next) => applicationController.getApplicationById(req, res, next)
  );

  /**
   * PUT /api/v1/applications/:id/status
   * Обновить статус заявки
   */
  router.put(
    '/:id/status',
    validateRequest({ params: paramsSchema, body: updateStatusBodySchema }),
    (req, res, next) => applicationController.updateApplicationStatus(req, res, next)
  );

  /**
   * POST /api/v1/applications/:id/test-session
   * Создать сессию тестирования для заявки
   */
  router.post(
    '/:id/test-session',
    validateRequest({ params: paramsSchema }),
    (req, res, next) => applicationController.createTestSession(req, res, next)
  );

  return router;
}
