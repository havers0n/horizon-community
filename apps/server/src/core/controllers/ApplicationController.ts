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
      const characterId = (req.user as any).characterId as string | undefined;

      const applicationType = (req.body?.type as string) || '';

      // Требуем characterId только для заявок не типа 'entry'
      if (applicationType !== 'entry' && !characterId) {
        return next(new AppError('A character ID is required for this application type', 400));
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
        author_character_id: applicationType === 'entry' ? null : characterId,
      };

      const application = await this.applicationService.createApplication(applicationData as any);
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
      const { status, review_comment } = req.body as { status: string; review_comment?: string };
      // @ts-ignore
      const reviewerUserId: string = req.user?.id;

      if (!reviewerUserId) {
        throw new AppError('Unauthorized', 401);
      }

      const updatedApplication = await this.applicationService.updateApplicationStatus(id, status, reviewerUserId, review_comment);
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
      if (!application.data?.test_id) {
        throw new AppError('Для этой заявки не назначено тестирование', 400);
      }

      const testId = (application.data as any)?.test_id;
      const testSession = await this.testSessionService.startTestSession(userId, testId, applicationId);

      res.status(201).json(testSession);
    } catch (error) {
      next(error);
    }
  }
}
