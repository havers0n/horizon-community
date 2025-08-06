import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SupportTicketService } from '../../../core/services/SupportTicketService';
import type { Database } from '@roleplay-identity/db-types';

// Создаем локальный тип-алиас из глобального типа Database
type SupportTickets = Database['mdt']['Tables']['support_tickets']['Row'];

const router: Router = Router();

// Инициализация сервиса
const supportTicketService = new SupportTicketService();

// POST /api/admin/support/tickets/:ticketId/reply
router.post('/tickets/:ticketId/reply', authenticateToken, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
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
