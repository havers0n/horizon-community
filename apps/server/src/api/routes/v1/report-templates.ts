// apps/server/src/api/routes/v1/report-templates.ts

import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import reportService from '../../../core/services/ReportService';

// ПРАВИЛО 2: ✅ Импортируем ВСЕ типы напрямую из db-types
import type { ReportTemplatesInsert, ReportTemplatesUpdate } from 'db-types';

const router = Router();

// ===== ZOD SCHEMAS =====
const IdParamSchema = z.object({ id: z.string().uuid() });

const ReportTemplateFiltersSchema = z.object({
  category: z.string().optional(),
  department_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

// Zod-схема для создания. 
// ВАЖНО: Мы изменили метод сервиса createReportTemplate, чтобы он принимал единый объект,
// поэтому Zod-схема должна включать все необходимые поля.
const CreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  body: z.string().min(1, 'Содержание обязательно'),
  created_by_character_id: z.string().uuid(), // ✅ Требуем ID персонажа с клиента
  department_id: z.string().uuid().optional().nullable(),
  category: z.string().optional(),
  subcategory: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  who_fills: z.string().optional().nullable(),
  when_used: z.string().optional().nullable(),
  difficulty: z.string().optional(),
  estimated_time: z.number().optional(),
  required_fields: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  instructions: z.string().optional().nullable()
});

const UpdateSchema = CreateSchema.partial().extend({
  is_active: z.boolean().optional() // Позволяем обновлять и этот флаг
});

// ПРИМЕЧАНИЕ ПО РЕФАКТОРИНГУ:
// Мы немного изменим сигнатуру метода в ReportService для соответствия паттерну.
// Было: createReportTemplate(templateData, createdByCharacterId)
// Станет: createReportTemplate(data: ReportTemplatesInsert)
// Это сделает код чище. Пожалуйста, внеси это изменение и в ReportService.ts

/*
// В файле ReportService.ts нужно будет изменить метод:
public async createReportTemplate(templateData: ReportTemplatesInsert): Promise<ReportTemplates> {
  const insertData = {
    ...templateData,
    is_active: true, // По умолчанию всегда активен при создании
  };

  const { data, error } = await this.supabase
    .from('report_templates')
    .insert(insertData)
    .select()
    .single();

  if (error || !data) {
    console.error('[ReportService] Error creating report template:', error);
    throw new AppError('Не удалось создать шаблон отчета.', 500);
  }

  return data;
}
*/


// ===== РОУТЫ =====

// Получить все шаблоны с фильтрацией
router.get('/', 
  validateRequest({ query: ReportTemplateFiltersSchema }), 
  async (req, res) => {
    const templates = await reportService.getReportTemplates(req.query);
    res.json(templates);
  }
);

// Получить шаблон по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    const template = await reportService.getReportTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Шаблон не найден' });
    }
    res.json(template);
  }
);

// Создать новый шаблон
router.post('/', 
  requireRole('admin'), // Только админы могут создавать шаблоны
  validateRequest({ body: CreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    // ✅ Просто передаем валидированное тело запроса в сервис
    const template = await reportService.createReportTemplate(req.body);
    res.status(201).json(template);
  }
);

// Обновить шаблон
router.put('/:id', 
  requireRole('admin'),
  validateRequest({ 
    params: IdParamSchema, 
    body: UpdateSchema 
  }), 
  async (req: AuthenticatedRequest, res) => {
    const updates: ReportTemplatesUpdate = req.body;
    const template = await reportService.updateReportTemplate(req.params.id, updates);
    res.json(template);
  }
);

// Удалить шаблон
router.delete('/:id', 
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    await reportService.deleteReportTemplate(req.params.id);
    res.status(204).send();
  }
);

// Получить статистику
router.get('/stats/overview', async (req, res) => {
  const stats = await reportService.getReportTemplateStats();
  res.json(stats);
});

// Получить статистику по тегам
router.get('/stats/tags', async (req, res) => {
  const tagStats = await reportService.getReportTemplateTagStats();
  res.json(tagStats);
});

export default router;