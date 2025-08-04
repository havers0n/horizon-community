// apps/server/src/api/routes/v1/law-reports.ts

import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import reportService from '../../../core/services/ReportService';

// ПРАВИЛО 2: ✅ Импортируем ВСЕ типы напрямую из db-types
import type { LawReportsInsert, LawReportsUpdate } from 'db-types';

// Если есть Zod-схемы в db-types, лучше использовать их.
// Если нет, создаем их здесь, но они должны точно соответствовать типам Insert/Update.
import { LawReportCreateSchema, LawReportUpdateSchema } from 'db-types/zod'; // Предположим, они там есть

const router = Router();

// ===== ZOD SCHEMAS (Если их нет в db-types) =====
// ПРИМЕЧАНИЕ: Имена полей в Zod (camelCase) должны совпадать с API,
// а в базе (snake_case) - с типами Insert/Update.
// Zod-схемы можно дополнить трансформацией .transform(), чтобы конвертировать camelCase в snake_case
// Но для простоты сейчас оставим snake_case напрямую, как в базе.
const IdParamSchema = z.object({ id: z.string().uuid() });

const LawReportFiltersSchema = z.object({
  author_character_id: z.string().uuid().optional(),
  incident_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

// Zod-схема для создания отчета. author_character_id теперь обязателен в body.
const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  incident_location: z.string().min(1),
  incident_time: z.string().datetime(),
  incident_type: z.string().min(1),
  author_character_id: z.string().uuid(), // ✅ Требуем ID персонажа с клиента
  call_id: z.string().uuid().optional().nullable(),
  participants: z.any().optional().nullable(),
  penal_codes: z.any().optional().nullable(),
  seized_items: z.any().optional().nullable()
});

const UpdateSchema = CreateSchema.partial();


// ===== РОУТЫ =====

// Получить Law отчеты с фильтрацией
// ✅ Нет try/catch, доверяем глобальному обработчику
router.get('/', 
  validateRequest({ query: LawReportFiltersSchema }), 
  async (req, res) => {
    // req.query уже валидирован и типизирован
    const reports = await reportService.getLawReports(req.query);
    res.json(reports);
  }
);

// Получить Law отчет по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    const report = await reportService.getLawReportById(req.params.id);
    if (!report) {
      // Это не ошибка 500, а ожидаемый результат, обрабатываем здесь же
      return res.status(404).json({ message: 'Отчет не найден' });
    }
    res.json(report);
  }
);

// Создать новый Law отчет
router.post('/',
  requireRole('citizen'), // Проверяем, что пользователь авторизован
  validateRequest({ body: CreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    // ✅ Просто передаем валидированное тело запроса в сервис
    // Тип req.body уже соответствует LawReportsInsert благодаря Zod
    const report = await reportService.createLawReport(req.body);
    res.status(201).json(report);
  }
);

// Обновить Law отчет
router.put('/:id', 
  requireRole('citizen'), // TODO: Добавить проверку, что пользователь - автор отчета
  validateRequest({ 
    params: IdParamSchema, 
    body: UpdateSchema
  }), 
  async (req: AuthenticatedRequest, res) => {
    // ✅ Просто передаем валидированное тело запроса в сервис
    const updates: LawReportsUpdate = req.body;
    const report = await reportService.updateLawReport(req.params.id, updates);
    res.json(report);
  }
);

// Удалить Law отчет
router.delete('/:id', 
  requireRole('admin'), // Только админ может удалять
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    await reportService.deleteLawReport(req.params.id);
    // 204 No Content - стандартный ответ для успешного DELETE
    res.status(204).send();
  }
);

export default router;