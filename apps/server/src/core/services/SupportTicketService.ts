// apps/server/services/SupportTicketService.ts

import { SupabaseClient } from '@supabase/supabase-js';
// Импортируем только Database и создаем локальные типы-алиасы
import type { Database } from '@roleplay-identity/db-types';
import { mdtSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// Создаем локальные типы-алиасы из глобального типа Database
type SupportTickets = Database['mdt']['Tables']['support_tickets']['Row'];
type SupportTicketsInsert = Database['mdt']['Tables']['support_tickets']['Insert'];
type SupportTicketsUpdate = Database['mdt']['Tables']['support_tickets']['Update'];

// Локальный тип для сообщений, т.к. он относится к бизнес-логике, а не к схеме БД
export interface TicketMessage {
  senderId: string;
  content: string;
  senderRole: string;
  timestamp: string; // ISO String
}

export class SupportTicketService {
  private db = mdtSupabase;

  public async getTicketById(ticketId: string): Promise<SupportTickets | null> {
    const { data: ticket, error } = await this.db
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`[SupportTicketService] Error getting ticket ${ticketId}:`, error);
      throw new AppError('Ошибка при получении тикета.', 500);
    }
    return ticket;
  }

  public async getUserTickets(userId: string): Promise<SupportTickets[]> {
    const { data, error } = await this.db
      .from('support_tickets')
      .select('*')
      .eq('author_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[SupportTicketService] Error getting user tickets for ${userId}:`, error);
      throw new AppError('Ошибка при получении тикетов пользователя.', 500);
    }
    return data || [];
  }

  public async getAllTickets(): Promise<SupportTickets[]> {
    const { data, error } = await this.db
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupportTicketService] Error getting all tickets:', error);
      throw new AppError('Ошибка при получении всех тикетов.', 500);
    }
    return data || [];
  }

  public async createTicket(userId: string, title: string): Promise<SupportTickets> {
    const ticketData: SupportTicketsInsert = {
      author_user_id: userId,
      title,
      status: 'open',
      messages: [] // Инициализируем пустым массивом
    };

    const { data: ticket, error } = await this.db
      .from('support_tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error || !ticket) {
      console.error('[SupportTicketService] Error creating ticket:', error);
      throw new AppError('Не удалось создать тикет.', 500);
    }
    return ticket;
  }

  public async replyToTicket(
    ticketId: string,
    senderId: string,
    content: string,
    senderRole: string
  ): Promise<SupportTickets> {
    const currentTicket = await this.getTicketById(ticketId);
    if (!currentTicket) {
      throw new AppError('Тикет не найден.', 404);
    }

    const newMessage: TicketMessage = {
      senderId,
      content,
      senderRole,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(currentTicket.messages || []), newMessage as any];

    const { data: ticket, error } = await this.db
      .from('support_tickets')
      .update({ messages: updatedMessages })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      console.error('[SupportTicketService] Error replying to ticket:', error);
      throw new AppError('Не удалось ответить на тикет.', 500);
    }
    return ticket;
  }

  public async updateTicketStatus(ticketId: string, status: "open" | "closed" | "in_progress"): Promise<SupportTickets> {
    const { data: ticket, error } = await this.db
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !ticket) {
      console.error('[SupportTicketService] Error updating ticket status:', error);
      throw new AppError('Не удалось обновить статус тикета.', 500);
    }
    return ticket;
  }
}