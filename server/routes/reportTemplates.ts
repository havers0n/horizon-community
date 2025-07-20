import express from 'express';
import { db } from '../db';
import { reportTemplates } from '@shared/schema';
import { eq, and, or, like, inArray } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Получить все шаблоны (с фильтрацией)
router.get('/', authenticateToken, async (req, res) => {
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

    let whereConditions = [eq(reportTemplates.isActive, true)];

    // Фильтр по категории
    if (category && category !== 'all') {
      whereConditions.push(eq(reportTemplates.category, category as string));
    }

    // Фильтр по подкатегории
    if (subcategory) {
      whereConditions.push(eq(reportTemplates.subcategory, subcategory as string));
    }

    // Фильтр по сложности
    if (difficulty && difficulty !== 'all') {
      whereConditions.push(eq(reportTemplates.difficulty, difficulty as string));
    }

    // Фильтр по департаменту
    if (departmentId) {
      whereConditions.push(eq(reportTemplates.departmentId, parseInt(departmentId as string)));
    }

    // Поиск по тексту
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(reportTemplates.title, searchTerm),
          like(reportTemplates.purpose || '', searchTerm),
          like(reportTemplates.body, searchTerm)
        )
      );
    }

    // Фильтр по тегам
    if (tags && Array.isArray(tags)) {
      // Поиск шаблонов, содержащих хотя бы один из указанных тегов
      whereConditions.push(
        or(
          ...tags.map(tag => 
            like(reportTemplates.tags || [], `%${tag}%`)
          )
        )
      );
    }

    const templates = await db
      .select()
      .from(reportTemplates)
      .where(and(...whereConditions))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(reportTemplates.createdAt);

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить шаблон по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await db
      .select()
      .from(reportTemplates)
      .where(eq(reportTemplates.id, parseInt(id)))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новый шаблон (только для admin и supervisor)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
      return res.status(403).json({ error: 'Access denied' });
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

    const newTemplate = await db
      .insert(reportTemplates)
      .values({
        title,
        body,
        departmentId: departmentId || null,
        category,
        subcategory: subcategory || null,
        purpose: purpose || null,
        whoFills: whoFills || null,
        whenUsed: whenUsed || null,
        difficulty,
        estimatedTime,
        requiredFields,
        tags,
        createdBy: user.id,
        isActive: true
      })
      .returning();

    res.status(201).json(newTemplate[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить шаблон (только для admin и supervisor)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'supervisor')) {
      return res.status(403).json({ error: 'Access denied' });
    }

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

    const updatedTemplate = await db
      .update(reportTemplates)
      .set({
        title,
        body,
        departmentId: departmentId || null,
        category,
        subcategory: subcategory || null,
        purpose: purpose || null,
        whoFills: whoFills || null,
        whenUsed: whenUsed || null,
        difficulty,
        estimatedTime,
        requiredFields,
        tags,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(reportTemplates.id, parseInt(id)))
      .returning();

    if (updatedTemplate.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить шаблон (только для admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const deletedTemplate = await db
      .delete(reportTemplates)
      .where(eq(reportTemplates.id, parseInt(id)))
      .returning();

    if (deletedTemplate.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику шаблонов
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const stats = await db
      .select({
        total: reportTemplates.id,
        category: reportTemplates.category,
        difficulty: reportTemplates.difficulty,
        isActive: reportTemplates.isActive
      })
      .from(reportTemplates);

    const total = stats.length;
    const active = stats.filter(s => s.isActive).length;
    
    const categoryStats = stats.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyStats = stats.reduce((acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      total,
      active,
      inactive: total - active,
      byCategory: categoryStats,
      byDifficulty: difficultyStats
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить популярные теги
router.get('/stats/tags', authenticateToken, async (req, res) => {
  try {
    const templates = await db
      .select({ tags: reportTemplates.tags })
      .from(reportTemplates)
      .where(eq(reportTemplates.isActive, true));

    const tagCounts: Record<string, number> = {};
    
    templates.forEach(template => {
      if (template.tags && Array.isArray(template.tags)) {
        template.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json(popularTags);
  } catch (error) {
    console.error('Error fetching tag stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 