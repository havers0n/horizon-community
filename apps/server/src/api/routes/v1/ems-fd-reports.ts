// apps/server/src/api/routes/v1/ems-fd-reports.ts

import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import reportService from '../../../core/services/ReportService';

// ПРАВИЛО 2: ✅ Импортируем ВСЕ типы напрямую из db-types
import type { EmsFdReportsInsert, EmsFdReportsUpdate } from 'db-types';
// Если zod-схемы есть в db-types, импортируем их оттуда для чистоты
// import { EmsFdReportCreateSchema, EmsFdReportUpdateSchema } from 'db-types/zod';

const router = Router();

// ===== ZOD SCHEMAS =====
const IdParamSchema = z.object({ id: z.string().uuid() });

const EmsFdReportFiltersSchema = z.object({
  author_character_id: z.string().uuid().optional(),
  incident_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

// Zod-схема для создания отчета. author_character_id теперь обязателен в body.
const CreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  incident_location: z.string().min(1, 'Место инцидента обязательно'),
  incident_time: z.string().datetime('Некорректная дата инцидента'),
  incident_type: z.string().min(1, 'Тип инцидента обязателен'),
  author_character_id: z.string().uuid(), // ✅ Требуем ID персонажа с клиента
  call_id: z.string().uuid().optional().nullable(),
  fire_details: z.any().optional().nullable(),
  medications_administered: z.any().optional().nullable(),
  outcome: z.string().optional().nullable(),
  patients: z.any().optional().nullable(),
  treatment_provided: z.string().optional().nullable(),
  vital_signs: z.any().optional().nullable()
});

const UpdateSchema = CreateSchema.partial();


// ===== РОУТЫ =====

// Получить EMS/FD отчеты с фильтрацией
router.get('/', 
  validateRequest({ query: EmsFdReportFiltersSchema }), 
  async (req, res) => {
    // req.query уже валидирован и типизирован
    const reports = await reportService.getEmsFdReports(req.query);
    res.json(reports);
  }
);

// Получить EMS/FD отчет по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    const report = await reportService.getEmsFdReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Отчет не найден' });
    }
    res.json(report);
  }
);

// Создать новый EMS/FD отчет
router.post('/', 
  requireRole('citizen'), // Убедимся, что пользователь авторизован
  validateRequest({ body: CreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    // ✅ Просто передаем валидированное тело запроса в сервис
    // Тип req.body уже соответствует EmsFdReportsInsert благодаря Zod
    const report = await reportService.createEmsFdReport(req.body);
    res.status(201).json(report);
  }
);

// Обновить EMS/FD отчет
router.put('/:id', 
  requireRole('citizen'), // TODO: Добавить проверку, что пользователь - автор отчета
  validateRequest({ 
    params: IdParamSchema, 
    body: UpdateSchema 
  }), 
  async (req: AuthenticatedRequest, res) => {
    // ✅ Просто передаем валидированное тело запроса в сервис
    const updates: EmsFdReportsUpdate = req.body;
    const report = await reportService.updateEmsFdReport(req.params.id, updates);
    res.json(report);
  }
);

// Удалить EMS/FD отчет
router.delete('/:id', 
  requireRole('admin'), // Только админ может удалять
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    await reportService.deleteEmsFdReport(req.params.id);
    // 204 No Content - стандартный ответ для успешного DELETE
    res.status(204).send();
  }
);

export default router;