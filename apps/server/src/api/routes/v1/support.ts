// apps/server/src/api/routes/v1/support.ts

import { Router } from 'express';
import { z } from 'zod';
import { CabinetController } from '../../../core/controllers/CabinetController';
import { CabinetService } from '../../../core/services/CabinetService';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import type { ServicesContainer } from '../../../types/services';

// Схема валидации для тикетов службы поддержки
const createSupportTicketSchema = z.object({
  p_title: z.string()
    .min(5, 'Заголовок должен содержать от 5 до 200 символов')
    .max(200, 'Заголовок должен содержать от 5 до 200 символов'),
  p_initial_message: z.string()
    .min(10, 'Сообщение должно содержать от 10 до 2000 символов')
    .max(2000, 'Сообщение должно содержать от 10 до 2000 символов'),
});

// Схема валидации для добавления сообщений пользователями
const addSupportMessageSchema = z.object({
  content: z.string()
    .min(1, 'Сообщение не может быть пустым')
    .max(2000, 'Сообщение должно содержать не более 2000 символов'),
});

// Схема валидации для жалоб
const createComplaintSchema = z.object({
  p_incident_date: z.string().min(1, 'Дата инцидента обязательна'),
  p_title: z.string()
    .min(5, 'Заголовок должен содержать от 5 до 200 символов')
    .max(200, 'Заголовок должен содержать от 5 до 200 символов'),
  p_type: z.string().min(1, 'Тип жалобы обязателен'),
  p_participants: z.array(z.string()).min(1, 'Укажите хотя бы одного участника'),
  p_description: z.string()
    .min(10, 'Описание должно содержать от 10 до 2000 символов')
    .max(2000, 'Описание должно содержать от 10 до 2000 символов'),
  p_evidence: z.string().optional(),
});

export function createSupportRoutes(services: ServicesContainer): Router {
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
   * POST /api/v1/support/tickets
   * Создание нового тикета в службу поддержки
   */
  router.post(
    '/tickets',
    authenticateToken,
    validateRequest({ body: createSupportTicketSchema }),
    (req, res, next) => buildController(req).createSupportTicket(req, res, next)
  );

  /**
   * POST /api/v1/support/tickets/:id/messages
   * Добавление сообщения в тикет (для автора тикета)
   */
  router.post(
    '/tickets/:id/messages',
    authenticateToken,
    validateRequest({ body: addSupportMessageSchema }),
    (req, res, next) => buildController(req).addMessageToSupportTicketForUser(req, res, next)
  );

  /**
   * POST /api/v1/support/complaints
   * Создание новой жалобы
   */
  router.post(
    '/complaints',
    authenticateToken,
    validateRequest({ body: createComplaintSchema }),
    (req, res, next) => buildController(req).createComplaint(req, res, next)
  );

  /**
   * GET /api/v1/support/tickets/:id
   * Получение деталей конкретного тикета (для автора)
   */
  router.get(
    '/tickets/:id',
    authenticateToken,
    (req, res, next) => buildController(req).getSupportTicketDetailsForUser(req, res, next)
  );

  return router;
}