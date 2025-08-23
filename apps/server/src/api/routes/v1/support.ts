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

  return router;
}