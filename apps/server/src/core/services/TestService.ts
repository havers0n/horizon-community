import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@roleplay-identity/db-types";
import { mdtSupabase } from "../lib/supabase";

// Создаем локальные типы-алиасы из глобального типа Database
type Tests = Database['mdt']['Tables']['tests']['Row'];
type TestsInsert = Database['mdt']['Tables']['tests']['Insert'];
type TestsUpdate = Database['mdt']['Tables']['tests']['Update'];
type TestResults = Database['mdt']['Tables']['test_results']['Row'];
type TestSessions = Database['mdt']['Tables']['test_sessions']['Row'];

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
} 