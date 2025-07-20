import { Router } from 'express';
import { verifyJWT, requireAdminOrSupervisor } from '../../middleware/auth.middleware';
import { supportTickets } from '../../../shared/schema';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../db/index';
import { sql } from 'drizzle-orm';

const router = Router();

// Middleware: Проверка JWT и роли


// GET /api/admin/support/tickets
router.get('/tickets', verifyJWT, requireAdminOrSupervisor, async (req, res) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const status = req.query.status as string | undefined;
    const filter: any = {};
    if (status) filter.status = status;

    // Реальный запрос через Drizzle ORM
    const where = status ? eq(supportTickets.status, status) : undefined;
    const [tickets, totalResult] = await Promise.all([
      db.select().from(supportTickets)
        .where(where)
        .orderBy(desc(supportTickets.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.execute(sql`SELECT count(*)::int as count FROM support_tickets ${status ? sql`WHERE status = ${status}` : sql``}`)
    ]);
    const total = (totalResult as any)?.[0]?.count ?? 0;

    res.status(200).json({
      tickets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
