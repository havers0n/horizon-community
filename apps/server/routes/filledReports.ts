import { Router } from 'express';
import { pool } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router: import('express').Router = Router();

// Получить заполненные рапорты пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let whereClause = '';
    let params: any[] = [];
    if (!['admin', 'supervisor'].includes(user.role)) {
      whereClause = 'WHERE fr.author_id = $1';
      params.push(user.id);
    }

    const query = `
      SELECT fr.id, fr.template_id AS "templateId", fr.author_id AS "authorId", fr.title, fr.content, fr.status, fr.supervisor_comment AS "supervisorComment", fr.submitted_at AS "submittedAt", fr.created_at AS "createdAt", fr.updated_at AS "updatedAt",
             rt.title AS "templateTitle", u.username AS "authorUsername"
      FROM filled_reports fr
      LEFT JOIN report_templates rt ON fr.template_id = rt.id
      LEFT JOIN users u ON fr.author_id = u.id
      ${whereClause}
      ORDER BY fr.created_at DESC
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching filled reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить заполненный рапорт по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = `
      SELECT fr.id, fr.template_id AS "templateId", fr.author_id AS "authorId", fr.title, fr.content, fr.status, fr.supervisor_comment AS "supervisorComment", fr.submitted_at AS "submittedAt", fr.created_at AS "createdAt", fr.updated_at AS "updatedAt",
             rt.title AS "templateTitle", u.username AS "authorUsername"
      FROM filled_reports fr
      LEFT JOIN report_templates rt ON fr.template_id = rt.id
      LEFT JOIN users u ON fr.author_id = u.id
      WHERE fr.id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [parseInt(id)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const reportData = result.rows[0];
    // Проверяем права доступа
    if (!['admin', 'supervisor'].includes(user.role) && reportData.authorId !== user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    res.json(reportData);
  } catch (error) {
    console.error('Error fetching filled report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новый заполненный рапорт
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { templateId, title, content } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!templateId || !title || !content) {
      return res.status(400).json({ error: 'Template ID, title and content are required' });
    }

    // Проверяем существование шаблона
    const templateResult = await pool.query('SELECT id FROM report_templates WHERE id = $1 AND is_active = true', [templateId]);
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or inactive' });
    }

    const newReport = await pool.query(`
      INSERT INTO filled_reports (template_id, author_id, title, content, status)
      VALUES ($1, $2, $3, $4, 'draft')
      RETURNING id, template_id AS "templateId", author_id AS "authorId", title, content, status, created_at AS "createdAt", updated_at AS "updatedAt"
    `, [templateId, user.id, title, content]);

    res.status(201).json(newReport.rows[0]);
  } catch (error) {
    console.error('Error creating filled report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить заполненный рапорт
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title, content, status, supervisorComment } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Проверяем существование рапорта
    const existingReportResult = await pool.query('SELECT id, author_id, status FROM filled_reports WHERE id = $1', [parseInt(id)]);
    if (existingReportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = existingReportResult.rows[0];

    // Проверяем права доступа
    const canUpdate = ['admin', 'supervisor'].includes(user.role) || 
                     (report.authorId === user.id && report.status === 'draft');

    if (!canUpdate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Определяем, что можно обновлять
    const updateData: any = { updated_at: new Date() };

    if (title) updateData.title = title;
    if (content) updateData.content = content;

    // Статус и комментарий могут обновлять только админы/супервайзеры
    if (['admin', 'supervisor'].includes(user.role)) {
      if (status) {
        updateData.status = status;
        if (status === 'submitted' && report.status === 'draft') {
          updateData.submitted_at = new Date();
        }
      }
      if (supervisorComment !== undefined) {
        updateData.supervisor_comment = supervisorComment;
      }
    }

    const updatedReport = await pool.query(`
      UPDATE filled_reports
      SET ${Object.keys(updateData).map(key => `${key} = $${Object.keys(updateData).indexOf(key) + 1}`).join(', ')}
      WHERE id = $${Object.keys(updateData).length + 1}
      RETURNING id, template_id AS "templateId", author_id AS "authorId", title, content, status, supervisor_comment AS "supervisorComment", submitted_at AS "submittedAt", created_at AS "createdAt", updated_at AS "updatedAt"
    `, [...Object.values(updateData), parseInt(id)]);

    res.json(updatedReport.rows[0]);
  } catch (error) {
    console.error('Error updating filled report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отправить рапорт на рассмотрение
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Проверяем существование рапорта
    const existingReportResult = await pool.query('SELECT id, author_id, status FROM filled_reports WHERE id = $1', [parseInt(id)]);
    if (existingReportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = existingReportResult.rows[0];

    // Проверяем права доступа
    if (report.authorId !== user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Проверяем, что рапорт в статусе черновика
    if (report.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft reports can be submitted' });
    }

    const updatedReport = await pool.query(`
      UPDATE filled_reports
      SET status = 'submitted', submitted_at = $1, updated_at = $2
      WHERE id = $3
      RETURNING id, template_id AS "templateId", author_id AS "authorId", title, content, status, supervisor_comment AS "supervisorComment", submitted_at AS "submittedAt", created_at AS "createdAt", updated_at AS "updatedAt"
    `, [new Date(), new Date(), parseInt(id)]);

    res.json(updatedReport.rows[0]);
  } catch (error) {
    console.error('Error submitting filled report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить заполненный рапорт (только админы)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Проверяем существование рапорта
    const existingReportResult = await pool.query('SELECT id FROM filled_reports WHERE id = $1', [parseInt(id)]);
    if (existingReportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await pool.query('DELETE FROM filled_reports WHERE id = $1', [parseInt(id)]);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting filled report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить статистику рапортов
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let whereClause = '1=1';
    let params: any[] = [];
    
    // Если пользователь не админ/супервайзер, показываем только его статистику
    if (!['admin', 'supervisor'].includes(user.role)) {
      whereClause = 'author_id = $1';
      params.push(user.id);
    }

    const stats = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM filled_reports
      ${whereClause}
    `, params);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 