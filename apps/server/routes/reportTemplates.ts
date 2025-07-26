import express from 'express';
import { pool } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router: import('express').Router = express.Router();

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

    let whereConditions = ['is_active = true'];
    let params: any[] = [];
    let paramIndex = 1;

    // Фильтр по категории
    if (category && category !== 'all') {
      whereConditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    // Фильтр по подкатегории
    if (subcategory) {
      whereConditions.push(`subcategory = $${paramIndex++}`);
      params.push(subcategory);
    }

    // Фильтр по сложности
    if (difficulty && difficulty !== 'all') {
      whereConditions.push(`difficulty = $${paramIndex++}`);
      params.push(difficulty);
    }

    // Фильтр по департаменту
    if (departmentId) {
      whereConditions.push(`department_id = $${paramIndex++}`);
      params.push(parseInt(departmentId as string));
    }

    // Поиск по тексту
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR body ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Фильтр по тегам
    if (tags && Array.isArray(tags)) {
      const tagConditions = tags.map(tag => {
        whereConditions.push(`tags ILIKE $${paramIndex++}`);
        params.push(`%${tag}%`);
      });
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const templates = await pool.query(`
      SELECT * FROM report_templates 
      ${whereClause}
      ORDER BY created_at 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, parseInt(limit as string), parseInt(offset as string)]);

    res.json(templates.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить шаблон по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM report_templates WHERE id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(result.rows[0]);
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

    const result = await pool.query(
      `
        INSERT INTO report_templates (
          title, body, department_id, category, subcategory, purpose, who_fills, when_used,
          difficulty, estimated_time, required_fields, tags, created_by, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `,
      [
        title,
        body,
        departmentId || null,
        category,
        subcategory || null,
        purpose || null,
        whoFills || null,
        whenUsed || null,
        difficulty,
        estimatedTime,
        requiredFields,
        tags,
        user.id,
        true
      ]
    );

    res.status(201).json(result.rows[0]);
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

    const result = await pool.query(
      `
        UPDATE report_templates
        SET
          title = $1, body = $2, department_id = $3, category = $4, subcategory = $5,
          purpose = $6, who_fills = $7, when_used = $8, difficulty = $9, estimated_time = $10,
          required_fields = $11, tags = $12, is_active = $13, updated_at = NOW()
        WHERE id = $14
        RETURNING *
      `,
      [
        title,
        body,
        departmentId || null,
        category,
        subcategory || null,
        purpose || null,
        whoFills || null,
        whenUsed || null,
        difficulty,
        estimatedTime,
        requiredFields,
        tags,
        isActive,
        parseInt(id)
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(result.rows[0]);
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
    const result = await pool.query(
      'DELETE FROM report_templates WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
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
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN is_active = true THEN 1 END) AS active,
        COUNT(CASE WHEN is_active = false THEN 1 END) AS inactive
      FROM report_templates
    `);

    const total = parseInt(result.rows[0].total);
    const active = parseInt(result.rows[0].active);
    const inactive = parseInt(result.rows[0].inactive);
    
    const categoryStats: Record<string, number> = {};
    const difficultyStats: Record<string, number> = {};

    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) FROM report_templates GROUP BY category
    `);
    categoryResult.rows.forEach(row => {
      categoryStats[row.category] = parseInt(row.count);
    });

    const difficultyResult = await pool.query(`
      SELECT difficulty, COUNT(*) FROM report_templates GROUP BY difficulty
    `);
    difficultyResult.rows.forEach(row => {
      difficultyStats[row.difficulty] = parseInt(row.count);
    });

    res.json({
      total,
      active,
      inactive,
      byCategory: categoryStats,
      byDifficulty: difficultyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику по тегам
router.get('/stats/tags', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tags FROM report_templates WHERE is_active = true
    `);

    const tagCounts: Record<string, number> = {};
    
    result.rows.forEach(row => {
      if (row.tags && Array.isArray(row.tags)) {
        row.tags.forEach((tag: string) => {
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