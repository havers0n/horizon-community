import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requirePermission } from '../../middleware/auth.middleware';
import { CabinetService } from '../../../core/services/CabinetService';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';

const router: Router = Router();

const paramsSchema = z.object({
  id: z.string().uuid('ID должен быть в формате UUID'),
});

const rejectBodySchema = z.object({
  reason: z.string().min(1, 'Причина отклонения обязательна'),
});

// GET /api/v1/admin/transfers/requests
router.get('/transfers/requests', authenticateToken, requirePermission('admin.transfers.manage'), async (req: any, res) => {
  try {
    const cabinetService = new CabinetService(
      req.supabase!.public,
      new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
      new ReportService(req.supabase!.mdt)
    );

    const requests = await cabinetService.getAllTransferRequests(req.supabase!.public);

    return res.status(200).json({ 
      success: true, 
      data: requests
    });
  } catch (error: any) {
    console.error('[AdminTransfersRoutes] list error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PATCH /api/v1/admin/transfers/requests/:id/approve
router.patch('/transfers/requests/:id/approve', authenticateToken, requirePermission('admin.transfers.approve'), async (req: any, res) => {
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

    await cabinetService.approveTransferRequest(req.supabase!.public, params.id);

    // Try to create a notification for the request author via public client
    try {
      const publicDb = req.supabase!.public as any;
      if (publicDb) {
        // Get the request details to find the user_id
        const { data: requestData } = await publicDb.rpc('get_all_transfer_requests');
        const request = requestData?.find((r: any) => r.id === params.id);
        
        if (request) {
          await publicDb.from('notifications').insert({
            recipient_user_id: request.user_id,
            title: 'Ваша заявка на перевод одобрена',
            content: `Ваша заявка на перевод из департамента \"${request.source_department_name}\" в департамент \"${request.target_department_name}\" была одобрена администратором.`,
            status: 'unread',
          });
        }
      }
    } catch (notifyErr) {
      console.warn('[AdminTransfersRoutes] Failed to create notification:', notifyErr);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Заявка на перевод успешно одобрена'
    });
  } catch (error: any) {
    console.error('[AdminTransfersRoutes] approve error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// PATCH /api/v1/admin/transfers/requests/:id/reject
router.patch('/transfers/requests/:id/reject', authenticateToken, requirePermission('admin.transfers.approve'), async (req: any, res) => {
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

    await cabinetService.rejectTransferRequest(req.supabase!.public, params.id, body.reason);

    // Try to create a notification for the request author via public client
    try {
      const publicDb = req.supabase!.public as any;
      if (publicDb) {
        // Get the request details to find the user_id
        const { data: requestData } = await publicDb.rpc('get_all_transfer_requests');
        const request = requestData?.find((r: any) => r.id === params.id);
        
        if (request) {
          await publicDb.from('notifications').insert({
            recipient_user_id: request.user_id,
            title: 'Ваша заявка на перевод отклонена',
            content: `Ваша заявка на перевод из департамента \"${request.source_department_name}\" в департамент \"${request.target_department_name}\" была отклонена администратором.\nПричина: ${body.reason}`,
            status: 'unread',
          });
        }
      }
    } catch (notifyErr) {
      console.warn('[AdminTransfersRoutes] Failed to create notification:', notifyErr);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Заявка на перевод отклонена'
    });
  } catch (error: any) {
    console.error('[AdminTransfersRoutes] reject error:', error);
    return res.status(error?.statusCode || 500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;