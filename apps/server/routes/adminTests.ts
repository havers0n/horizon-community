import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../middleware/auth.middleware';
import { testService } from '../services/TestService';
import { TestsInsert, TestsUpdate } from '../../../packages/db-types/src/index';

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

const paramIdSchema = z.object({
  id: z.string().uuid('Неверный формат ID')
});

/**
 * GET /api/admin/tests - Получить все тесты для админа
 */
router.get('/', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const testsWithStats = await testService.getAllTestsWithStats();
    res.json({ tests: testsWithStats });
  } catch (error: any) {
    console.error('Error fetching admin tests:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tests' });
  }
});

/**
 * POST /api/admin/tests - Создать новый тест
 */
router.post('/', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = createTestSchema.parse(req.body);

    const testData: TestsInsert = {
      title: validatedData.title,
      description: validatedData.description,
      duration_minutes: validatedData.durationMinutes,
      questions: validatedData.questions
    };

    const newTest = await testService.createTest(testData);
    res.status(201).json({ test: newTest });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating test:', error);
    res.status(500).json({ error: error.message || 'Failed to create test' });
  }
});

/**
 * PUT /api/admin/tests/:id - Обновить тест
 */
router.put('/:id', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const testId: string = paramIdSchema.parse(req.params).id;
    const validatedData = updateTestSchema.parse(req.body);

    const updateData: TestsUpdate = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.durationMinutes !== undefined) updateData.duration_minutes = validatedData.durationMinutes;
    if (validatedData.questions !== undefined) updateData.questions = validatedData.questions;

    const updatedTest = await testService.updateTest(testId, updateData);
    res.json({ test: updatedTest });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.message === 'Test not found') {
      return res.status(404).json({ error: 'Test not found' });
    }
    console.error('Error updating test:', error);
    res.status(500).json({ error: error.message || 'Failed to update test' });
  }
});

/**
 * DELETE /api/admin/tests/:id - Удалить тест
 */
router.delete('/:id', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const testId: string = paramIdSchema.parse(req.params).id;
    await testService.deleteTest(testId);
    res.json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.message === 'Cannot delete test with active sessions') {
      return res.status(400).json({ 
        error: 'Cannot delete test with active sessions' 
      });
    }
    console.error('Error deleting test:', error);
    res.status(500).json({ error: error.message || 'Failed to delete test' });
  }
});

/**
 * GET /api/admin/tests/results - Получить все результаты тестов
 */
router.get('/results', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { status, testId } = req.query;
    
    const filters: { status?: string; testId?: string } = {};
    if (status && typeof status === 'string') filters.status = status;
    if (testId && typeof testId === 'string') filters.testId = testId;

    const results = await testService.getTestResults(filters);
    res.json({ results });
  } catch (error: any) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch test results' });
  }
});

/**
 * PUT /api/admin/tests/results/:id/status - Обновить статус результата теста
 */
router.put('/results/:id/status', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const resultId: string = paramIdSchema.parse(req.params).id;
    const { status, comment } = updateResultStatusSchema.parse(req.body);

    const result = await testService.updateTestResultStatus(resultId, status, comment);
    res.json({ result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if (error.message === 'Test result not found') {
      return res.status(404).json({ error: 'Test result not found' });
    }
    console.error('Error updating test result status:', error);
    res.status(500).json({ error: error.message || 'Failed to update test result status' });
  }
});

/**
 * GET /api/admin/tests/analytics - Получить аналитику тестов
 */
router.get('/analytics', requireRole('admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const analytics = await testService.getTestAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch test analytics' });
  }
});

export default router; 