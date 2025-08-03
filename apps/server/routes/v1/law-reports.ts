import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validation';
import reportService from '../../services/ReportService';
import type { Database } from '../../../../packages/db-types/src/index';

type LawReportsInsert = Database['mdt']['Tables']['law_reports']['Insert'];
type LawReportsUpdate = Database['mdt']['Tables']['law_reports']['Update'];

const router = Router();

// ===== ZOD SCHEMAS =====
const IdParamSchema = z.object({ id: z.string().uuid() });

const LawReportFiltersSchema = z.object({
  author_character_id: z.string().uuid().optional(),
  incident_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

const LawReportCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  incident_location: z.string().min(1, 'Место инцидента обязательно'),
  incident_time: z.string().datetime('Некорректная дата инцидента'),
  incident_type: z.string().min(1, 'Тип инцидента обязателен'),
  call_id: z.string().uuid().optional().nullable(),
  participants: z.any().optional().nullable(),
  penal_codes: z.any().optional().nullable(),
  seized_items: z.any().optional().nullable()
});

const LawReportUpdateSchema = LawReportCreateSchema.partial();

// ===== РОУТЫ =====

// Получить Law отчеты с фильтрацией
router.get('/', 
  validateRequest({ query: LawReportFiltersSchema }), 
  async (req, res) => {
    try {
      const filters = req.query;
      const reports = await reportService.getLawReports(filters);
      res.json(reports);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Получить Law отчет по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    try {
      const report = await reportService.getLawReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: 'Отчет не найден' });
      }
      res.json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Создать новый Law отчет
router.post('/', 
  requireRole('citizen'),
  validateRequest({ body: LawReportCreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: LawReportsInsert = {
        ...req.body,
        author_character_id: req.user?.id || ''
      };
      
      const report = await reportService.createLawReport(data);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Обновить Law отчет
router.put('/:id', 
  requireRole('citizen'),
  validateRequest({ 
    params: IdParamSchema, 
    body: LawReportUpdateSchema 
  }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const updates: LawReportsUpdate = req.body;
      const report = await reportService.updateLawReport(req.params.id, updates);
      res.json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Удалить Law отчет (только для admin)
router.delete('/:id', 
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      await reportService.deleteLawReport(req.params.id);
      res.json({ message: 'Отчет успешно удален' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

export default router; 