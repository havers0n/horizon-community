import { Router } from 'express';
import { verifyJWT, requireAdminOrSupervisor } from '../../middleware/auth.middleware';
import { pool } from '../../db/index.js';

const router: import('express').Router = Router();

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
    const ticketResult = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [parseInt(ticketId)]);
    const ticket = ticketResult.rows[0];
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

    const messages = Array.isArray(ticket.messages)
      ? [...ticket.messages, message]
      : [...(typeof ticket.messages === 'string' ? JSON.parse(ticket.messages) : []), message];

    const updatedTicketResult = await pool.query(
      `UPDATE support_tickets SET status = $1, messages = $2 WHERE id = $3 RETURNING *`,
      [ticket.status === 'closed' ? 'open' : ticket.status, JSON.stringify(messages), parseInt(ticketId)]
    );

    res.status(200).json(updatedTicketResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
