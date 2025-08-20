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

      console.log('[ApplicationController] createTestSession: start', { applicationId, userId });
      // @ts-ignore
      const supa = (req as any).supabase;
      console.log('[ApplicationController] supabase clients', {
        hasSupabase: !!supa,
        hasSystem: !!(supa?.system),
        hasCommon: !!(supa?.common),
        hasPublic: !!(supa?.public),
      });

      let application: any = null;
      try {
        application = await this.applicationService.getApplicationById(applicationId);
      } catch (e: any) {
        console.error('[ApplicationController] getApplicationById failed', {
          applicationId,
          error: e?.message || String(e),
        });
        application = null; // не прерываемся — выполним фолбэк ниже
      }

      // Фолбэк: прямое чтение из system.applications с проверкой владельца
      if (!application) {
        try {
          console.log('[ApplicationController] fallback: direct read from system.applications', { applicationId });
          const { data: appRow, error: appErr } = await (supa?.system as any)
            .from('applications')
            .select('id, author_user_id, target_department_id, data')
            .eq('id', applicationId)
            .maybeSingle();

          if (appErr) {
            console.warn('[ApplicationController] fallback query error', {
              code: (appErr as any)?.code,
              message: (appErr as any)?.message,
            });
            throw new AppError('Ошибка при поиске заявки', 500);
          }

          if (!appRow) {
            console.warn('[ApplicationController] fallback: application not found or not accessible', { applicationId });
            throw new AppError('Заявка не найдена', 404);
          }

          if ((appRow as any).author_user_id !== userId) {
            console.warn('[ApplicationController] fallback: forbidden (owner mismatch)', {
              applicationId,
              owner: (appRow as any).author_user_id,
              userId,
            });
            throw new AppError('Forbidden', 403);
          }

          application = appRow;
          console.log('[ApplicationController] fallback: application loaded', {
            applicationId,
            departmentId: (application as any)?.target_department_id || null,
            hasPresetTestId: !!((application as any)?.data?.test_id),
          });
        } catch (fallbackErr) {
          return next(fallbackErr);
        }
      } else {
        const departmentId: string | null = (application as any)?.target_department_id || null;
        const presetTestId: string | null | undefined = (application as any)?.data?.test_id;
        console.log('[ApplicationController] application loaded', {
          applicationId,
          departmentId,
          hasPresetTestId: !!presetTestId,
        });
      }

      const departmentId: string | null = (application as any)?.target_department_id || null;
      const presetTestId: string | null | undefined = (application as any)?.data?.test_id;

      // Определяем testId: берём из заявки или подбираем по контексту (purpose='entry', target_department_id)
      let testId: string | null | undefined = presetTestId;
      if (!testId) {
        try {
          console.log('[ApplicationController] picking test by context', { purpose: 'entry', departmentId });
          let qb = (supa?.system as any)?.from('tests').select('id').eq('purpose', 'entry');
          if (departmentId) {
            qb = qb.eq('target_department_id', departmentId);
          }
          const { data, error } = await qb
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) {
            console.warn('[ApplicationController] tests query error', {
              code: (error as any)?.code,
              message: (error as any)?.message,
            });
          }
          if (data?.id) {
            testId = data.id as string;
            console.log('[ApplicationController] test picked', { testId });
          } else {
            console.warn('[ApplicationController] no test found for context', { purpose: 'entry', departmentId });
          }
        } catch (pickErr: any) {
          console.warn('[ApplicationController] contextual test pick failed', {
            message: pickErr?.message || String(pickErr),
          });
        }
      }

      if (!testId) {
        console.error('[ApplicationController] testId is not resolved', { applicationId, departmentId, purpose: 'entry' });
        throw new AppError('Для этой заявки не найден подходящий тест', 400);
      }

      const testSession = await this.testSessionService.startTestSession(userId, testId, applicationId, supa);
      console.log('[ApplicationController] test session created', {
        applicationId,
        testId,
        sessionId: (testSession as any)?.sessionId,
      });

      res.status(201).json(testSession);
    } catch (error) {
      console.error('[ApplicationController] createTestSession error', {
        message: (error as any)?.message || String(error),
      });
      next(error);
    }
  }
}
