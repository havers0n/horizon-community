import { Router } from 'express';
import supportRoutes from './support.routes';
import userMetadataRoutes from './user-metadata';
import testsRoutes from './tests.routes';
import applicationsRoutes from './applications.routes';
import { requirePermission } from '../../middleware/auth.middleware';
import { TestAdminService } from '../../../core/services/TestAdminService';

const router: Router = Router();

// Регистрация всех admin маршрутов
router.use('/support', supportRoutes);
router.use('/user-metadata', userMetadataRoutes);
router.use('/tests', testsRoutes);
router.use('/', applicationsRoutes);

// POST /api/v1/admin/questions/:questionId/options
router.post('/questions/:questionId/options', requirePermission('tests.manage'), async (req: any, res) => {
  try {
    const questionId = req.params.questionId as string;
    const { option_text, is_correct } = req.body || {};
    const service = new TestAdminService(req.supabase!.system);
    const option = await service.addOptionToQuestion(questionId, { option_text, is_correct });
    res.status(201).json({ success: true, data: option });
  } catch (error: any) {
    console.error('[AdminQuestionsRoutes] addOption error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router; 