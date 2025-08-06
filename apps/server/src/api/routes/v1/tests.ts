import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../../utils/validation';
import { 
  startTestSchema, 
  submitTestSchema, 
  reportViolationSchema, 
  getTestResultSchema,
  createTestSchema,
  updateTestSchema
} from '../../../core/schemas/test.schemas';
import { TestController } from '../../../core/controllers/TestController';

/**
 * Фабричная функция для создания маршрутов тестирования
 */
export function createTestRoutes(services: ServicesContainer): Router {
  const router: Router = Router();
  const { testService } = services;

  // Создаем экземпляр контроллера
  const testController = new TestController(testService);

  // ===== ПУБЛИЧНЫЕ МАРШРУТЫ (требуют только аутентификации) =====

  /**
   * GET /api/v1/tests
   * Получить доступные тесты для пользователя
   */
  router.get(
    '/',
    authenticateToken,
    testController.getAvailableTests.bind(testController)
  );

  /**
   * GET /api/v1/tests/:id/results
   * Получить результат теста
   */
  router.get(
    '/:id/results',
    authenticateToken,
    validateRequest({ params: getTestResultSchema.shape.params }),
    testController.getTestResult.bind(testController)
  );

  /**
   * POST /api/v1/tests/:id/start
   * Начать сессию тестирования
   */
  router.post(
    '/:id/start',
    authenticateToken,
    validateRequest({ params: startTestSchema.shape.params }),
    testController.startTestSession.bind(testController)
  );

  /**
   * POST /api/v1/tests/:id/submit
   * Отправить ответы на тест
   */
  router.post(
    '/:id/submit',
    authenticateToken,
    validateRequest({ 
      params: submitTestSchema.shape.params,
      body: submitTestSchema.shape.body 
    }),
    testController.submitTestAnswers.bind(testController)
  );

  /**
   * POST /api/v1/tests/sessions/:sessionId/violation
   * Сообщить о нарушении во время тестирования
   */
  router.post(
    '/sessions/:sessionId/violation',
    authenticateToken,
    validateRequest({ 
      params: reportViolationSchema.shape.params,
      body: reportViolationSchema.shape.body 
    }),
    testController.reportViolation.bind(testController)
  );

  // ===== АДМИНИСТРАТИВНЫЕ МАРШРУТЫ (требуют роль админа) =====

  /**
   * GET /api/v1/tests/admin/all
   * Получить все тесты с статистикой (админ)
   */
  router.get(
    '/admin/all',
    authenticateToken,
    requireRole('admin'),
    testController.getAllTestsWithStats.bind(testController)
  );

  /**
   * POST /api/v1/tests/admin/create
   * Создать новый тест (админ)
   */
  router.post(
    '/admin/create',
    authenticateToken,
    requireRole('admin'),
    validateRequest({ body: createTestSchema.shape.body }),
    testController.createTest.bind(testController)
  );

  /**
   * PUT /api/v1/tests/admin/:id
   * Обновить тест (админ)
   */
  router.put(
    '/admin/:id',
    authenticateToken,
    requireRole('admin'),
    validateRequest({ 
      params: updateTestSchema.shape.params,
      body: updateTestSchema.shape.body 
    }),
    testController.updateTest.bind(testController)
  );

  /**
   * DELETE /api/v1/tests/admin/:id
   * Удалить тест (админ)
   */
  router.delete(
    '/admin/:id',
    authenticateToken,
    requireRole('admin'),
    testController.deleteTest.bind(testController)
  );

  /**
   * GET /api/v1/tests/admin/results
   * Получить результаты тестов с фильтрами (админ)
   */
  router.get(
    '/admin/results',
    authenticateToken,
    requireRole('admin'),
    testController.getTestResults.bind(testController)
  );

  /**
   * GET /api/v1/tests/admin/analytics
   * Получить аналитику тестов (админ)
   */
  router.get(
    '/admin/analytics',
    authenticateToken,
    requireRole('admin'),
    testController.getTestAnalytics.bind(testController)
  );

  return router;
} 