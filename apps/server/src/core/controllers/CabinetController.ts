// apps/server/src/core/controllers/CabinetController.ts

import { Request, Response, NextFunction } from 'express';
import type { CabinetService } from '../services/CabinetService';
import type { 
  CreateLeaveRequestDto, 
  CreateJointPositionRequestDto,
  CreateTransferRequestDto,
  CreateComplaintDto
} from '../../types/services';

export class CabinetController {
  constructor(private cabinetService: CabinetService) {}

  /**
   * Получить данные дашборда пользователя
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const dashboardData = await this.cabinetService.getDashboardDataByUserId(userId);

      if (!dashboardData) {
        res.status(404).json({ success: false, error: 'Profile not found' });
        return;
      }

      res.status(200).json({ success: true, data: dashboardData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить профиль пользователя
   */
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const profile = await this.cabinetService.getUserProfile(userId);

      if (!profile) {
        res.status(404).json({ success: false, error: 'Profile not found' });
        return;
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновить профиль пользователя
   */
  async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await this.cabinetService.updateUserProfile(userId, updateData);

      res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить персонажа пользователя
   */
  async getUserCharacter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const character = await this.cabinetService.getUserCharacter(userId);

      res.status(200).json({ success: true, data: character });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить заявки пользователя
   */
  async getUserApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const applications = await this.cabinetService.getUserApplications(userId);

      res.status(200).json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить рапорты пользователя
   */
  async getUserReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const reports = await this.cabinetService.getUserReports(userId);

      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить департаменты пользователя
   */
  async getUserDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const departments = await this.cabinetService.getUserDepartments(userId);

      res.status(200).json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить настройки пользователя
   */
  async getUserSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const settings = await this.cabinetService.getUserSettings(userId);

      if (!settings) {
        res.status(404).json({ success: false, error: 'Settings not found' });
        return;
      }

      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновить настройки пользователя
   */
  async updateUserSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const settings = req.body;

      const updatedSettings = await this.cabinetService.updateUserSettings(userId, settings);

      res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить статистику пользователя
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.cabinetService.getUserStats(userId);

      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить жалобы пользователя
   */
  async getUserComplaints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const complaints = await this.cabinetService.getUserComplaints(userId);

      res.status(200).json({ success: true, data: complaints });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Создать новую заявку на отпуск
   * Правило №３: Контроллер остается "тонким" - только связующее звено
   */
  public createLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leaveData: CreateLeaveRequestDto = req.body;
      
      const newLeaveId = await this.cabinetService.createLeaveRequest(leaveData);
      
      res.status(201).json({
        success: true,
        data: { id: newLeaveId },
        message: 'Leave request created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить список заявок на отпуск пользователя
   * Правило №３: Контроллер остается "тонким" - только связующее звено
   */
  public getMyLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leaves = await this.cabinetService.getMyLeaves();
      
      res.status(200).json({
        success: true,
        data: leaves
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Административные методы для управления заявками на отпуск
   */

  /**
   * Получить все заявки на отпуск (для администраторов)
   */
  public getAllLeaveRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, department_id, page, limit } = req.query;
      
      const filters = {
        status: status as string,
        department_id: department_id as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.cabinetService.getAllLeaveRequests(filters);
      
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить конкретную заявку на отпуск по ID
   */
  public getLeaveRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const leaveRequest = await this.cabinetService.getLeaveRequestById(id);
      
      res.status(200).json({
        success: true,
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Одобрить заявку на отпуск
   */
  public approveLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const approverId = req.user.id;
      
      const result = await this.cabinetService.approveLeaveRequest(id, approverId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Leave request approved successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Отклонить заявку на отпуск
   */
  public rejectLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const approverId = req.user.id;
      
      const result = await this.cabinetService.rejectLeaveRequest(id, approverId, reason);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Leave request rejected successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить список департаментов, доступных для совмещения
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getAvailableJointDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const departments = await this.cabinetService.getAvailableJointDepartments(supabase);
      
      res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создать новую заявку на совмещение
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public createJointPositionRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const requestData: CreateJointPositionRequestDto = req.body;
      
      const newRequestId = await this.cabinetService.createJointPositionRequest(supabase, {
        p_secondary_department_id: requestData.p_secondary_department_id,
        p_reason: requestData.p_reason,
      });
      
      res.status(201).json({
        success: true,
        data: { id: newRequestId },
        message: 'Заявка на совмещение успешно создана'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить список заявок на совмещение пользователя
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getMyJointPositionRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const requests = await this.cabinetService.getMyJointPositionRequests(supabase);
      
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [ADMIN] Получить все заявки на совмещение для администрирования
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getAllJointPositionRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const requests = await this.cabinetService.getAllJointPositionRequests(supabase);
      
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [ADMIN] Одобрить заявку на совмещение
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public approveJointPositionRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const { id } = req.params;
      
      await this.cabinetService.approveJointPositionRequest(supabase, id);
      
      res.status(200).json({
        success: true,
        message: 'Заявка на совмещение успешно одобрена'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [ADMIN] Отклонить заявку на совмещение
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public rejectJointPositionRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      if (!reason || typeof reason !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Причина отклонения обязательна'
        });
        return;
      }
      
      await this.cabinetService.rejectJointPositionRequest(supabase, id, reason);
      
      res.status(200).json({
        success: true,
        message: 'Заявка на совмещение отклонена'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить список департаментов, доступных для перевода
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getAvailableTransferDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const departments = await this.cabinetService.getAvailableTransferDepartments(supabase);
      
      res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создать новую заявку на перевод
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public createTransferRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const requestData: CreateTransferRequestDto = req.body;
      
      const newRequestId = await this.cabinetService.createTransferRequest(supabase, {
        p_target_department_id: requestData.p_target_department_id,
        p_reason: requestData.p_reason,
      });
      
      res.status(201).json({
        success: true,
        data: { id: newRequestId },
        message: 'Заявка на перевод успешно создана'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создать новый тикет в службу поддержки
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public createSupportTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const { p_title, p_initial_message } = req.body;
      
      if (!p_title || !p_initial_message) {
        res.status(400).json({
          success: false,
          error: 'Заголовок и сообщение обязательны'
        });
        return;
      }
      
      const newTicketId = await this.cabinetService.createSupportTicket(supabase, {
        p_title,
        p_initial_message,
      });
      
      res.status(201).json({
        success: true,
        data: { id: newTicketId },
        message: 'Тикет в службу поддержки успешно создан'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Создать новую жалобу
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public createComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const { p_incident_date, p_title, p_type, p_participants, p_description, p_evidence } = req.body;
      
      if (!p_incident_date || !p_title || !p_type || !p_participants || !p_description) {
        res.status(400).json({
          success: false,
          error: 'Все обязательные поля должны быть заполнены'
        });
        return;
      }
      
      const newComplaintId = await this.cabinetService.createComplaint(supabase, {
        p_incident_date,
        p_title,
        p_type,
        p_participants,
        p_description,
        p_evidence: p_evidence || '',
      });
      
      res.status(201).json({
        success: true,
        data: { id: newComplaintId },
        message: 'Жалоба успешно зарегистрирована'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Получить список заявок на перевод пользователя
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getMyTransferRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.public;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase client' 
        });
        return;
      }

      const requests = await this.cabinetService.getMyTransferRequests(supabase);
      
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [ADMIN] Получить все тикеты поддержки
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getAllSupportTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.system;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase system client' 
        });
        return;
      }

      const tickets = await this.cabinetService.getAllSupportTickets(supabase);
      
      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * [ADMIN] Получить детали конкретного тикета поддержки
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public getSupportTicketDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[CabinetController] getSupportTicketDetails: Начинаем обработку запроса');
      
      const supabase = (req as any).supabase?.system;
      if (!supabase) {
        console.error('[CabinetController] getSupportTicketDetails: Отсутствует Supabase system client');
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase system client' 
        });
        return;
      }

      const { id } = req.params;
      console.log('[CabinetController] getSupportTicketDetails: ID тикета:', id);
      
      if (!id) {
        console.warn('[CabinetController] getSupportTicketDetails: ID тикета не предоставлен');
        res.status(400).json({
          success: false,
          error: 'ID тикета обязателен'
        });
        return;
      }

      console.log('[CabinetController] getSupportTicketDetails: Вызываем сервис');
      const ticketDetails = await this.cabinetService.getSupportTicketDetails(supabase, id);
      
      console.log('[CabinetController] getSupportTicketDetails: Результат сервиса:', {
        hasData: !!ticketDetails,
        hasTicket: !!ticketDetails?.ticket,
        hasMessages: !!ticketDetails?.messages,
        error: ticketDetails?.error
      });
      
      if (!ticketDetails) {
        console.warn('[CabinetController] getSupportTicketDetails: Сервис вернул null');
        res.status(404).json({
          success: false,
          error: 'Тикет не найден'
        });
        return;
      }

      // Проверяем наличие ошибки в данных
      if (ticketDetails.error) {
        console.warn('[CabinetController] getSupportTicketDetails: Ошибка в данных:', ticketDetails.error);
        res.status(404).json({
          success: false,
          error: ticketDetails.error
        });
        return;
      }

      // Проверяем, что тикет существует
      if (!ticketDetails.ticket) {
        console.warn('[CabinetController] getSupportTicketDetails: Тикет отсутствует в данных');
        res.status(404).json({
          success: false,
          error: 'Тикет не найден'
        });
        return;
      }
      
      console.log('[CabinetController] getSupportTicketDetails: Отправляем успешный ответ');
      res.status(200).json({
        success: true,
        data: ticketDetails
      });
    } catch (error) {
      console.error('[CabinetController] getSupportTicketDetails: Ошибка обработки:', error);
      next(error);
    }
  };

  /**
   * [ADMIN] Добавить ответ в тикет поддержки
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public addMessageToSupportTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[CabinetController] addMessageToSupportTicket: Начинаем обработку запроса');
      
      const supabase = (req as any).supabase?.system;
      if (!supabase) {
        console.error('[CabinetController] addMessageToSupportTicket: Отсутствует Supabase system client');
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase system client' 
        });
        return;
      }

      const { id } = req.params;
      const { content } = req.body;
      
      console.log('[CabinetController] addMessageToSupportTicket: Параметры запроса', {
        ticketId: id,
        contentLength: content?.length,
        contentPreview: content?.substring(0, 50) + '...'
      });
      
      if (!id || !content) {
        console.warn('[CabinetController] addMessageToSupportTicket: Отсутствуют обязательные параметры');
        res.status(400).json({
          success: false,
          error: 'ID тикета и содержимое сообщения обязательны'
        });
        return;
      }
      
      console.log('[CabinetController] addMessageToSupportTicket: Вызываем сервис');
      const result = await this.cabinetService.addMessageToSupportTicket(supabase, id, content);
      
      console.log('[CabinetController] addMessageToSupportTicket: Результат сервиса', {
        hasData: !!result,
        hasTicket: !!result?.ticket,
        hasMessages: !!result?.messages,
        messagesCount: result?.messages?.length || 0
      });
      
      if (!result) {
        console.warn('[CabinetController] addMessageToSupportTicket: Сервис вернул null');
        res.status(500).json({
          success: false,
          error: 'Ошибка добавления сообщения'
        });
        return;
      }
      
      console.log('[CabinetController] addMessageToSupportTicket: Отправляем успешный ответ');
      res.status(200).json({
        success: true,
        data: result,
        message: 'Ответ успешно добавлен'
      });
    } catch (error) {
      console.error('[CabinetController] addMessageToSupportTicket: Ошибка обработки:', error);
      next(error);
    }
  };

  /**
   * [ADMIN] Изменить статус тикета поддержки
   * Правило №3: Контроллер остается "тонким" - только связующее звено
   */
  public changeSupportTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supabase = (req as any).supabase?.system;
      if (!supabase) {
        res.status(500).json({ 
          success: false, 
          error: 'Server configuration error: missing Supabase system client' 
        });
        return;
      }

      const { id } = req.params;
      const { status_code } = req.body;
      
      if (!id || !status_code) {
        res.status(400).json({
          success: false,
          error: 'ID тикета и код статуса обязательны'
        });
        return;
      }
      
      const result = await this.cabinetService.changeSupportTicketStatus(supabase, id, status_code);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Статус тикета успешно изменен'
      });
    } catch (error) {
      next(error);
    }
  };
} 