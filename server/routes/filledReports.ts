import { Router } from 'express';
import { db } from '../db';
import { filledReports, reportTemplates, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Получить заполненные рапорты пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = db
      .select({
        id: filledReports.id,
        templateId: filledReports.templateId,
        authorId: filledReports.authorId,
        title: filledReports.title,
        content: filledReports.content,
        status: filledReports.status,
        supervisorComment: filledReports.supervisorComment,
        submittedAt: filledReports.submittedAt,
        createdAt: filledReports.createdAt,
        updatedAt: filledReports.updatedAt,
        templateTitle: reportTemplates.title,
        authorUsername: users.username
      })
      .from(filledReports)
      .leftJoin(reportTemplates, eq(filledReports.templateId, reportTemplates.id))
      .leftJoin(users, eq(filledReports.authorId, users.id))
      .orderBy(desc(filledReports.createdAt));

    // Если пользователь не админ/супервайзер, показываем только его рапорты
    if (!['admin', 'supervisor'].includes(user.role)) {
      query = query.where(eq(filledReports.authorId, user.id));
    }

    const reports = await query;

    res.json(reports);
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

    const report = await db
      .select({
        id: filledReports.id,
        templateId: filledReports.templateId,
        authorId: filledReports.authorId,
        title: filledReports.title,
        content: filledReports.content,
        status: filledReports.status,
        supervisorComment: filledReports.supervisorComment,
        submittedAt: filledReports.submittedAt,
        createdAt: filledReports.createdAt,
        updatedAt: filledReports.updatedAt,
        templateTitle: reportTemplates.title,
        authorUsername: users.username
      })
      .from(filledReports)
      .leftJoin(reportTemplates, eq(filledReports.templateId, reportTemplates.id))
      .leftJoin(users, eq(filledReports.authorId, users.id))
      .where(eq(filledReports.id, parseInt(id)))
      .limit(1);

    if (report.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = report[0];

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
    const template = await db
      .select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.id, templateId),
        eq(reportTemplates.isActive, true)
      ))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: 'Template not found or inactive' });
    }

    const newReport = await db
      .insert(filledReports)
      .values({
        templateId,
        authorId: user.id,
        title,
        content,
        status: 'draft'
      })
      .returning();

    res.status(201).json(newReport[0]);
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
    const existingReport = await db
      .select()
      .from(filledReports)
      .where(eq(filledReports.id, parseInt(id)))
      .limit(1);

    if (existingReport.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = existingReport[0];

    // Проверяем права доступа
    const canUpdate = ['admin', 'supervisor'].includes(user.role) || 
                     (report.authorId === user.id && report.status === 'draft');

    if (!canUpdate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Определяем, что можно обновлять
    const updateData: any = { updatedAt: new Date() };

    if (title) updateData.title = title;
    if (content) updateData.content = content;

    // Статус и комментарий могут обновлять только админы/супервайзеры
    if (['admin', 'supervisor'].includes(user.role)) {
      if (status) {
        updateData.status = status;
        if (status === 'submitted' && report.status === 'draft') {
          updateData.submittedAt = new Date();
        }
      }
      if (supervisorComment !== undefined) {
        updateData.supervisorComment = supervisorComment;
      }
    }

    const updatedReport = await db
      .update(filledReports)
      .set(updateData)
      .where(eq(filledReports.id, parseInt(id)))
      .returning();

    res.json(updatedReport[0]);
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
    const existingReport = await db
      .select()
      .from(filledReports)
      .where(eq(filledReports.id, parseInt(id)))
      .limit(1);

    if (existingReport.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = existingReport[0];

    // Проверяем права доступа
    if (report.authorId !== user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Проверяем, что рапорт в статусе черновика
    if (report.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft reports can be submitted' });
    }

    const updatedReport = await db
      .update(filledReports)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(filledReports.id, parseInt(id)))
      .returning();

    res.json(updatedReport[0]);
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
    const existingReport = await db
      .select()
      .from(filledReports)
      .where(eq(filledReports.id, parseInt(id)))
      .limit(1);

    if (existingReport.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await db
      .delete(filledReports)
      .where(eq(filledReports.id, parseInt(id)));

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

    let whereClause = sql`1=1`;
    
    // Если пользователь не админ/супервайзер, показываем только его статистику
    if (!['admin', 'supervisor'].includes(user.role)) {
      whereClause = sql`author_id = ${user.id}`;
    }

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        draft: sql<number>`count(*) filter (where status = 'draft')`,
        submitted: sql<number>`count(*) filter (where status = 'submitted')`,
        approved: sql<number>`count(*) filter (where status = 'approved')`,
        rejected: sql<number>`count(*) filter (where status = 'rejected')`
      })
      .from(filledReports)
      .where(whereClause);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 