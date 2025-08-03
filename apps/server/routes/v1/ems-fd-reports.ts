import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../utils/validation';
import reportService from '../../services/ReportService';
import type { Database } from '../../../../packages/db-types/src/index';

type EmsFdReportsInsert = Database['mdt']['Tables']['ems_fd_reports']['Insert'];
type EmsFdReportsUpdate = Database['mdt']['Tables']['ems_fd_reports']['Update'];

const router = Router();

// ===== ZOD SCHEMAS =====
const IdParamSchema = z.object({ id: z.string().uuid() });

const EmsFdReportFiltersSchema = z.object({
  author_character_id: z.string().uuid().optional(),
  incident_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

const EmsFdReportCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  incident_location: z.string().min(1, 'Место инцидента обязательно'),
  incident_time: z.string().datetime('Некорректная дата инцидента'),
  incident_type: z.string().min(1, 'Тип инцидента обязателен'),
  call_id: z.string().uuid().optional().nullable(),
  fire_details: z.any().optional().nullable(),
  medications_administered: z.any().optional().nullable(),
  outcome: z.string().optional().nullable(),
  patients: z.any().optional().nullable(),
  treatment_provided: z.string().optional().nullable(),
  vital_signs: z.any().optional().nullable()
});

const EmsFdReportUpdateSchema = EmsFdReportCreateSchema.partial();

// ===== РОУТЫ =====

// Получить EMS/FD отчеты с фильтрацией
router.get('/', 
  validateRequest({ query: EmsFdReportFiltersSchema }), 
  async (req, res) => {
    try {
      const filters = req.query;
      const reports = await reportService.getEmsFdReports(filters);
      res.json(reports);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Получить EMS/FD отчет по ID
router.get('/:id', 
  validateRequest({ params: IdParamSchema }), 
  async (req, res) => {
    try {
      const report = await reportService.getEmsFdReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: 'Отчет не найден' });
      }
      res.json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Создать новый EMS/FD отчет
router.post('/', 
  requireRole('citizen'),
  validateRequest({ body: EmsFdReportCreateSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const data: EmsFdReportsInsert = {
        ...req.body,
        author_character_id: req.user?.id || ''
      };
      
      const report = await reportService.createEmsFdReport(data);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Обновить EMS/FD отчет
router.put('/:id', 
  requireRole('citizen'),
  validateRequest({ 
    params: IdParamSchema, 
    body: EmsFdReportUpdateSchema 
  }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      const updates: EmsFdReportsUpdate = req.body;
      const report = await reportService.updateEmsFdReport(req.params.id, updates);
      res.json(report);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

// Удалить EMS/FD отчет (только для admin)
router.delete('/:id', 
  requireRole('admin'),
  validateRequest({ params: IdParamSchema }), 
  async (req: AuthenticatedRequest, res) => {
    try {
      await reportService.deleteEmsFdReport(req.params.id);
      res.json({ message: 'Отчет успешно удален' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

export default router; 