// apps/server/services/SupportTicketService.ts

import { SupabaseClient } from '@supabase/supabase-js';
// Импортируем только Database и создаем локальные типы-алиасы
import type { Database } from '@roleplay-identity/db-types';
import { systemSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// Создаем локальные типы-алиасы из глобального типа Database
// Таблица support_tickets отсутствует в актуальной схеме — временно отключаем типы
type SupportTickets = never;
type SupportTicketsInsert = never;
type SupportTicketsUpdate = never;

// Локальный тип для сообщений, т.к. он относится к бизнес-логике, а не к схеме БД
export interface TicketMessage {
  senderId: string;
  content: string;
  senderRole: string;
  timestamp: string; // ISO String
}

export class SupportTicketService {
  private readonly db: SupabaseClient<Database, 'system'>;

  constructor(systemDb?: SupabaseClient<Database, 'system'>) {
    this.db = (systemDb ?? (systemSupabase as unknown as SupabaseClient<Database, 'system'>));
  }

  public async getTicketById(_ticketId: string): Promise<SupportTickets | null> {
    return null as unknown as SupportTickets | null;
  }

  public async getUserTickets(_userId: string): Promise<SupportTickets[]> {
    return [] as unknown as SupportTickets[];
  }

  public async getAllTickets(): Promise<SupportTickets[]> {
    return [] as unknown as SupportTickets[];
  }

  public async createTicket(_userId: string, _title: string): Promise<SupportTickets> {
    throw new AppError('Support tickets временно недоступны: таблица отсутствует в схеме', 501);
  }

  public async replyToTicket(
    _ticketId: string,
    _senderId: string,
    _content: string,
    _senderRole: string
  ): Promise<SupportTickets> {
    throw new AppError('Support tickets временно недоступны: таблица отсутствует в схеме', 501);
  }

  public async updateTicketStatus(_ticketId: string, _status: "open" | "closed" | "in_progress"): Promise<SupportTickets> {
    throw new AppError('Support tickets временно недоступны: таблица отсутствует в схеме', 501);
  }
}