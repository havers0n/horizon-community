import express from 'express';
import { authenticateToken, requireAnyRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { reportTemplateService } from '../services/ReportTemplateService.js';
import type { Database } from '../../../packages/db-types/src/index';

type ReportTemplate = Database['mdt']['Tables']['report_templates']['Row'];

const router: import('express').Router = express.Router();

// Получить все шаблоны (с фильтрацией)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      category, 
      subcategory, 
      difficulty, 
      departmentId, 
      search,
      tags,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      category: category as string,
      subcategory: subcategory as string,
      difficulty: difficulty as string,
      departmentId: departmentId as string,
      search: search as string,
      tags: Array.isArray(tags) ? tags as string[] : undefined,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0
    };

    const templates = await reportTemplateService.getReportTemplates(filters);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить шаблон по ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const template = await reportTemplateService.getReportTemplateById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новый шаблон (только для admin и supervisor)
router.post('/', authenticateToken, requireAnyRole(['admin', 'supervisor']), async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      title,
      body,
      departmentId,
      category = 'general',
      subcategory,
      purpose,
      whoFills,
      whenUsed,
      difficulty = 'medium',
      estimatedTime = 10,
      requiredFields = [],
      tags = []
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Получаем character_id пользователя (пока используем user.id как fallback)
    const createdByCharacterId = user.id; // TODO: Получить character_id из профиля пользователя

    const templateData = {
      title,
      body,
      department_id: departmentId || null,
      category,
      subcategory: subcategory || null,
      purpose: purpose || null,
      who_fills: whoFills || null,
      when_used: whenUsed || null,
      difficulty,
      estimated_time: estimatedTime,
      required_fields: requiredFields,
      tags,
      instructions: null // Добавляем поле instructions если нужно
    };

    const template = await reportTemplateService.createReportTemplate(templateData, createdByCharacterId);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить шаблон (только для admin и supervisor)
router.put('/:id', authenticateToken, requireAnyRole(['admin', 'supervisor']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      body,
      departmentId,
      category,
      subcategory,
      purpose,
      whoFills,
      whenUsed,
      difficulty,
      estimatedTime,
      requiredFields,
      tags,
      isActive
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const updateData = {
      title,
      body,
      department_id: departmentId || null,
      category,
      subcategory: subcategory || null,
      purpose: purpose || null,
      who_fills: whoFills || null,
      when_used: whenUsed || null,
      difficulty,
      estimated_time: estimatedTime,
      required_fields: requiredFields,
      tags,
      is_active: isActive,
      instructions: null // Добавляем поле instructions если нужно
    };

    const template = await reportTemplateService.updateReportTemplate(id, updateData);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить шаблон (только для admin)
router.delete('/:id', authenticateToken, requireAnyRole(['admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const success = await reportTemplateService.deleteReportTemplate(id);

    if (!success) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику шаблонов
router.get('/stats/overview', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await reportTemplateService.getReportTemplateStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику по тегам
router.get('/stats/tags', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tagStats = await reportTemplateService.getReportTemplateTagStats();
    res.json(tagStats);
  } catch (error) {
    console.error('Error fetching tag stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 