import { Request, Response } from 'express';
import { TestService } from '../services/TestService';
import { AppError } from '../../utils/AppError';

export class TestController {
  constructor(private testService: TestService) {}

  /**
   * Получить доступные тесты для пользователя
   * GET /api/v1/tests
   */
  async getAvailableTests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Пользователь не авторизован', 401);
      }

      const tests = await this.testService.getAvailableTestsForUser(userId);
      
      res.status(200).json({
        success: true,
        data: tests
      });
    } catch (error) {
      console.error('[TestController] Error in getAvailableTests:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Внутренняя ошибка сервера'
        });
      }
    }
  }

  /**
   * Начать сессию тестирования
   * POST /api/v1/tests/:id/start
   */
  async startTestSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Пользователь не авторизован', 401);
      }

      const { id: testId } = req.params;
      const sessionData = await this.testService.startSession(userId, testId);
      
      res.status(200).json({
        success: true,
        data: sessionData
      });
    } catch (error) {
      console.error('[TestController] Error in startTestSession:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Внутренняя ошибка сервера'
        });
      }
    }
  }

  /**
   * Отправить ответы на тест
   * POST /api/v1/tests/:id/submit
   */
  async submitTestAnswers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Пользователь не авторизован', 401);
      }

      const { id: testId } = req.params;
      const { sessionId, answers } = req.body;

      const result = await this.testService.submitAnswers(userId, testId, sessionId, answers);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[TestController] Error in submitTestAnswers:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Внутренняя ошибка сервера'
        });
      }
    }
  }

  /**
   * Получить результат теста
   * GET /api/v1/tests/:id/results
   */
  async getTestResult(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Пользователь не авторизован', 401);
      }

      const { id: testId } = req.params;
      const result = await this.testService.getResult(userId, testId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[TestController] Error in getTestResult:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Внутренняя ошибка сервера'
        });
      }
    }
  }

  /**
   * Сообщить о нарушении во время тестирования
   * POST /api/v1/tests/sessions/:sessionId/violation
   */
  async reportViolation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Пользователь не авторизован', 401);
      }

      const { sessionId } = req.params;
      const { reason, details } = req.body;

      await this.testService.annulSession(sessionId, userId, reason);
      
      res.status(200).json({
        success: true,
        message: 'Нарушение зафиксировано и сессия аннулирована'
      });
    } catch (error) {
      console.error('[TestController] Error in reportViolation:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Внутренняя ошибка сервера'
        });
      }
    }
  }

  /**
   * Получить все тесты с статистикой (админ)
   * GET /api/v1/tests/admin/all
   */
  async getAllTestsWithStats(req: Request, res: Response): Promise<void> {
    try {
      const tests = await this.testService.getAllTestsWithStats();
      
      res.status(200).json({
        success: true,
        data: tests
      });
    } catch (error) {
      console.error('[TestController] Error in getAllTestsWithStats:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить тесты со статистикой'
      });
    }
  }

  /**
   * Создать новый тест (админ)
   * POST /api/v1/tests/admin/create
   */
  async createTest(req: Request, res: Response): Promise<void> {
    try {
      const testData = req.body;
      const newTest = await this.testService.createTest(testData);
      
      res.status(201).json({
        success: true,
        data: newTest
      });
    } catch (error) {
      console.error('[TestController] Error in createTest:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось создать тест'
      });
    }
  }

  /**
   * Обновить тест (админ)
   * PUT /api/v1/tests/admin/:id
   */
  async updateTest(req: Request, res: Response): Promise<void> {
    try {
      const { id: testId } = req.params;
      const updateData = req.body;
      const updatedTest = await this.testService.updateTest(testId, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedTest
      });
    } catch (error) {
      console.error('[TestController] Error in updateTest:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось обновить тест'
      });
    }
  }

  /**
   * Удалить тест (админ)
   * DELETE /api/v1/tests/admin/:id
   */
  async deleteTest(req: Request, res: Response): Promise<void> {
    try {
      const { id: testId } = req.params;
      await this.testService.deleteTest(testId);
      
      res.status(200).json({
        success: true,
        message: 'Тест успешно удален'
      });
    } catch (error) {
      console.error('[TestController] Error in deleteTest:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось удалить тест'
      });
    }
  }

  /**
   * Получить результаты тестов с фильтрами (админ)
   * GET /api/v1/tests/admin/results
   */
  async getTestResults(req: Request, res: Response): Promise<void> {
    try {
      const { status, testId } = req.query;
      const filters: { status?: string; testId?: string } = {};
      
      if (status) filters.status = status as string;
      if (testId) filters.testId = testId as string;

      const results = await this.testService.getTestResults(filters);
      
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('[TestController] Error in getTestResults:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить результаты тестов'
      });
    }
  }

  /**
   * Получить аналитику тестов (админ)
   * GET /api/v1/tests/admin/analytics
   */
  async getTestAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.testService.getTestAnalytics();
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('[TestController] Error in getTestAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось получить аналитику тестов'
      });
    }
  }
} 