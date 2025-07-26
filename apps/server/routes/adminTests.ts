import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';
import { pool } from '../db/index.js';

const router: import('express').Router = Router();

// Схемы валидации
const createTestSchema = z.object({
  title: z.string().min(1, 'Название теста обязательно'),
  description: z.string().min(1, 'Описание теста обязательно'),
  category: z.enum(['entry', 'medical', 'fire', 'police']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  durationMinutes: z.number().min(1).max(180),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string().min(1),
    type: z.enum(['single', 'multiple', 'text']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
    points: z.number().min(1).max(10)
  })).min(1, 'Тест должен содержать хотя бы один вопрос'),
  isActive: z.boolean().default(true)
});

const updateTestSchema = createTestSchema.partial();

const updateResultStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comment: z.string().optional()
});

/**
 * GET /api/admin/tests - Получить все тесты для админа
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allTestsResult = await pool.query('SELECT * FROM tests ORDER BY id DESC');
    const allTests = allTestsResult.rows;

    // Получаем статистику для каждого теста
    const testsWithStats = await Promise.all(
      allTests.map(async (test) => {
        const resultsResult = await pool.query('SELECT * FROM test_results WHERE test_id = $1', [test.id]);
        const results = resultsResult.rows;

        const totalAttempts = results.length;
        const passedAttempts = results.filter(r => r.passed).length;
        const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

        return {
          ...test,
          totalAttempts,
          passRate,
          questionsCount: Array.isArray(test.questions) ? test.questions.length : 0
        };
      })
    );

    res.json({ tests: testsWithStats });
  } catch (error) {
    console.error('Error fetching admin tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

/**
 * POST /api/admin/tests - Создать новый тест
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = createTestSchema.parse(req.body);

    const newTestResult = await pool.query(`
      INSERT INTO tests (title, description, related_to, duration_minutes, questions, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      validatedData.title,
      validatedData.description,
      JSON.stringify({
        category: validatedData.category,
        difficulty: validatedData.difficulty
      }),
      validatedData.durationMinutes,
      JSON.stringify(validatedData.questions),
      validatedData.isActive
    ]);

    res.status(201).json({ test: newTestResult.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

/**
 * PUT /api/admin/tests/:id - Обновить тест
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const validatedData = updateTestSchema.parse(req.body);

    const existingTest = await pool.query('SELECT * FROM tests WHERE id = $1', [testId]);

    if (existingTest.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.durationMinutes) updateData.durationMinutes = validatedData.durationMinutes;
    if (validatedData.questions) updateData.questions = validatedData.questions;
    
    if (validatedData.category || validatedData.difficulty) {
      updateData.relatedTo = {
        ...(JSON.parse(existingTest.rows[0].related_to)),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.difficulty && { difficulty: validatedData.difficulty })
      };
    }

    const updatedTest = await pool.query(`
      UPDATE tests
      SET ${Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ')}
      WHERE id = $1
      RETURNING *
    `, [testId, ...Object.values(updateData)]);

    res.json({ test: updatedTest.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

/**
 * DELETE /api/admin/tests/:id - Удалить тест
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testId = parseInt(req.params.id);

    // Проверяем, есть ли активные сессии или результаты для этого теста
    const activeSessions = await pool.query('SELECT * FROM test_sessions WHERE test_id = $1 AND status = $2', [testId, 'in_progress']);

    if (activeSessions.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete test with active sessions' 
      });
    }

    // Удаляем тест (результаты и сессии удалятся каскадно)
    await pool.query('DELETE FROM tests WHERE id = $1', [testId]);

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

/**
 * GET /api/admin/tests/results - Получить все результаты тестов
 */
router.get('/results', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, testId } = req.query;

    let whereClause: string | undefined = undefined;
    
    if (status && status !== 'all') {
      whereClause = `status = '${status}'`;
    }
    
    if (testId) {
      const testIdCondition = `test_id = ${parseInt(testId as string)}`;
      whereClause = whereClause ? `${whereClause} AND ${testIdCondition}` : testIdCondition;
    }

    const results = await pool.query(`
      SELECT
        tr.id,
        u.username,
        t.title,
        tr.score,
        tr.max_score,
        tr.percentage,
        tr.passed,
        tr.time_spent,
        tr.focus_lost_count,
        tr.warnings_count,
        tr.created_at,
        tr.status,
        tr.admin_comment
      FROM test_results tr
      LEFT JOIN users u ON tr.user_id = u.id
      LEFT JOIN tests t ON tr.test_id = t.id
      WHERE ${whereClause || '1=1'}
      ORDER BY tr.created_at DESC
    `);

    res.json({ results: results.rows });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

/**
 * PUT /api/admin/tests/results/:id/status - Обновить статус результата теста
 */
router.put('/results/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const { status, comment } = updateResultStatusSchema.parse(req.body);

    const result = await pool.query('SELECT * FROM test_results WHERE id = $1', [resultId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    // Обновляем статус результата
    const updatedResult = await pool.query(`
      UPDATE test_results
      SET status = $1, admin_comment = $2
      WHERE id = $3
      RETURNING *
    `, [status, comment, resultId]);

    // Если результат одобрен и связан с заявкой, обновляем статус заявки
    if (status === 'approved' && result.rows[0].application_id) {
      // Здесь можно добавить логику обновления статуса заявки
      // await updateApplicationStatus(result.applicationId, 'test_passed');
    }

    res.json({ result: updatedResult.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating test result status:', error);
    res.status(500).json({ error: 'Failed to update test result status' });
  }
});

/**
 * GET /api/admin/tests/analytics - Получить аналитику тестов
 */
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Общая статистика
    const totalTests = await pool.query('SELECT COUNT(*) FROM tests');
    const totalAttempts = await pool.query('SELECT COUNT(*) FROM test_results');
    const totalPassed = await pool.query('SELECT COUNT(*) FROM test_results WHERE passed = true');

    // Статистика по тестам
    const testStats = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.related_to->>'category' AS category,
        t.related_to->>'difficulty' AS difficulty,
        COUNT(tr.id) AS total_attempts,
        COUNT(tr.id) FILTER (WHERE tr.passed = true) AS passed_attempts,
        AVG(tr.percentage) AS avg_score,
        AVG(tr.time_spent) AS avg_time
      FROM tests t
      LEFT JOIN test_results tr ON t.id = tr.test_id
      GROUP BY t.id, t.title
      ORDER BY COUNT(tr.id) DESC
    `);

    // Статистика по времени
    const timeStats = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM created_at) AS hour,
        COUNT(*) AS attempts
      FROM test_results
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `);

    const analytics = {
      overview: {
        totalTests: totalTests.rows[0].count,
        totalAttempts: totalAttempts.rows[0].count,
        totalPassed: totalPassed.rows[0].count,
        passRate: totalAttempts.rows[0].count > 0 
          ? Math.round((totalPassed.rows[0].count / totalAttempts.rows[0].count) * 100) 
          : 0
      },
      testStats: testStats.rows.map(stat => ({
        ...stat,
        passRate: stat.total_attempts > 0 
          ? Math.round((stat.passed_attempts / stat.total_attempts) * 100) 
          : 0
      })),
      timeStats: timeStats.rows
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: 'Failed to fetch test analytics' });
  }
});

export default router; 