import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tests, TestsInsert, TestsUpdate, TestResults, TestSessions } from "@roleplay-identity/db-types";
import { mdtClient } from "../lib/supabase";

export class TestService {
  private supabase: any;

  constructor() {
    this.supabase = mdtClient;
  }

  /**
   * Получить все тесты с статистикой
   */
  async getAllTestsWithStats(): Promise<any[]> {
    try {
      // Получаем все тесты
      const { data: tests, error: testsError } = await this.supabase
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
          const { data: results, error: resultsError } = await this.supabase
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
   * Создать новый тест
   */
  async createTest(testData: TestsInsert): Promise<Tests> {
    try {
      const { data, error } = await this.supabase
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
      const { data, error } = await this.supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // "Not a single row" - means not found
          return null;
        }
        console.error(`Error fetching test with id ${testId}:`, error);
        throw new Error("Ошибка при поиске теста.");
      }

      return data as Tests;
    } catch (error) {
      console.error("Error fetching test by ID:", error);
      throw new Error("Ошибка при поиске теста.");
    }
  }

  /**
   * Обновить тест
   */
  async updateTest(testId: string, updateData: TestsUpdate): Promise<Tests> {
    try {
      const { data, error } = await this.supabase
        .from("tests")
        .update(updateData)
        .eq("id", testId)
        .select()
        .single();

      if (error || !data) {
        console.error(`Error updating test with id ${testId}:`, error);
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
      // Проверяем, есть ли активные сессии для этого теста
      const { data: activeSessions, error: sessionsError } = await this.supabase
        .from("test_sessions")
        .select("*")
        .eq("test_id", testId)
        .eq("status", "in_progress");

      if (sessionsError) {
        console.error("Error checking active sessions:", sessionsError);
        throw new Error("Ошибка при проверке активных сессий.");
      }

      if (activeSessions && activeSessions.length > 0) {
        throw new Error("Нельзя удалить тест с активными сессиями.");
      }

      // Удаляем тест
      const { error: deleteError } = await this.supabase
        .from("tests")
        .delete()
        .eq("id", testId);

      if (deleteError) {
        console.error(`Error deleting test with id ${testId}:`, deleteError);
        throw new Error("Не удалось удалить тест.");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      throw error;
    }
  }

  /**
   * Получить все результаты тестов с фильтрами
   */
  async getTestResults(filters: { status?: string; testId?: string } = {}): Promise<any[]> {
    try {
      const { status, testId } = filters;

      let query = this.supabase
        .from("test_results")
        .select(`
          id,
          score,
          max_score,
          percentage,
          passed,
          time_spent,
          focus_lost_count,
          warnings_count,
          created_at,
          status,
          admin_comment,
          user_id,
          test_id,
          profiles!test_results_user_id_fkey(username),
          tests!test_results_test_id_fkey(title)
        `)
        .order("created_at", { ascending: false });

      if (status && status !== 'all') {
        query = query.eq("status", status);
      }

      if (testId) {
        query = query.eq("test_id", testId);
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
      const { data, error } = await this.supabase
        .from("test_results")
        .update({ status, admin_comment: comment })
        .eq("id", resultId)
        .select()
        .single();

      if (error || !data) {
        console.error(`Error updating test result with id ${resultId}:`, error);
        throw new Error("Не удалось обновить статус результата теста.");
      }

      return data;
    } catch (error) {
      console.error("Error updating test result status:", error);
      throw error;
    }
  }

  /**
   * Получить аналитику тестов
   */
  async getTestAnalytics(): Promise<any> {
    try {
      // Общая статистика
      const { count: totalTests } = await this.supabase
        .from("tests")
        .select("*", { count: "exact", head: true });

      const { count: totalAttempts } = await this.supabase
        .from("test_results")
        .select("*", { count: "exact", head: true });

      const { count: totalPassed } = await this.supabase
        .from("test_results")
        .select("*", { count: "exact", head: true })
        .eq("passed", true);

      // Статистика по тестам - используем простой запрос вместо RPC
      const { data: testStats, error: testStatsError } = await this.supabase
        .from("tests")
        .select(`
          id,
          title,
          test_results(count)
        `);

      if (testStatsError) {
        console.error("Error fetching test statistics:", testStatsError);
        throw new Error("Не удалось получить статистику тестов.");
      }

      // Статистика по времени - используем простой запрос вместо RPC
      const { data: timeStats, error: timeStatsError } = await this.supabase
        .from("test_results")
        .select("created_at");

      if (timeStatsError) {
        console.error("Error fetching time statistics:", timeStatsError);
        throw new Error("Не удалось получить временную статистику.");
      }

      return {
        overview: {
          totalTests: totalTests || 0,
          totalAttempts: totalAttempts || 0,
          totalPassed: totalPassed || 0,
          passRate: (totalAttempts || 0) > 0 
            ? Math.round(((totalPassed || 0) / (totalAttempts || 0)) * 100) 
            : 0
        },
        testStats: testStats || [],
        timeStats: timeStats || []
      };
    } catch (error) {
      console.error("Error fetching test analytics:", error);
      throw new Error("Не удалось получить аналитику тестов.");
    }
  }
} 