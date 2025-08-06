import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@roleplay-identity/db-types";
import { mdtSupabase } from "../lib/supabase";
import { AppError } from "../../utils/AppError";

// Создаем локальные типы-алиасы из глобального типа Database
type Tests = Database['mdt']['Tables']['tests']['Row'];
type TestsInsert = Database['mdt']['Tables']['tests']['Insert'];
type TestsUpdate = Database['mdt']['Tables']['tests']['Update'];
type TestResults = Database['mdt']['Tables']['test_results']['Row'];
type TestSessions = Database['mdt']['Tables']['test_sessions']['Row'];

// Интерфейсы для системы тестирования
interface Answer {
  questionId: string;
  answer: any;
}

interface TestSessionData {
  sessionId: string;
  questions: any[];
  startTime: string;
  timeLimit?: number;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: Answer[];
}

export class TestService {
  private db = mdtSupabase;

  /**
   * Получить все тесты с статистикой
   */
  async getAllTestsWithStats(): Promise<any[]> {
    try {
      // Получаем все тесты
      const { data: tests, error: testsError } = await this.db
        .from("tests")
        .select("*")
        .order("id", { ascending: false });

      if (testsError) {
        console.error("Error fetching tests:", testsError);
        throw new Error("Не удалось получить список тестов.");
      }

      if (!tests) return [];

      // Получаем статистику для каждого теста
      const testsWithStats = await Promise.all(
        tests.map(async (test: any) => {
          const { data: results, error: resultsError } = await this.db
            .from("test_results")
            .select("*")
            .eq("test_id", test.id);

          if (resultsError) {
            console.error(`Error fetching results for test ${test.id}:`, resultsError);
            return {
              ...test,
              totalAttempts: 0,
              passRate: 0,
              questionsCount: Array.isArray(test.questions) ? test.questions.length : 0
            };
          }

          const totalAttempts = results?.length || 0;
          const passedAttempts = results?.filter((r: any) => r.passed).length || 0;
          const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

          return {
            ...test,
            totalAttempts,
            passRate,
            questionsCount: Array.isArray(test.questions) ? test.questions.length : 0
          };
        })
      );

      return testsWithStats;
    } catch (error) {
      console.error("Error fetching tests with stats:", error);
      throw new Error("Не удалось получить тесты со статистикой.");
    }
  }

  /**
   * Получить доступные тесты для пользователя
   * Проверяет права доступа на основе одобренных заявок
   */
  async getAvailableTestsForUser(userId: string): Promise<any[]> {
    try {
      // Получаем одобренные заявки пользователя
      const { data: applications, error: appsError } = await this.db
        .from('applications')
        .select('type, status')
        .eq('author_user_id', userId)
        .eq('status', 'accepted' as any); // TODO: Fix enum value, 'approved' is not valid here

      if (appsError) {
        console.error('[TestService] Error fetching user applications:', appsError);
        throw new AppError('Не удалось получить данные о заявках пользователя', 500);
      }

      // Получаем все активные тесты
      const { data: tests, error: testsError } = await this.db
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (testsError) {
        console.error('[TestService] Error fetching tests:', testsError);
        throw new AppError('Не удалось получить список тестов', 500);
      }

      if (!tests) return [];

      // Фильтруем тесты, доступные пользователю на основе его заявок
      const availableTests = tests.filter((test: any) => {
        // Если у пользователя есть одобренная заявка на должность, связанную с тестом
        return applications?.some(app => 
          app.type === test.required_application_type || 
          !test.required_application_type // Если тест не требует специфической заявки
        );
      });

      return availableTests;
    } catch (error) {
      console.error('[TestService] Error in getAvailableTestsForUser:', error);
      throw error;
    }
  }

