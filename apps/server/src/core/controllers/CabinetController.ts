// apps/server/src/core/controllers/CabinetController.ts

import { Request, Response, NextFunction } from 'express';
import type { CabinetService } from '../services/CabinetService';
import type { CreateLeaveRequestDto } from '../../types/services';

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
} 