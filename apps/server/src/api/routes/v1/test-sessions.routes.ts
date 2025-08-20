import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { TestSessionService } from '../../../core/services/TestSessionService';

const router: Router = Router();

// POST /api/v1/test-sessions
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const { testId, applicationId } = req.body;
    const service = new TestSessionService(req.supabase!.system);
    const result = await service.startTestSession(userId, testId, applicationId, req.supabase);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] startTestSession error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/v1/test-sessions/:id — получить полную информацию о сессии с вложенными тестом, вопросами и опциями
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const sessionId: string = req.params.id;
    const service = new TestSessionService(req.supabase!.system);
    const data = await service.getTestSessionById(sessionId, userId, req.supabase);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] getTestSession error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// POST /api/v1/test-sessions/:id/focus-loss
router.post('/:id/focus-loss', authenticateToken, async (req: any, res) => {
  try {
    const userId: string = req.user.id;
    const sessionId: string = req.params.id;
    const service = new TestSessionService(req.supabase!.system);
    const result = await service.recordFocusLoss(sessionId, userId);
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
    const service = new TestSessionService(req.supabase!.system);
    const result = await service.submitTest(sessionId, userId, answers, req.supabase);

    // === КАДЕТСКИЙ ТРЕК: перевод стадии на cadet_training при успешной сдаче ===
    if (result?.passed === true) {
      try {
        const supa = req.supabase!;
        // Получаем application_id из сессии
        const { data: session, error: sErr } = await supa.system
          .from('test_sessions' as any)
          .select('application_id')
          .eq('id', sessionId)
          .maybeSingle();
        if (!sErr && session?.application_id) {
          // Резолвим статус cadet_training
          const { data: kind, error: kindErr } = await supa.common
            .from('status_kinds' as any)
            .select('id')
            .eq('code', 'cadet_track_stage')
            .maybeSingle();
          if (!kindErr && kind?.id) {
            const { data: status, error: stErr } = await supa.common
              .from('statuses' as any)
              .select('id')
              .eq('code', 'cadet_training')
              .eq('kind_id', kind.id)
              .maybeSingle();
            if (!stErr && status?.id) {
              const { error: updErr } = await supa.common
                .from('cadet_tracks' as any)
                .update({ current_stage_id: status.id })
                .eq('application_id', session.application_id);
              if (updErr) {
                console.warn('[TestSessionsRoutes] cadet_tracks update failed:', updErr);
              }
            }
          }
        }
      } catch (trackErr) {
        console.warn('[TestSessionsRoutes] cadet_tracks training stage pipeline error:', trackErr);
      }
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[TestSessionsRoutes] submitTest error:', error);
    res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;
