import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SupportTicketService } from '../../../core/services/SupportTicketService';
import { CabinetService } from '../../../core/services/CabinetService';
import { CabinetController } from '../../../core/controllers/CabinetController';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';
// Временное отключение типов support_tickets — таблица отсутствует в схеме
type SupportTickets = never;

const router: Router = Router();

// Create instances of services and controller for support ticket management
const createCabinetController = (req: AuthenticatedRequest) => {
  // Use the appropriate schema clients based on service requirements
  const applicationService = new ApplicationService(req.supabase!.public as any);
  const reportService = new ReportService(req.supabase!.public as any);
  const cabinetService = new CabinetService(req.supabase!.public, applicationService, reportService);
  return new CabinetController(cabinetService);
};

// GET /api/v1/admin/support/tickets - Get all support tickets
router.get('/tickets', authenticateToken, requirePermission('admin.support.manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const controller = createCabinetController(req);
    await controller.getAllSupportTickets(req, res, () => {});
  } catch (error) {
    console.error('[SupportRoutes] Error getting all tickets:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка получения списка тикетов' 
    });
  }
});

// GET /api/v1/admin/support/tickets/:id - Get support ticket details
router.get('/tickets/:id', authenticateToken, requirePermission('admin.support.manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const controller = createCabinetController(req);
    await controller.getSupportTicketDetails(req, res, () => {});
  } catch (error) {
    console.error('[SupportRoutes] Error getting ticket details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка получения деталей тикета' 
    });
  }
});

// POST /api/v1/admin/support/tickets/:id/messages - Add message to support ticket
router.post('/tickets/:id/messages', authenticateToken, requirePermission('admin.support.manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const controller = createCabinetController(req);
    await controller.addMessageToSupportTicket(req, res, () => {});
  } catch (error) {
    console.error('[SupportRoutes] Error adding message to ticket:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка добавления сообщения в тикет' 
    });
  }
});

// PATCH /api/v1/admin/support/tickets/:id/status - Change support ticket status
router.patch('/tickets/:id/status', authenticateToken, requirePermission('admin.support.manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const controller = createCabinetController(req);
    await controller.changeSupportTicketStatus(req, res, () => {});
  } catch (error) {
    console.error('[SupportRoutes] Error changing ticket status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка изменения статуса тикета' 
    });
  }
});

// Legacy endpoint - POST /api/admin/support/tickets/:ticketId/reply
router.post('/tickets/:ticketId/reply', authenticateToken, requirePermission('admin.support.manage'), async (req: AuthenticatedRequest, res) => {
  try {
    const ticketId: string = req.params.ticketId; // ✅ UUID правило: ID как string
    const { content } = req.body;
    const userId: string = req.user!.id; // ✅ Строгая типизация

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Поле content обязательно' 
      });
    }

    // ✅ Сервисный слой: вся бизнес-логика в сервисе
    const supportTicketService = new SupportTicketService(req.supabase!.system);
    const updatedTicket = await supportTicketService.replyToTicket(
      ticketId,
      userId,
      content.trim(),
      'admin'
    );

    if (!updatedTicket) {
      return res.status(404).json({ 
        success: false,
        error: 'Тикет не найден' 
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTicket
    });
  } catch (error) {
    console.error('[SupportRoutes] Error replying to ticket:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ошибка сервера' 
    });
  }
});

export default router;
