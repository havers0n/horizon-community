import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requirePermission } from '../../middleware/auth.middleware';
import { ApplicationService } from '../../../core/services/ApplicationService';

const router: Router = Router();

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  department: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid('ID должен быть в формате UUID'),
});

const updateStatusBodySchema = z.object({
  new_status_code: z.string().min(1),
  review_comment: z.string().optional(),
});

// GET /api/v1/admin/applications
router.get('/applications', authenticateToken, requirePermission('applications.manage'), async (req: any, res) => {
  try {
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Invalid query params' });
    }

    const { page, limit, status, department } = parse.data;
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10) || 20));

    const service = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
    const result = await service.getAllApplications({
      status,
      department,
      page: pageNum,
      limit: limitNum,
    });

    return res.status(200).json({ success: true, data: result.items, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (error: any) {
    console.error('[AdminApplicationsRoutes] list error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/v1/admin/applications/:id
router.get('/applications/:id', authenticateToken, requirePermission('applications.manage'), async (req: any, res) => {
  try {
    const params = paramsSchema.parse(req.params);
    const service = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
    const application = await service.getApplicationById(params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    return res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    console.error('[AdminApplicationsRoutes] get by id error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PUT /api/v1/admin/applications/:id/status
router.put('/applications/:id/status', authenticateToken, requirePermission('applications.manage'), async (req: any, res) => {
  try {
    const params = paramsSchema.parse(req.params);
    const body = updateStatusBodySchema.parse(req.body);

    const reviewerId: string = req.user!.id;
    const service = new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public });
    const updated = await service.updateApplicationStatus(params.id, body.new_status_code, reviewerId, body.review_comment);

    // Try to create a notification for application author via public client
    try {
      const publicDb = req.supabase!.public as any;
      if (publicDb && updated?.author_user_id) {
        await publicDb.from('notifications').insert({
          recipient_user_id: updated.author_user_id,
          title: 'Статус вашей заявки обновлён',
          content: `Новый статус: ${body.new_status_code}${body.review_comment ? `\nКомментарий: ${body.review_comment}` : ''}`,
          status: 'unread',
        });
      }
    } catch (notifyErr) {
      console.warn('[AdminApplicationsRoutes] Failed to create notification:', notifyErr);
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[AdminApplicationsRoutes] update status error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;
