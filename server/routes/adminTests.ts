import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';
import { db } from '../db/index.js';
import { tests, testResults, testSessions, users } from '../../shared/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

const router = Router();

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
    const allTests = await db.query.tests.findMany({
      orderBy: [desc(tests.id)]
    });

    // Получаем статистику для каждого теста
    const testsWithStats = await Promise.all(
      allTests.map(async (test) => {
        const results = await db.query.testResults.findMany({
          where: eq(testResults.testId, test.id)
        });

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

    const newTest = await db.insert(tests).values({
      title: validatedData.title,
      description: validatedData.description,
      relatedTo: {
        category: validatedData.category,
        difficulty: validatedData.difficulty
      },
      durationMinutes: validatedData.durationMinutes,
      questions: validatedData.questions
    }).returning();

    res.status(201).json({ test: newTest[0] });
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

    const existingTest = await db.query.tests.findFirst({
      where: eq(tests.id, testId)
    });

    if (!existingTest) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updateData: any = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.durationMinutes) updateData.durationMinutes = validatedData.durationMinutes;
    if (validatedData.questions) updateData.questions = validatedData.questions;
    
    if (validatedData.category || validatedData.difficulty) {
      updateData.relatedTo = {
        ...existingTest.relatedTo,
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.difficulty && { difficulty: validatedData.difficulty })
      };
    }

    const updatedTest = await db.update(tests)
      .set(updateData)
      .where(eq(tests.id, testId))
      .returning();

    res.json({ test: updatedTest[0] });
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
    const activeSessions = await db.query.testSessions.findMany({
      where: and(
        eq(testSessions.testId, testId),
        eq(testSessions.status, 'in_progress')
      )
    });

    if (activeSessions.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete test with active sessions' 
      });
    }

    // Удаляем тест (результаты и сессии удалятся каскадно)
    await db.delete(tests).where(eq(tests.id, testId));

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

    let whereClause = sql`1=1`;
    
    if (status && status !== 'all') {
      whereClause = and(whereClause, sql`status = ${status}`);
    }
    
    if (testId) {
      whereClause = and(whereClause, sql`test_id = ${parseInt(testId as string)}`);
    }

    const results = await db
      .select({
        id: testResults.id,
        userId: testResults.userId,
        testId: testResults.testId,
        score: testResults.score,
        maxScore: testResults.maxScore,
        percentage: testResults.percentage,
        passed: testResults.passed,
        timeSpent: testResults.timeSpent,
        focusLostCount: testResults.focusLostCount,
        warningsCount: testResults.warningsCount,
        createdAt: testResults.createdAt,
        status: testResults.status,
        username: users.username,
        testTitle: tests.title
      })
      .from(testResults)
      .leftJoin(users, eq(testResults.userId, users.id))
      .leftJoin(tests, eq(testResults.testId, tests.id))
      .where(whereClause)
      .orderBy(desc(testResults.createdAt));

    res.json({ results });
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

    const result = await db.query.testResults.findFirst({
      where: eq(testResults.id, resultId)
    });

    if (!result) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    // Обновляем статус результата
    const updatedResult = await db.update(testResults)
      .set({ 
        status,
        // Добавляем комментарий в результаты если есть
        results: result.results ? {
          ...result.results,
          adminComment: comment
        } : { adminComment: comment }
      })
      .where(eq(testResults.id, resultId))
      .returning();

    // Если результат одобрен и связан с заявкой, обновляем статус заявки
    if (status === 'approved' && result.applicationId) {
      // Здесь можно добавить логику обновления статуса заявки
      // await updateApplicationStatus(result.applicationId, 'test_passed');
    }

    res.json({ result: updatedResult[0] });
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
    const totalTests = await db.select({ count: sql<number>`count(*)` }).from(tests);
    const totalAttempts = await db.select({ count: sql<number>`count(*)` }).from(testResults);
    const totalPassed = await db.select({ count: sql<number>`count(*)` }).from(testResults).where(eq(testResults.passed, true));

    // Статистика по тестам
    const testStats = await db
      .select({
        testId: tests.id,
        title: tests.title,
        category: sql<string>`related_to->>'category'`,
        difficulty: sql<string>`related_to->>'difficulty'`,
        totalAttempts: sql<number>`count(test_results.id)`,
        passedAttempts: sql<number>`count(test_results.id) filter (where test_results.passed = true)`,
        avgScore: sql<number>`avg(test_results.percentage)`,
        avgTime: sql<number>`avg(test_results.time_spent)`
      })
      .from(tests)
      .leftJoin(testResults, eq(tests.id, testResults.testId))
      .groupBy(tests.id, tests.title)
      .orderBy(desc(sql`count(test_results.id)`));

    // Статистика по времени
    const timeStats = await db
      .select({
        hour: sql<number>`extract(hour from created_at)`,
        attempts: sql<number>`count(*)`
      })
      .from(testResults)
      .groupBy(sql`extract(hour from created_at)`)
      .orderBy(asc(sql`extract(hour from created_at)`));

    const analytics = {
      overview: {
        totalTests: totalTests[0].count,
        totalAttempts: totalAttempts[0].count,
        totalPassed: totalPassed[0].count,
        passRate: totalAttempts[0].count > 0 
          ? Math.round((totalPassed[0].count / totalAttempts[0].count) * 100) 
          : 0
      },
      testStats: testStats.map(stat => ({
        ...stat,
        passRate: stat.totalAttempts > 0 
          ? Math.round((stat.passedAttempts / stat.totalAttempts) * 100) 
          : 0
      })),
      timeStats
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: 'Failed to fetch test analytics' });
  }
});

export default router; 