  /**
   * Начать сессию тестирования
   */
  async startSession(userId: string, testId: string): Promise<TestSessionData> {
    try {
      // 1. Проверить, существует ли тест
      const { data: test, error: testError } = await this.db
        .from('tests')
        .select('*')
        .eq('id', testId)
        .eq('is_active', true)
        .single();

      if (testError || !test) {
        throw new AppError('Тест не найден или неактивен', 404);
      }

      // 2. Проверить, имеет ли пользователь право на этот тест
      const availableTests = await this.getAvailableTestsForUser(userId);
      const hasAccess = availableTests.some(t => t.id === testId);
      
      if (!hasAccess) {
        throw new AppError('У вас нет доступа к этому тесту', 403);
      }

      // 3. Проверить, нет ли уже активной сессии
      const { data: existingSession } = await this.db
        .from('test_sessions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('test_id', testId)
        .in('status', ['in_progress', 'paused'])
        .single();

      if (existingSession) {
        throw new AppError('У вас уже есть активная сессия для этого теста', 409);
      }

      // 4. Создать новую сессию
      const sessionData = {
        user_id: userId,
        test_id: testId,
        status: 'in_progress',
        start_time: new Date().toISOString(),
        time_limit: test.time_limit || 1200 // 20 минут по умолчанию
      };

      const { data: newSession, error: sessionError } = await this.db
        .from('test_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError || !newSession) {
        console.error('[TestService] Error creating session:', sessionError);
        throw new AppError('Не удалось создать сессию тестирования', 500);
      }

      // 5. Подготовить вопросы для клиента (без правильных ответов)
      const questionsForClient = (test.questions as any[]).map((question: any) => {
        const { correct_answer, ...questionWithoutAnswer } = question;
        return questionWithoutAnswer;
      });

      return {
        sessionId: newSession.id,
        questions: questionsForClient,
        startTime: newSession.start_time,
        timeLimit: newSession.time_limit
      };
    } catch (error) {
      console.error('[TestService] Error in startSession:', error);
      throw error;
    }
  }

  /**
   * Отправить ответы на тест
   */
  async submitAnswers(userId: string, testId: string, sessionId: string, answers: Answer[]): Promise<TestResult> {
    try {
      // 1. Найти и проверить сессию
      const { data: session, error: sessionError } = await this.db
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .eq('test_id', testId)
        .single();

      if (sessionError || !session) {
        throw new AppError('Сессия тестирования не найдена', 404);
      }

      if (session.status !== 'in_progress') {
        throw new AppError(`Тест не может быть отправлен. Статус: ${session.status}`, 409);
      }

      // 2. Проверить время
      const startTime = new Date(session.start_time).getTime();
      const timeLimit = session.time_limit || 1200; // 20 минут по умолчанию
      const elapsedTime = (Date.now() - startTime) / 1000; // в секундах

      if (elapsedTime > timeLimit) {
        await this.markSessionAsExpired(sessionId);
        throw new AppError('Время тестирования истекло', 410);
      }

      // 3. Получить тест с правильными ответами
      const { data: test, error: testError } = await this.db
        .from('tests')
        .select('questions, title, passing_score')
        .eq('id', testId)
        .single();

      if (testError || !test) {
        throw new AppError('Данные теста не найдены', 404);
      }

      // 4. Подсчитать результат
      let score = 0;
      const totalQuestions = (test.questions as any[]).length;
      const correctAnswersMap = new Map((test.questions as any[]).map((q: any) => [q.id, q.correct_answer]));
      
      for (const userAnswer of answers) {
        const correctAnswer = correctAnswersMap.get(userAnswer.questionId);
        if (this.compareAnswers(userAnswer.answer, correctAnswer)) {
          score++;
        }
      }
      
      const percentage = Math.round((score / totalQuestions) * 100);
      const passingScore = test.passing_score || 85; // 85% по умолчанию
      const passed = percentage >= passingScore;

      // 5. Сохранить результат
      const resultData = {
        session_id: sessionId,
        user_id: userId,
        test_id: testId,
        score,
        max_score: totalQuestions,
        percentage,
        passed,
        answers: answers,
        time_taken: Math.round(elapsedTime)
      };

      const { error: resultError } = await this.db
        .from('test_results')
        .insert(resultData as any);

      if (resultError) {
        console.error('[TestService] Error saving result:', resultError);
        throw new AppError('Не удалось сохранить результат теста', 500);
      }

      // 6. Обновить статус сессии
      await this.db
        .from('test_sessions')
        .update({ 
          status: 'completed', 
          end_time: new Date().toISOString() 
        })
        .eq('id', sessionId);

      return {
        score,
        totalQuestions,
        percentage,
        passed,
        answers
      };
    } catch (error) {
      console.error('[TestService] Error in submitAnswers:', error);
      throw error;
    }
  }

  /**
   * Получить результат теста
   */
  async getResult(userId: string, testId: string): Promise<any> {
    try {
      const { data, error } = await this.db
        .from('test_results')
        .select(`
          *,
          test_sessions (
            start_time,
            end_time,
            time_limit
          ),
          tests (
            title,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('test_id', testId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        throw new AppError('Результат не найден', 404);
      }

      return data;
    } catch (error) {
      console.error('[TestService] Error in getResult:', error);
      throw error;
    }
  }

  /**
   * Аннулировать сессию (при нарушении)
   */
  async annulSession(sessionId: string, userId: string, reason?: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('test_sessions')
        .update({ 
          status: 'annulled',
          end_time: new Date().toISOString(),
          violation_reason: reason
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        console.error('[TestService] Error annulling session:', error);
        throw new AppError('Не удалось аннулировать сессию', 500);
      }
    } catch (error) {
      console.error('[TestService] Error in annulSession:', error);
      throw error;
    }
  }

  /**
   * Создать новый тест
   */
  async createTest(testData: TestsInsert): Promise<Tests> {
    try {
      const { data, error } = await this.db
        .from("tests")
        .insert(testData)
        .select()
        .single();

      if (error || !data) {
        console.error("Error creating test:", error);
        throw new Error("Не удалось создать тест.");
      }

      return data as Tests;
    } catch (error) {
      console.error("Error creating test:", error);
      throw new Error("Не удалось создать тест.");
    }
  }

  /**
   * Получить тест по ID
   */
  async getTestById(testId: string): Promise<Tests | null> {
    try {
      const { data, error } = await this.db
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error fetching test:", error);
        throw new Error("Не удалось получить тест.");
      }

      return data as Tests;
    } catch (error) {
      console.error("Error fetching test:", error);
      throw new Error("Не удалось получить тест.");
    }
  }

  /**
   * Обновить тест
   */
  async updateTest(testId: string, updateData: TestsUpdate): Promise<Tests> {
    try {
      const { data, error } = await this.db
        .from("tests")
        .update(updateData)
        .eq("id", testId)
        .select()
        .single();

      if (error || !data) {
        console.error("Error updating test:", error);
        throw new Error("Не удалось обновить тест.");
      }

      return data as Tests;
    } catch (error) {
      console.error("Error updating test:", error);
      throw new Error("Не удалось обновить тест.");
    }
  }

  /**
   * Удалить тест
   */
  async deleteTest(testId: string): Promise<void> {
    try {
      // Сначала удаляем связанные результаты
      const { error: resultsError } = await this.db
        .from("test_results")
        .delete()
        .eq("test_id", testId);

      if (resultsError) {
        console.error("Error deleting test results:", resultsError);
        throw new Error("Не удалось удалить результаты теста.");
      }

      // Затем удаляем сам тест
      const { error } = await this.db
        .from("tests")
        .delete()
        .eq("id", testId);

      if (error) {
        console.error("Error deleting test:", error);
        throw new Error("Не удалось удалить тест.");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      throw new Error("Не удалось удалить тест.");
    }
  }

  /**
   * Получить результаты тестов с фильтрами
   */
  async getTestResults(filters: { status?: string; testId?: string } = {}): Promise<any[]> {
    try {
      let query: any = this.db
        .from("test_results")
        .select(`
          *,
          tests (
            id,
            title,
            description
          ),
          profiles (
            id,
            username,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.testId) {
        query = query.eq("test_id", filters.testId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching test results:", error);
        throw new Error("Не удалось получить результаты тестов.");
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching test results:", error);
      throw new Error("Не удалось получить результаты тестов.");
    }
  }

  /**
   * Обновить статус результата теста
   */
  async updateTestResultStatus(resultId: string, status: string, comment?: string): Promise<any> {
    try {
      const updateData: any = { status };
      if (comment) {
        updateData.comment = comment;
      }

      const { data, error } = await this.db
        .from("test_results")
        .update(updateData)
        .eq("id", resultId)
        .select()
        .single();

      if (error || !data) {
        console.error("Error updating test result status:", error);
        throw new Error("Не удалось обновить статус результата теста.");
      }

      return data;
    } catch (error) {
      console.error("Error updating test result status:", error);
      throw new Error("Не удалось обновить статус результата теста.");
    }
  }

  /**
   * Получить аналитику тестов
   */
  async getTestAnalytics(): Promise<any> {
    try {
      // Получаем общую статистику
      const { data: results, error: resultsError } = await this.db
        .from("test_results")
        .select("*");

      if (resultsError) {
        console.error("Error fetching test results for analytics:", resultsError);
        throw new Error("Не удалось получить данные для аналитики.");
      }

      const totalAttempts = results?.length || 0;
      const passedAttempts = results?.filter((r: any) => r.passed).length || 0;
      const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

      // Получаем статистику по тестам
      const { data: tests, error: testsError } = await this.db
        .from("tests")
        .select("*");

      if (testsError) {
        console.error("Error fetching tests for analytics:", testsError);
        throw new Error("Не удалось получить данные тестов для аналитики.");
      }

      const testStats = tests?.map((test: any) => {
        const testResults = results?.filter((r: any) => r.test_id === test.id) || [];
        const testAttempts = testResults.length;
        const testPassed = testResults.filter((r: any) => r.passed).length;
        const testPassRate = testAttempts > 0 ? Math.round((testPassed / testAttempts) * 100) : 0;

        return {
          testId: test.id,
          testTitle: test.title,
          attempts: testAttempts,
          passed: testPassed,
          passRate: testPassRate
        };
      }) || [];

      return {
        totalAttempts,
        passedAttempts,
        overallPassRate,
        testStats
      };
    } catch (error) {
      console.error("Error getting test analytics:", error);
      throw new Error("Не удалось получить аналитику тестов.");
    }
  }

  /**
   * Вспомогательный метод для сравнения ответов
   */
  private compareAnswers(userAnswer: any, correctAnswer: any): boolean {
    if (Array.isArray(correctAnswer)) {
      // Для множественного выбора
      if (!Array.isArray(userAnswer)) return false;
      if (userAnswer.length !== correctAnswer.length) return false;
      return userAnswer.every((ans: any) => correctAnswer.includes(ans));
    } else {
      // Для одиночного выбора или текста
      return userAnswer === correctAnswer;
    }
  }

  /**
   * Вспомогательный метод для пометки сессии как истекшей
   */
  private async markSessionAsExpired(sessionId: string): Promise<void> {
    try {
      await this.db
        .from('test_sessions')
        .update({ 
          status: 'expired',
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('[TestService] Error marking session as expired:', error);
    }
  }
} 