// apps/server/src/core/controllers/CabinetController.ts

import { Request, Response, NextFunction } from 'express';
import type { CabinetService } from '../services/CabinetService';

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
} 