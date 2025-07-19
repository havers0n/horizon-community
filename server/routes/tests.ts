import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware';
import { IStorage } from '../storage';
import { BusinessLogic } from '../businessLogic';
import { Test, Application } from '@shared/schema';

const router = Router();

// Схемы валидации
const createTestSchema = z.object({
  title: z.string().min(1),
  relatedTo: z.object({
    applicationId: z.number().optional(),
    departmentId: z.number().optional(),
    type: z.string()
  }),
  durationMinutes: z.number().min(1).max(180),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['single', 'multiple', 'text']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
    points: z.number().min(1)
  }))
});

const submitTestSchema = z.object({
  testId: z.number(),
  applicationId: z.number().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())])
  })),
  timeSpent: z.number(), // в секундах
  focusLostCount: z.number(),
  warningsCount: z.number()
});

const testSessionSchema = z.object({
  testId: z.number(),
  applicationId: z.number().optional(),
  startTime: z.string()
});

export function createTestRoutes(storage: IStorage, businessLogic: BusinessLogic) {
  
  /**
   * GET /api/tests - Получить список доступных тестов
   */
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const tests = await storage.getAllTests();
      res.json({ tests });
    } catch (error) {
      console.error('Error fetching tests:', error);
      res.status(500).json({ error: 'Failed to fetch tests' });
    }
  });

  /**
   * GET /api/tests/:id - Получить тест по ID
   */
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getTest(testId);
      
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Убираем правильные ответы из вопросов для безопасности
      const safeTest = {
        ...test,
        questions: test.questions.map(q => ({
          ...q,
          correctAnswer: undefined
        }))
      };

      res.json({ test: safeTest });
    } catch (error) {
      console.error('Error fetching test:', error);
      res.status(500).json({ error: 'Failed to fetch test' });
    }
  });

  /**
   * POST /api/tests - Создать новый тест (только для админов)
   */
  router.post('/', authenticateToken, async (req, res) => {
    try {
      // Проверяем права администратора
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const validatedData = createTestSchema.parse(req.body);
      
      const test = await storage.createTest({
        title: validatedData.title,
        relatedTo: validatedData.relatedTo,
        durationMinutes: validatedData.durationMinutes,
        questions: validatedData.questions
      });

      res.status(201).json({ test });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error creating test:', error);
      res.status(500).json({ error: 'Failed to create test' });
    }
  });

  /**
   * POST /api/tests/:id/start - Начать тест
   */
  router.post('/:id/start', authenticateToken, async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const { applicationId } = testSessionSchema.parse(req.body);
      
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Проверяем, не проходил ли пользователь этот тест недавно
      const recentAttempts = await storage.getTestAttempts(req.user!.id, testId);
      const lastAttempt = recentAttempts[0];
      
      if (lastAttempt && lastAttempt.createdAt) {
        const lastAttemptDate = new Date(lastAttempt.createdAt);
        const now = new Date();
        const hoursSinceLastAttempt = (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastAttempt < 24) {
          return res.status(429).json({ 
            error: 'Test can only be taken once per 24 hours',
            nextAttemptTime: new Date(lastAttemptDate.getTime() + 24 * 60 * 60 * 1000)
          });
        }
      }

      // Создаем сессию теста
      const session = await storage.createTestSession({
        userId: req.user!.id,
        testId,
        applicationId,
        startTime: new Date(),
        status: 'in_progress'
      });

      res.json({ 
        session,
        test: {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            correctAnswer: undefined
          }))
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error starting test:', error);
      res.status(500).json({ error: 'Failed to start test' });
    }
  });

  /**
   * POST /api/tests/:id/submit - Отправить ответы на тест
   */
  router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const validatedData = submitTestSchema.parse(req.body);
      
      const test = await storage.getTest(testId);
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      // Проверяем активную сессию
      const activeSession = await storage.getActiveTestSession(req.user!.id, testId);
      if (!activeSession) {
        return res.status(400).json({ error: 'No active test session found' });
      }

      // Проверяем время выполнения
      const startTime = new Date(activeSession.startTime);
      const endTime = new Date();
      const timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      const maxTime = test.durationMinutes * 60;

      if (timeSpent > maxTime) {
        return res.status(400).json({ 
          error: 'Test time exceeded',
          timeSpent,
          maxTime
        });
      }

      // Проверяем ответы и подсчитываем баллы
      let totalScore = 0;
      let maxScore = 0;
      const results = [];

      for (const question of test.questions) {
        maxScore += question.points;
        const userAnswer = validatedData.answers.find(a => a.questionId === question.id);
        
        if (userAnswer) {
          let isCorrect = false;
          
          if (question.type === 'single') {
            isCorrect = userAnswer.answer === question.correctAnswer;
          } else if (question.type === 'multiple') {
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
            const userAnswers = Array.isArray(userAnswer.answer) ? userAnswer.answer : [];
            isCorrect = correctAnswers.length === userAnswers.length && 
                       correctAnswers.every(ans => userAnswers.includes(ans));
          } else if (question.type === 'text') {
            // Для текстовых вопросов нужна ручная проверка
            isCorrect = false; // По умолчанию неправильно
          }

          if (isCorrect) {
            totalScore += question.points;
          }

          results.push({
            questionId: question.id,
            userAnswer: userAnswer.answer,
            correct: isCorrect,
            points: isCorrect ? question.points : 0
          });
        }
      }

      const percentage = (totalScore / maxScore) * 100;
      const passed = percentage >= 70; // Минимум 70% для прохождения

      // Сохраняем результат
      const testResult = await storage.createTestResult({
        userId: req.user!.id,
        testId,
        applicationId: validatedData.applicationId,
        sessionId: activeSession.id,
        score: totalScore,
        maxScore,
        percentage,
        passed,
        timeSpent: validatedData.timeSpent,
        focusLostCount: validatedData.focusLostCount,
        warningsCount: validatedData.warningsCount,
        answers: validatedData.answers,
        results
      });

      // Закрываем сессию
      await storage.updateTestSession(activeSession.id, {
        status: 'completed',
        endTime: new Date()
      });

      // Если тест связан с заявкой, обновляем её статус
      if (validatedData.applicationId) {
        const application = await storage.getApplication(validatedData.applicationId);
        if (application) {
          const newStatus = passed ? 'test_completed' : 'test_failed';
          await businessLogic.advanceApplicationStatus(
            validatedData.applicationId,
            newStatus,
            0, // system user
            passed ? 
              `Тест пройден успешно (${percentage.toFixed(1)}%)` : 
              `Тест не пройден (${percentage.toFixed(1)}%). Минимум 70%`
          );
        }
      }

      res.json({ 
        result: testResult,
        passed,
        percentage: percentage.toFixed(1),
        totalScore,
        maxScore
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Error submitting test:', error);
      res.status(500).json({ error: 'Failed to submit test' });
    }
  });

  /**
   * GET /api/tests/:id/results - Получить результаты теста пользователя
   */
  router.get('/:id/results', authenticateToken, async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const results = await storage.getTestResults(req.user!.id, testId);
      
      res.json({ results });
    } catch (error) {
      console.error('Error fetching test results:', error);
      res.status(500).json({ error: 'Failed to fetch test results' });
    }
  });

  /**
   * GET /api/tests/application/:applicationId - Получить тест для конкретной заявки
   */
  router.get('/application/:applicationId', authenticateToken, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      
      // Проверяем, что заявка принадлежит пользователю или он админ
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.authorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Ищем тест, связанный с этой заявкой
      const tests = await storage.getAllTests();
      const relatedTest = tests.find(test => 
        test.relatedTo.applicationId === applicationId
      );

      if (!relatedTest) {
        return res.status(404).json({ error: 'No test found for this application' });
      }

      // Проверяем, не проходил ли уже тест
      const recentAttempts = await storage.getTestAttempts(req.user!.id, relatedTest.id);
      const lastAttempt = recentAttempts[0];

      res.json({ 
        test: {
          ...relatedTest,
          questions: relatedTest.questions.map(q => ({
            ...q,
            correctAnswer: undefined
          }))
        },
        lastAttempt: lastAttempt ? {
          id: lastAttempt.id,
          passed: lastAttempt.passed,
          percentage: lastAttempt.percentage,
          createdAt: lastAttempt.createdAt
        } : null
      });
    } catch (error) {
      console.error('Error fetching application test:', error);
      res.status(500).json({ error: 'Failed to fetch application test' });
    }
  });

  return router;
} 