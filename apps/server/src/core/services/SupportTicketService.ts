// apps/server/services/SupportTicketService.ts

import { SupabaseClient } from '@supabase/supabase-js';
// ПРАВИЛО 3: Импортируем ВСЕ типы напрямую из db-types
import {
  Database,
  SupportTickets,
  SupportTicketsInsert,
  SupportTicketsUpdate
} from 'db-types';
import { createSupabaseClient } from '../lib/supabase';
import { AppError } from '../utils/AppError';

// Локальный тип для сообщений, т.к. он относится к бизнес-логике, а не к схеме БД
export interface TicketMessage {
  senderId: string;
  content: string;
  senderRole: string;
  timestamp: string; // ISO String
}

class SupportTicketService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    // ПРАВИЛО 2: Создаем независимый экземпляр клиента
    this.supabase = createSupabaseClient();
  }

  public async getTicketById(ticketId: string): Promise<SupportTickets | null> {
    const { data: ticket, error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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

    const { data: ticket, error } = await this.supabase
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
    
    // Безопасно добавляем новое сообщение
    const currentMessages = Array.isArray(currentTicket.messages) ? currentTicket.messages : [];
    const updatedMessages = [...currentMessages, newMessage as any]; // Приводим к any для обхода строгой типизации Supabase для JSONB

    const { data: updatedTicket, error } = await this.supabase
      .from('support_tickets')
      .update({
        messages: updatedMessages,
        status: 'open', // При ответе тикет всегда становится открытым
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !updatedTicket) {
      console.error(`[SupportTicketService] Error replying to ticket ${ticketId}:`, error);
      throw new AppError('Не удалось ответить на тикет.', 500);
    }
    return updatedTicket;
  }

  public async updateTicketStatus(ticketId: string, status: string): Promise<SupportTickets> {
    const { data: updatedTicket, error } = await this.supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (error || !updatedTicket) {
      console.error(`[SupportTicketService] Error updating status for ticket ${ticketId}:`, error);
      throw new AppError('Не удалось обновить статус тикета.', 500);
    }
    return updatedTicket;
  }
}

// Правильно инстанцируем и экспортируем сервис
const supportTicketService = new SupportTicketService();
export default supportTicketService;