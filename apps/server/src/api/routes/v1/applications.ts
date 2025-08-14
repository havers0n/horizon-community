import { Router } from 'express';
import { z } from 'zod';
import type { ServicesContainer } from '../../../types/services';
import { validateRequest } from '../../../utils/validation';
import { ApplicationController } from '../../../core/controllers/ApplicationController';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { TestSessionService } from '../../../core/services/TestSessionService';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';

// Схема для ТЕЛА запроса на создание заявки
const createApplicationBodySchema = z
  .object({
    type: z.string().min(1, "Тип заявки обязателен"),
    // Валидация UUID департамента на верхнем уровне
    target_department_id: z.string().uuid("ID департамента должен быть UUID").optional(),
    // Разрешаем произвольную структуру data, поддерживаем JSON-строку (multipart)
    data: z
      .union([
        z.object({}).passthrough(),
        z
          .string()
          .transform((s, ctx) => {
            try {
              return JSON.parse(s);
            } catch {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'data (string) должен быть валидным JSON' });
              return z.NEVER;
            }
          })
          .pipe(z.object({}).passthrough()),
      ])
      .optional(),
  })
  .passthrough()
  .superRefine((body, ctx) => {
    const isUuid = (v: unknown): v is string =>
      typeof v === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

    const candidate = (body as any)?.target_department_id
      ?? (body as any)?.department_id
      ?? (body as any)?.data?.departmentId
      ?? (body as any)?.data?.department_id;

    // Для типов entry и joint целевой департамент обязателен
    if (body.type === 'entry' || body.type === 'joint') {
      if (!candidate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['target_department_id'],
          message: 'ID департамента обязателен для данного типа заявки',
        });
      } else if (!isUuid(candidate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['target_department_id'],
          message: 'ID департамента должен быть корректным UUID',
        });
      }
    } else if (candidate && !isUuid(candidate)) {
      // Для других типов, если передан департамент — проверим формат UUID
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target_department_id'],
        message: 'ID департамента должен быть корректным UUID',
      });
    }
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

  /**
   * POST /api/v1/applications
   * Создать новую заявку
   */
  router.post(
    '/',
    validateRequest({ body: createApplicationBodySchema }),
    (req: AuthenticatedRequest, res, next) => {
      const applicationService = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
      const testSessionService = new TestSessionService(req.supabase!.system);
      const controller = new ApplicationController(applicationService, testSessionService);
      return controller.createApplication(req, res, next);
    }
  );

  /**
   * GET /api/v1/applications/:id
   * Получить заявку по ID
   */
  router.get(
    '/:id',
    validateRequest({ params: paramsSchema }),
    (req: AuthenticatedRequest, res, next) => {
      const applicationService = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
      const testSessionService = new TestSessionService(req.supabase!.system);
      const controller = new ApplicationController(applicationService, testSessionService);
      return controller.getApplicationById(req, res, next);
    }
  );

  /**
   * PUT /api/v1/applications/:id/status
   * Обновить статус заявки
   */
  router.put(
    '/:id/status',
    validateRequest({ params: paramsSchema, body: updateStatusBodySchema }),
    (req: AuthenticatedRequest, res, next) => {
      const applicationService = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
      const testSessionService = new TestSessionService(req.supabase!.system);
      const controller = new ApplicationController(applicationService, testSessionService);
      return controller.updateApplicationStatus(req, res, next);
    }
  );

  /**
   * POST /api/v1/applications/:id/test-session
   * Создать сессию тестирования для заявки
   */
  router.post(
    '/:id/test-session',
    validateRequest({ params: paramsSchema }),
    (req: AuthenticatedRequest, res, next) => {
      const applicationService = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
      const testSessionService = new TestSessionService(req.supabase!.system);
      const controller = new ApplicationController(applicationService, testSessionService);
      return controller.createTestSession(req, res, next);
    }
  );

  return router;
}
