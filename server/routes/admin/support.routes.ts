import { Router } from 'express';
import { verifyJWT, requireAdminOrSupervisor } from '../../middleware/auth.middleware';
import { supportTickets } from '../../db/schema/supportTickets';
import { db } from '../../db';
import { eq } from 'drizzle-orm';

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
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, parseInt(ticketId))
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Тикет не найден' });
    }

    // Обновить тикет с новым сообщением
    const message = {
      senderId: userId,
      content: content.trim(),
      timestamp: new Date(),
      senderRole: 'admin'
    };

    const updatedTicket = await db.update(supportTickets)
      .set({
        status: (ticket.status === 'closed' ? 'open' : ticket.status) as 'open' | 'closed',
        messages: JSON.stringify([...(JSON.parse(typeof ticket.messages === 'string' ? ticket.messages : '[]') as any[]), message] as any[])
      })
      .where(eq(supportTickets.id, parseInt(ticketId)))
      .returning();

    // (Опционально) Создать уведомление для автора тикета
    // await Notification.create({
    //   userId: ticket.authorId,
    //   text: `Вам ответили в тикете поддержки №${ticket._id}`
    // });

    res.status(200).json(updatedTicket[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
