import { SupabaseStorage } from './SupabaseStorage';
import { 
  SupportTicket, 
  InsertSupportTicket, 
  UpdateSupportTicket,
  User
} from '@roleplay-identity/shared-types';

export class SupportTicketService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    return this.storage.insert('support_tickets', data);
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    return this.storage.getById('support_tickets', id);
  }

  async getAllTickets(): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets');
  }

  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', { userId });
  }

  async getTicketsByStatus(status: SupportTicket['status']): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', { status });
  }

  async getTicketsByPriority(priority: SupportTicket['priority']): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', { priority });
  }

  async getOpenTickets(): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', { 
      status: { in: ['open', 'in_progress'] }
    });
  }

  async updateTicket(id: string, data: UpdateSupportTicket): Promise<SupportTicket> {
    return this.storage.update('support_tickets', id, data);
  }

  async deleteTicket(id: string): Promise<void> {
    await this.storage.delete('support_tickets', id);
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async submitTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    // Проверяем, что пользователь существует
    const user = await this.storage.getById('users', data.userId);
    if (!user || !user.isActive) {
      throw new Error('Пользователь не найден или неактивен');
    }

    // Проверяем, нет ли уже открытого тикета у пользователя с таким же заголовком
    const existingTickets = await this.storage.list('support_tickets', {
      userId: data.userId,
      title: data.title,
      status: { in: ['open', 'in_progress'] }
    });

    if (existingTickets.length > 0) {
      throw new Error('У вас уже есть открытый тикет с таким заголовком');
    }

    return this.createTicket(data);
  }

  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Тикет не найден');
    }

    // Проверяем, что назначенный пользователь существует и имеет права поддержки
    const assignedUser = await this.storage.getById('users', assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      throw new Error('Назначенный пользователь не найден или неактивен');
    }

    return this.updateTicket(ticketId, { 
      assignedTo,
      status: 'in_progress'
    });
  }

  async updateTicketStatus(
    ticketId: string, 
    status: SupportTicket['status'],
    resolvedBy?: string
  ): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Тикет не найден');
    }

    const updateData: UpdateSupportTicket = { status };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date().toISOString();
    }

    return this.updateTicket(ticketId, updateData);
  }

  async resolveTicket(ticketId: string, resolvedBy: string): Promise<SupportTicket> {
    return this.updateTicketStatus(ticketId, 'resolved', resolvedBy);
  }

  async closeTicket(ticketId: string): Promise<SupportTicket> {
    return this.updateTicketStatus(ticketId, 'closed');
  }

  async reopenTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Тикет не найден');
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new Error('Тикет не может быть повторно открыт');
    }

    return this.updateTicket(ticketId, { 
      status: 'open',
      resolvedAt: undefined
    });
  }

  async escalateTicket(ticketId: string, newPriority: SupportTicket['priority']): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Тикет не найден');
    }

    if (newPriority === ticket.priority) {
      throw new Error('Приоритет уже установлен на этот уровень');
    }

    return this.updateTicket(ticketId, { priority: newPriority });
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchTickets(query: string): Promise<SupportTicket[]> {
    return this.storage.search('support_tickets', query, ['title', 'description']);
  }

  async getTicketsByAssignee(assignedTo: string): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', { assignedTo });
  }

  async getTicketsByDateRange(startDate: string, endDate: string): Promise<SupportTicket[]> {
    return this.storage.list('support_tickets', {
      createdAt: { gte: startDate, lte: endDate }
    });
  }

  async getTicketsWithDetails(): Promise<(SupportTicket & {
    user: User;
    assignee?: User;
  })[]> {
    const tickets = await this.getAllTickets();
    
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const [user, assignee] = await Promise.all([
          this.storage.getById('users', ticket.userId),
          ticket.assignedTo ? this.storage.getById('users', ticket.assignedTo) : null
        ]);

        return {
          ...ticket,
          user: user!,
          assignee: assignee || undefined
        };
      })
    );

    return ticketsWithDetails;
  }

  async getTicketWithDetails(id: string): Promise<(SupportTicket & {
    user: User;
    assignee?: User;
  }) | null> {
    const ticket = await this.getTicketById(id);
    if (!ticket) return null;

    const [user, assignee] = await Promise.all([
      this.storage.getById('users', ticket.userId),
      ticket.assignedTo ? this.storage.getById('users', ticket.assignedTo) : null
    ]);

    return {
      ...ticket,
      user: user!,
      assignee: assignee || undefined
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: Record<SupportTicket['priority'], number>;
    byStatus: Record<SupportTicket['status'], number>;
  }> {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.storage.count('support_tickets'),
      this.storage.count('support_tickets', { status: 'open' }),
      this.storage.count('support_tickets', { status: 'in_progress' }),
      this.storage.count('support_tickets', { status: 'resolved' }),
      this.storage.count('support_tickets', { status: 'closed' })
    ]);

    const [low, medium, high, urgent] = await Promise.all([
      this.storage.count('support_tickets', { priority: 'low' }),
      this.storage.count('support_tickets', { priority: 'medium' }),
      this.storage.count('support_tickets', { priority: 'high' }),
      this.storage.count('support_tickets', { priority: 'urgent' })
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      byPriority: {
        low,
        medium,
        high,
        urgent
      },
      byStatus: {
        open,
        in_progress: inProgress,
        resolved,
        closed
      }
    };
  }

  async getUserTicketStats(userId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: Record<SupportTicket['priority'], number>;
  }> {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.storage.count('support_tickets', { userId }),
      this.storage.count('support_tickets', { userId, status: 'open' }),
      this.storage.count('support_tickets', { userId, status: 'in_progress' }),
      this.storage.count('support_tickets', { userId, status: 'resolved' }),
      this.storage.count('support_tickets', { userId, status: 'closed' })
    ]);

    const [low, medium, high, urgent] = await Promise.all([
      this.storage.count('support_tickets', { userId, priority: 'low' }),
      this.storage.count('support_tickets', { userId, priority: 'medium' }),
      this.storage.count('support_tickets', { userId, priority: 'high' }),
      this.storage.count('support_tickets', { userId, priority: 'urgent' })
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      byPriority: {
        low,
        medium,
        high,
        urgent
      }
    };
  }

  async getAssigneeTicketStats(assignedTo: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    averageResolutionTime: number;
  }> {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.storage.count('support_tickets', { assignedTo }),
      this.storage.count('support_tickets', { assignedTo, status: 'open' }),
      this.storage.count('support_tickets', { assignedTo, status: 'in_progress' }),
      this.storage.count('support_tickets', { assignedTo, status: 'resolved' }),
      this.storage.count('support_tickets', { assignedTo, status: 'closed' })
    ]);

    // Расчет среднего времени решения
    const resolvedTickets = await this.storage.list('support_tickets', {
      assignedTo,
      status: 'resolved'
    });

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    resolvedTickets.forEach(ticket => {
      if (ticket.resolvedAt) {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.resolvedAt);
        totalResolutionTime += resolved.getTime() - created.getTime();
        resolvedCount++;
      }
    });

    const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      averageResolutionTime
    };
  }

  async getTicketActivity(days: number = 30): Promise<{
    created: number;
    resolved: number;
    byPriority: Record<SupportTicket['priority'], number>;
    averageResolutionTime: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tickets = await this.getTicketsByDateRange(startDate.toISOString(), new Date().toISOString());

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    tickets.forEach(ticket => {
      byPriority[ticket.priority]++;

      if (ticket.status === 'resolved' && ticket.resolvedAt) {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.resolvedAt);
        totalResolutionTime += resolved.getTime() - created.getTime();
        resolvedCount++;
      }
    });

    const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    return {
      created: tickets.length,
      resolved: resolvedCount,
      byPriority,
      averageResolutionTime
    };
  }

  // ===========================================
  // АВТОМАТИЗАЦИЯ
  // ===========================================

  async autoAssignTickets(): Promise<void> {
    const unassignedTickets = await this.storage.list('support_tickets', {
      assignedTo: null,
      status: { in: ['open', 'in_progress'] }
    });

    // Получаем всех пользователей с правами поддержки
    const supportUsers = await this.storage.list('users', {
      role: { in: ['Admin', 'Dispatch'] },
      isActive: true
    });

    if (supportUsers.length === 0) {
      return; // Нет доступных пользователей поддержки
    }

    // Простое распределение по кругу
    for (let i = 0; i < unassignedTickets.length; i++) {
      const assignee = supportUsers[i % supportUsers.length];
      await this.assignTicket(unassignedTickets[i].id, assignee.id);
    }
  }

  async escalateOverdueTickets(hours: number = 24): Promise<void> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const overdueTickets = await this.storage.list('support_tickets', {
      status: { in: ['open', 'in_progress'] },
      createdAt: { lt: cutoffTime.toISOString() }
    });

    for (const ticket of overdueTickets) {
      if (ticket.priority !== 'urgent') {
        const newPriority = ticket.priority === 'low' ? 'medium' : 
                          ticket.priority === 'medium' ? 'high' : 'urgent';
        await this.escalateTicket(ticket.id, newPriority);
      }
    }
  }

  // ===========================================
  // УВЕДОМЛЕНИЯ
  // ===========================================

  async notifyTicketUpdate(ticketId: string, action: string): Promise<void> {
    const ticket = await this.getTicketWithDetails(ticketId);
    if (!ticket) return;

    // Здесь можно добавить логику отправки уведомлений
    // Например, через NotificationService
    console.log(`Уведомление: Тикет ${ticket.id} - ${action}`);
  }

  // ===========================================
  // ЭКСПОРТ И АНАЛИТИКА
  // ===========================================

  async exportTicketData(filters?: {
    status?: SupportTicket['status'];
    priority?: SupportTicket['priority'];
    userId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SupportTicket[]> {
    let query: any = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.gte = filters.startDate;
      if (filters.endDate) query.createdAt.lte = filters.endDate;
    }

    return this.storage.list('support_tickets', query);
  }

  async getTicketTrends(days: number = 30): Promise<{
    dailyCreated: Record<string, number>;
    dailyResolved: Record<string, number>;
    averageDailyCreated: number;
    averageDailyResolved: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tickets = await this.getTicketsByDateRange(startDate.toISOString(), new Date().toISOString());

    const dailyCreated: Record<string, number> = {};
    const dailyResolved: Record<string, number> = {};

    tickets.forEach(ticket => {
      const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
      dailyCreated[createdDate] = (dailyCreated[createdDate] || 0) + 1;

      if (ticket.status === 'resolved' && ticket.resolvedAt) {
        const resolvedDate = new Date(ticket.resolvedAt).toISOString().split('T')[0];
        dailyResolved[resolvedDate] = (dailyResolved[resolvedDate] || 0) + 1;
      }
    });

    const totalCreated = Object.values(dailyCreated).reduce((sum, count) => sum + count, 0);
    const totalResolved = Object.values(dailyResolved).reduce((sum, count) => sum + count, 0);

    return {
      dailyCreated,
      dailyResolved,
      averageDailyCreated: totalCreated / days,
      averageDailyResolved: totalResolved / days
    };
  }
}

// Экспортируем единственный экземпляр
export const supportTicketService = new SupportTicketService(new SupabaseStorage()); 