import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requirePermission } from '../../middleware/auth.middleware';
import { CabinetService } from '../../../core/services/CabinetService';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';

const router: Router = Router();

const listQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  department_id: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid('ID должен быть в формате UUID'),
});

const rejectBodySchema = z.object({
  reason: z.string().optional(),
});

// GET /api/v1/admin/leave-requests
router.get('/leave-requests', authenticateToken, requirePermission('admin.leave.manage'), async (req: any, res) => {
  try {
    const parse = listQuerySchema.safeParse(req.query);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: 'Invalid query params' });
    }

    const { page, limit, status, department_id } = parse.data;
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10) || 20));

    const cabinetService = new CabinetService(
      req.supabase!.public,
      new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
      new ReportService(req.supabase!.mdt)
    );

    const result = await cabinetService.getAllLeaveRequests({
      status,
      department_id,
      page: pageNum,
      limit: limitNum,
    });

    return res.status(200).json({ 
      success: true, 
      data: result.items, 
      pagination: { 
        page: result.page, 
        limit: result.limit, 
        total: result.total, 
        totalPages: Math.ceil(result.total / result.limit) 
      } 
    });
  } catch (error: any) {
    console.error('[AdminLeaveRequestsRoutes] list error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// GET /api/v1/admin/leave-requests/:id
router.get('/leave-requests/:id', authenticateToken, requirePermission('admin.leave.manage'), async (req: any, res) => {
  try {
    const params = paramsSchema.parse(req.params);
    
    const cabinetService = new CabinetService(
      req.supabase!.public,
      new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
      new ReportService(req.supabase!.mdt)
    );

    const leaveRequest = await cabinetService.getLeaveRequestById(params.id);
    if (!leaveRequest) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    return res.status(200).json({ success: true, data: leaveRequest });
  } catch (error: any) {
    console.error('[AdminLeaveRequestsRoutes] get by id error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PATCH /api/v1/admin/leave-requests/:id/approve
router.patch('/leave-requests/:id/approve', authenticateToken, requirePermission('admin.leave.approve'), async (req: any, res) => {
  try {
    const params = paramsSchema.parse(req.params);
    const approverId = req.user?.id;

    if (!approverId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const cabinetService = new CabinetService(
      req.supabase!.public,
      new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
      new ReportService(req.supabase!.mdt)
    );

    const result = await cabinetService.approveLeaveRequest(params.id, approverId);

    // Try to create a notification for the leave request author via public client
    try {
      const publicDb = req.supabase!.public as any;
      if (publicDb && result?.user_id) {
        await publicDb.from('notifications').insert({
          recipient_user_id: result.user_id,
          title: 'Ваша заявка на отпуск одобрена',
          content: `Ваша заявка на отпуск была одобрена администратором.`,
          status: 'unread',
        });
      }
    } catch (notifyErr) {
      console.warn('[AdminLeaveRequestsRoutes] Failed to create notification:', notifyErr);
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[AdminLeaveRequestsRoutes] approve error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PATCH /api/v1/admin/leave-requests/:id/reject
router.patch('/leave-requests/:id/reject', authenticateToken, requirePermission('admin.leave.approve'), async (req: any, res) => {
  try {
    const params = paramsSchema.parse(req.params);
    const body = rejectBodySchema.parse(req.body);
    const approverId = req.user?.id;

    if (!approverId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const cabinetService = new CabinetService(
      req.supabase!.public,
      new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
      new ReportService(req.supabase!.mdt)
    );

    const result = await cabinetService.rejectLeaveRequest(params.id, approverId, body.reason);

    // Try to create a notification for the leave request author via public client
    try {
      const publicDb = req.supabase!.public as any;
      if (publicDb && result?.user_id) {
        await publicDb.from('notifications').insert({
          recipient_user_id: result.user_id,
          title: 'Ваша заявка на отпуск отклонена',
          content: `Ваша заявка на отпуск была отклонена администратором${body.reason ? `\nПричина: ${body.reason}` : ''}`,
          status: 'unread',
        });
      }
    } catch (notifyErr) {
      console.warn('[AdminLeaveRequestsRoutes] Failed to create notification:', notifyErr);
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[AdminLeaveRequestsRoutes] reject error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;