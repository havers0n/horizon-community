import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';

const router: import('express').Router = Router();

// Middleware: Проверка JWT и роли

// GET /api/admin/support/tickets
router.get('/tickets', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Временная заглушка - функциональность поддержки не реализована в текущей схеме
    res.status(200).json({
      tickets: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      message: 'Support tickets functionality is not implemented in current schema'
    });
  } catch (err) {
    console.error('[SupportTicketsList] Unexpected error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
