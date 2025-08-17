import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../middleware/auth.middleware';
import { TestAdminService } from '../../../core/services/TestAdminService';

const router: Router = Router();

// GET /api/v1/admin/tests
router.get('/', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const service = new TestAdminService(req.supabase!.system);
    const tests = await service.getAllTests();
    res.status(200).json(tests);
  } catch (error: any) {
    console.error('[AdminTestsRoutes] getAllTests error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/v1/admin/tests/:id
router.get('/:id', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const service = new TestAdminService(req.supabase!.system);
    const test = await service.getTestById(req.params.id);
    res.status(200).json(test);
  } catch (error: any) {
    console.error('[AdminTestsRoutes] getTestById error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/v1/admin/tests/:id/questions
router.get('/:id/questions', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const service = new TestAdminService(req.supabase!.system);
    const questions = await service.getQuestionsForTest(req.params.id);
    res.status(200).json(questions);
  } catch (error: any) {
    console.error('[AdminTestsRoutes] getQuestionsForTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/admin/tests
router.post('/', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const userId = req.user!.id;
    const service = new TestAdminService(req.supabase!.system);
    const test = await service.createTest(userId, req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] createTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PUT /api/v1/admin/tests/:id
router.put('/:id', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const testId = req.params.id;
    const service = new TestAdminService(req.supabase!.system);
    const test = await service.updateTest(testId, req.body);
    res.status(200).json({ success: true, data: test });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] updateTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// DELETE /api/v1/admin/tests/:id
router.delete('/:id', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const testId = req.params.id;
    const service = new TestAdminService(req.supabase!.system);
    await service.deleteTest(testId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[AdminTestsRoutes] deleteTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/admin/tests/:id/questions
router.post('/:id/questions', authenticateToken, requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const testId = req.params.id;
    const service = new TestAdminService(req.supabase!.system);
    const question = await service.addQuestionToTest(testId, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] addQuestionToTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;
