import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { TestSessionService } from '../../../core/services/TestSessionService';

const router: Router = Router();
const testSessionService = new TestSessionService();

// POST /api/v1/test-sessions
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const { testId, applicationId } = req.body;
    const result = await testSessionService.startTestSession(userId, testId, applicationId);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] startTestSession error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/test-sessions/:id/focus-loss
router.post('/:id/focus-loss', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const sessionId: string = req.params.id;
    const result = await testSessionService.recordFocusLoss(sessionId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] recordFocusLoss error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/test-sessions/:id/submit
router.post('/:id/submit', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const sessionId: string = req.params.id;
    const { answers } = req.body;
    const result = await testSessionService.submitTest(sessionId, userId, answers);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] submitTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;
