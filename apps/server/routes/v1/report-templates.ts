import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validation';
import reportService from '../../services/ReportService';
import type { ReportTemplatesInsert, ReportTemplatesUpdate } from '../../lib/supabase';

const router = Router();

// ===== ZOD SCHEMAS =====
const IdParamSchema = z.object({ id: z.string().uuid() });

const ReportTemplateFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  difficulty: z.string().optional(),
  department_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

const ReportTemplateCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  body: z.string().min(1, 'Содержание обязательно'),
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

const ReportTemplateUpdateSchema = ReportTemplateCreateSchema.partial().extend({
  is_active: z.boolean().optional()
});

// ===== РОУТЫ =====

// Получить все шаблоны с фильтрацией
router.get('/', 
  validateRequest({ query: ReportTemplateFiltersSchema }), 
  async (req, res) => {
    try {
      const filters = req.query;
      const templates = await reportService.getReportTemplates(filters);
      res.json(templates);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Получить шаблон по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    try {
      const template = await reportService.getReportTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: 'Шаблон не найден' });
      }
      res.json(template);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Создать новый шаблон (только для admin и supervisor)
router.post('/', 
  requireRole('admin'),
  validateRequest({ body: ReportTemplateCreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const templateData: ReportTemplatesInsert = {
        ...req.body,
        created_by_character_id: req.user?.id // TODO: Получить character_id из профиля
      };
      
      const template = await reportService.createReportTemplate(templateData, req.user?.id || '');
      res.status(201).json(template);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Обновить шаблон (только для admin и supervisor)
router.put('/:id', 
  requireRole('admin'),
  validateRequest({ 
    params: IdParamSchema, 
    body: ReportTemplateUpdateSchema 
  }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const updates: ReportTemplatesUpdate = req.body;
      const template = await reportService.updateReportTemplate(req.params.id, updates);
      res.json(template);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Удалить шаблон (только для admin)
router.delete('/:id', 
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      await reportService.deleteReportTemplate(req.params.id);
      res.json({ message: 'Шаблон успешно удален' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Получить статистику шаблонов
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await reportService.getReportTemplateStats();
    res.json(stats);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// Получить статистику по тегам
router.get('/stats/tags', async (req, res) => {
  try {
    const tagStats = await reportService.getReportTemplateTagStats();
    res.json(tagStats);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

export default router; 