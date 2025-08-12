import type { Database } from "@roleplay-identity/db-types";
import { systemSupabase } from "../lib/supabase";
import { AppError } from "../../utils/AppError";

// НОВЫЕ строго-типизированные сервисы
import { TestSessionService } from "./TestSessionService";
import { TestAdminService } from "./TestAdminService";

// Типы для схемы system
type SystemTest = Database['system']['Tables']['tests']['Row'];
type SystemTestInsert = Database['system']['Tables']['tests']['Insert'];
type SystemTestUpdate = Database['system']['Tables']['tests']['Update'];

type SystemTestResult = Database['system']['Tables']['test_results']['Row'];
type SystemTestSession = Database['system']['Tables']['test_sessions']['Row'];

// Интерфейсы, используемые контроллерами
interface Answer {
  questionId: string;
  answer: any;
}

interface TestSessionData {
  sessionId: string;
  questions: any[];
  startTime: string;
  timeLimit?: number | null;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: Answer[];
}

// ВРЕМЕННЫЙ ФАСАД для сохранения обратной совместимости роутов/контроллеров.
// Вся логика перенесена на схему system и новые сервисы.
export class TestService {
  private db = systemSupabase;
  private sessionService = new TestSessionService();
  private adminService = new TestAdminService();

  // ====== ПУБЛИЧНАЯ ЧАСТЬ ======

  async getAllTestsWithStats(): Promise<any[]> {
    // Берем все тесты и агрегируем статистику по результатам
    const { data: tests, error: testsError } = await this.db
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });
    if (testsError) throw new AppError('Не удалось получить список тестов', 500);

    const { data: results, error: resultsError } = await this.db
      .from('test_results')
      .select('test_id, passed');
    if (resultsError) throw new AppError('Не удалось получить статистику тестов', 500);

    const byTest = new Map<string, { total: number; passed: number }>();
    for (const r of results || []) {
      const key = (r as SystemTestResult).test_id as string;
      const stat = byTest.get(key) || { total: 0, passed: 0 };
      stat.total += 1;
      stat.passed += (r as SystemTestResult).passed ? 1 : 0;
      byTest.set(key, stat);
    }

    return (tests || []).map(t => {
      const s = byTest.get((t as SystemTest).id) || { total: 0, passed: 0 };
      const passRate = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
      return { ...t, totalAttempts: s.total, passRate };
    });
  }

  async getAvailableTestsForUser(_userId: string): Promise<SystemTest[]> {
    // Доступные тесты = активные тесты системы
    const { data, error } = await this.db
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw new AppError('Не удалось получить список тестов', 500);
    return (data || []) as SystemTest[];
  }

  async startSession(userId: string, testId: string): Promise<TestSessionData> {
    const session = await this.sessionService.startTestSession(userId, testId);
    return {
      sessionId: session.sessionId,
      questions: session.questions,
      startTime: session.startTime,
      timeLimit: session.timeLimit ?? null,
    };
  }

  async submitAnswers(userId: string, _testId: string, sessionId: string, answers: Answer[]): Promise<TestResult> {
    const result = await this.sessionService.submitTest(sessionId, userId, answers as any);
    return {
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
      answers,
    };
  }

  async getResult(userId: string, testId: string): Promise<SystemTestResult> {
    const { data, error } = await this.db
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) throw new AppError('Результат не найден', 404);
    return data as SystemTestResult;
  }

  async annulSession(sessionId: string, userId: string, reason?: string): Promise<void> {
    const { error } = await this.db
      .from('test_sessions')
      .update({ status_id: 'annulled', end_time: new Date().toISOString(), violation_reason: reason ?? null } as any)
      .eq('id', sessionId)
      .eq('user_id', userId);
    if (error) throw new AppError('Не удалось аннулировать сессию', 500);
  }

  // ====== АДМИН ЧАСТЬ (совместимость роутов) ======

  async createTest(testData: SystemTestInsert): Promise<SystemTest> {
    // В новой архитектуре создание теста требует userId → используйте Admin API
    throw new AppError('Используйте /api/v1/admin/tests для создания тестов', 501);
  }

  async getTestById(testId: string): Promise<SystemTest | null> {
    const { data, error } = await this.db
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();
    if (error) return null;
    return data as SystemTest;
  }

  async updateTest(testId: string, updateData: SystemTestUpdate): Promise<SystemTest> {
    // В новой архитектуре обновление теста доступно через Admin API
    throw new AppError('Используйте /api/v1/admin/tests/:id для обновления тестов', 501);
  }

  async deleteTest(_testId: string): Promise<void> {
    // В новой архитектуре удаление теста доступно через Admin API
    throw new AppError('Используйте /api/v1/admin/tests/:id для удаления тестов', 501);
  }

  async getTestResults(_filters: { status?: string; testId?: string } = {}): Promise<any[]> {
    // Перенесено в аналитические/админ endpoints при необходимости
    throw new AppError('Функция переехала в административный API тестов', 501);
  }

  async updateTestResultStatus(_resultId: string, _status: string, _comment?: string): Promise<any> {
    // Не поддерживается в новой архитектуре напрямую
    throw new AppError('Обновление статуса результата не поддерживается напрямую', 501);
  }

  async getTestAnalytics(): Promise<any> {
    const { data: results } = await this.db.from('test_results').select('test_id, passed');
    const totalAttempts = results?.length ?? 0;
    const passedAttempts = (results || []).filter(r => (r as SystemTestResult).passed).length;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    return { totalAttempts, passedAttempts, overallPassRate };
  }
}