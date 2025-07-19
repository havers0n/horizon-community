import { Router } from 'express';
import { verifyJWT, requireAdminOrSupervisor } from '../../middleware/auth.middleware';
import { SupportTicket } from '../../db/schema/supportTickets';

const router = Router();

// Middleware: Проверка JWT и роли


// POST /api/admin/support/tickets/:ticketId/reply
router.post('/tickets/:ticketId/reply', verifyJWT, requireAdminOrSupervisor, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Поле content обязательно' });
    }

    // Найти тикет
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Тикет не найден' });
    }

    // Добавить сообщение
    const message = {
      senderId: userId,
      content: content.trim(),
      timestamp: new Date(),
      senderRole: 'admin'
    };
    ticket.messages.push(message);

    // Открыть тикет, если был закрыт
    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }

    await ticket.save();

    // (Опционально) Создать уведомление для автора тикета
    // await Notification.create({
    //   userId: ticket.authorId,
    //   text: `Вам ответили в тикете поддержки №${ticket._id}`
    // });

    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
