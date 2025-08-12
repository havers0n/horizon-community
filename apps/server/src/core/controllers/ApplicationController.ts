import type { NextFunction, Request, Response } from 'express';
import type { ApplicationService } from '../services/ApplicationService';
import type { TestSessionService } from '../services/TestSessionService';
import { AppError } from '../../utils/AppError';

export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private testSessionService: TestSessionService
  ) {}

  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      // @ts-ignore
      const characterId = req.user.characterId;

      if (!characterId) {
        throw new AppError('Character ID не найден в токене', 400);
      }

      // --- Логика проверки лимитов ---
      const userApplications = await this.applicationService.getUserApplications(userId);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const applicationsThisMonth = userApplications.filter(app => {
        const createdAt = new Date(app.created_at);
        return createdAt >= startOfMonth;
      });

      if (applicationsThisMonth.length >= 3) {
        throw new AppError('Лимит заявок на этот месяц исчерпан (3 шт.)', 429); // 429 Too Many Requests
      }
      // --- Конец логики проверки лимитов ---

      const applicationData = {
        ...req.body,
        author_user_id: userId,
        author_character_id: characterId,
      };

      const application = await this.applicationService.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await this.applicationService.getApplicationById(id);
      if (!application) {
        throw new AppError('Заявка не найдена', 404);
      }
      res.status(200).json(application);
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Простое обновление статуса
      const updatedApplication = await this.applicationService.updateApplication(id, { status });
      res.status(200).json(updatedApplication);
    } catch (error) {
      next(error);
    }
  }

  async createTestSession(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const { id: applicationId } = req.params;

      const application = await this.applicationService.getApplicationById(applicationId);

      if (!application) {
        throw new AppError('Заявка не найдена', 404);
      }

      // @ts-ignore
      if (!application.test_id) {
        throw new AppError('Для этой заявки не назначено тестирование', 400);
      }

      const testSession = await this.testSessionService.startTestSession(userId, application.test_id, applicationId);

      res.status(201).json(testSession);
    } catch (error) {
      next(error);
    }
  }
}
