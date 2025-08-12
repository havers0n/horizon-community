import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { TestAdminService } from '../../../core/services/TestAdminService';

const router: Router = Router();
const testAdminService = new TestAdminService();

// POST /api/v1/admin/tests
router.post('/tests', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const test = await testAdminService.createTest(userId, req.body);
    res.status(201).json({ success: true, data: test });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] createTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PUT /api/v1/admin/tests/:id
router.put('/tests/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await testAdminService.updateTest(testId, req.body);
    res.status(200).json({ success: true, data: test });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] updateTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/admin/tests/:id/questions
router.post('/tests/:id/questions', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const testId = req.params.id;
    const question = await testAdminService.addQuestionToTest(testId, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error: any) {
    console.error('[AdminTestsRoutes] addQuestionToTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;
