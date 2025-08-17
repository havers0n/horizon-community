import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';

// Типы для схемы system
type SystemTest = Database['system']['Tables']['tests']['Row'];
type SystemTestInsert = Database['system']['Tables']['tests']['Insert'];
type SystemTestUpdate = Database['system']['Tables']['tests']['Update'];

type SystemTestQuestion = Database['system']['Tables']['test_questions']['Row'];
type SystemTestQuestionInsert = Database['system']['Tables']['test_questions']['Insert'];

type SystemTestQuestionOption = Database['system']['Tables']['test_question_options']['Row'];
type SystemTestQuestionOptionInsert = Database['system']['Tables']['test_question_options']['Insert'];

export class TestAdminService {
  private readonly db: SupabaseClient<Database, 'system'>;

  constructor(systemDb: SupabaseClient<Database, 'system'>) {
    this.db = systemDb;
  }

  /**
   * Получить все тесты
   */
  async getAllTests(): Promise<SystemTest[]> {
    try {
      const { data, error } = await this.db
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[TestAdminService] getAllTests DB error:', error);
        throw new AppError('Не удалось получить список тестов', 500);
      }

      return (data || []) as SystemTest[];
    } catch (error) {
      console.error('[TestAdminService] Error in getAllTests:', error);
      throw error;
    }
  }

  /**
   * Создать новый тест
   */
  async createTest(userId: string, testData: Omit<SystemTestInsert, 'created_by_user_id'>): Promise<SystemTest> {
    try {
      const payload: SystemTestInsert = {
        ...testData,
        created_by_user_id: userId,
      };

      const { data, error } = await this.db
        .from('tests')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать тест', 500);
      }
      return data as SystemTest;
    } catch (error) {
      console.error('[TestAdminService] Error in createTest:', error);
      throw error;
    }
  }

  /**
   * Получить тест по id
   */
  async getTestById(testId: string): Promise<SystemTest> {
    try {
      const { data, error } = await this.db
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error || !data) {
        throw new AppError('Тест не найден', 404);
      }
      return data as SystemTest;
    } catch (error) {
      console.error('[TestAdminService] Error in getTestById:', error);
      throw error;
    }
  }

  /**
   * Получить вопросы теста с вариантами ответов
   */
  async getQuestionsForTest(testId: string): Promise<Array<SystemTestQuestion & { options: SystemTestQuestionOption[] }>> {
    try {
      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, question_text, question_type, order_index, test_id, created_at')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });
      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const qIds = (questions || []).map((q) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, option_text, is_correct, created_at')
        .in('question_id', qIds.length ? qIds : ['00000000-0000-0000-0000-000000000000']);
      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const optionsByQuestion = new Map<string, SystemTestQuestionOption[]>();
      for (const opt of options || []) {
        const arr = optionsByQuestion.get(opt.question_id) || [];
        arr.push(opt as SystemTestQuestionOption);
        optionsByQuestion.set(opt.question_id, arr);
      }

      const questionsWithOptions = (questions || []).map((q) => ({
        ...(q as SystemTestQuestion),
        options: optionsByQuestion.get(q.id) || [],
      }));

      return questionsWithOptions;
    } catch (error) {
      console.error('[TestAdminService] Error in getQuestionsForTest:', error);
      throw error;
    }
  }

  /**
   * Удалить тест (опции -> вопросы -> тест)
   */
  async deleteTest(testId: string): Promise<void> {
    try {
      console.log(`[TestAdminService] Attempting to delete test with ID: ${testId}`);

      // 1) Удаляем результаты и сессии, если они есть
      const { data: delResultsRows, error: delResultsErr } = await this.db
        .from('test_results')
        .delete()
        .eq('test_id', testId)
        .select('id');
      if (delResultsErr) {
        console.error('[TestAdminService] RAW DB ERROR deleting test_results:', delResultsErr);
        throw new AppError('Не удалось удалить результаты теста', 500);
      }
      console.log(`[TestAdminService] Deleted test_results count: ${delResultsRows?.length ?? 0}`);

      const { data: delSessionsRows, error: delSessionsErr } = await this.db
        .from('test_sessions')
        .delete()
        .eq('test_id', testId)
        .select('id');
      if (delSessionsErr) {
        console.error('[TestAdminService] RAW DB ERROR deleting test_sessions:', delSessionsErr);
        throw new AppError('Не удалось удалить сессии теста', 500);
      }
      console.log(`[TestAdminService] Deleted test_sessions count: ${delSessionsRows?.length ?? 0}`);

      // Собираем id вопросов для каскадного удаления опций
      const { data: qIdsData, error: qIdsErr } = await this.db
        .from('test_questions')
        .select('id')
        .eq('test_id', testId);
      if (qIdsErr) {
        console.error('[TestAdminService] get question ids error:', qIdsErr);
        throw new AppError('Не удалось получить вопросы теста', 500);
      }
      const qIds = (qIdsData || []).map((r: any) => r.id);
      console.log(`[TestAdminService] Found ${qIds.length} question(s) for test ${testId}`);

      if (qIds.length > 0) {
        const { data: delOptsRows, error: delOptsErr } = await this.db
          .from('test_question_options')
          .delete()
          .in('question_id', qIds)
          .select('id');
        if (delOptsErr) {
          console.error('[TestAdminService] RAW DB ERROR deleting options:', delOptsErr);
          throw new AppError('Не удалось удалить варианты ответов', 500);
        }
        console.log(`[TestAdminService] Deleted options count: ${delOptsRows?.length ?? 0}`);

        const { data: delQsRows, error: delQsErr } = await this.db
          .from('test_questions')
          .delete()
          .eq('test_id', testId)
          .select('id');
        if (delQsErr) {
          console.error('[TestAdminService] RAW DB ERROR deleting questions:', delQsErr);
          throw new AppError('Не удалось удалить вопросы теста', 500);
        }
        console.log(`[TestAdminService] Deleted questions count: ${delQsRows?.length ?? 0}`);
      }

      const { data: delTestRows, error: delTestErr } = await this.db
        .from('tests')
        .delete()
        .eq('id', testId)
        .select('id');
      if (delTestErr) {
        console.error('[TestAdminService] RAW DB ERROR deleting test:', delTestErr);
        throw new AppError('Не удалось удалить тест', 500);
      }
      const deletedCount = delTestRows?.length ?? 0;
      console.log(`[TestAdminService] Deleted tests count: ${deletedCount}`);
      if (deletedCount === 0) {
        // Ничего не удалилось — логируем и бросаем 404 для явной диагностики
        console.warn('[TestAdminService] deleteTest: no row deleted for id', testId);
        throw new AppError('Тест не найден или уже удален', 404);
      }
    } catch (error) {
      console.error('[TestAdminService] Error in deleteTest:', error);
      throw error;
    }
  }

  /**
   * Обновить тест
   */
  async updateTest(testId: string, testData: SystemTestUpdate): Promise<SystemTest> {
    try {
      const { data, error } = await this.db
        .from('tests')
        .update(testData)
        .eq('id', testId)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось обновить тест', 500);
      }
      return data as SystemTest;
    } catch (error) {
      console.error('[TestAdminService] Error in updateTest:', error);
      throw error;
    }
  }

  /**
   * Добавить вопрос к тесту
   */
  async addQuestionToTest(testId: string, questionData: Omit<SystemTestQuestionInsert, 'test_id'>): Promise<SystemTestQuestion> {
    console.log('[TestAdminService] Entering addQuestionToTest with:', { testId, questionData });
    try {
      const { data: newQuestion, error } = await this.db
        .from('test_questions')
        .insert([
          {
            test_id: testId,
            // Берём только необходимые поля явно, чтобы увидеть точную ошибку схемы
            question_text: (questionData as any).question_text,
            question_type: (questionData as any).question_type,
          } as any,
        ])
        .select('*')
        .single();

      if (error) {
        // Критически важный сырой лог ошибки от PG/Supabase
        console.error('[TestAdminService] RAW PG ERROR on INSERT:', error);
        // Пробрасываем исходную ошибку наверх
        throw error;
      }

      if (!newQuestion) {
        console.error('[TestAdminService] INSERT returned no data for test_questions');
        throw new Error('Insert returned no data');
      }

      return newQuestion as SystemTestQuestion;
    } catch (error) {
      // Финальный перехват — логируем и возвращаем человеко‑читаемую ошибку
      console.error('[TestAdminService] CATCH BLOCK error:', error);
      throw new AppError('Не удалось создать вопрос для теста', 500);
    }
  }

  /**
   * Добавить опцию к вопросу
   */
  async addOptionToQuestion(questionId: string, optionData: Omit<SystemTestQuestionOptionInsert, 'question_id'>): Promise<SystemTestQuestionOption> {
    console.log('[TestAdminService] Entering addOptionToQuestion with:', { questionId, optionData });
    try {
      const { data: newOption, error } = await this.db
        .from('test_question_options')
        .insert([
          {
            question_id: questionId,
            option_text: (optionData as any).option_text,
            is_correct: (optionData as any).is_correct,
          } as any,
        ])
        .select('*')
        .single();

      if (error) {
        console.error('[TestAdminService] RAW PG ERROR on INSERT option:', error);
        throw error;
      }

      if (!newOption) {
        console.error('[TestAdminService] INSERT returned no data for test_question_options');
        throw new Error('Insert returned no data');
      }

      return newOption as SystemTestQuestionOption;
    } catch (error) {
      console.error('[TestAdminService] CATCH BLOCK error on option:', error);
      throw new AppError('Не удалось создать опцию вопроса', 500);
    }
  }

  /**
   * Получить тест с вопросами и опциями
   */
  async getTestWithDetails(testId: string): Promise<{
    test: SystemTest;
    questions: Array<SystemTestQuestion & { options: SystemTestQuestionOption[] }>;
  }> {
    try {
      const { data: test, error: tErr } = await this.db
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();
      if (tErr || !test) {
        throw new AppError('Тест не найден', 404);
      }

      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, question_text, question_type, order_index, test_id, created_at')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });
      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const qIds = (questions || []).map((q) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, option_text, is_correct, created_at')
        .in('question_id', qIds.length ? qIds : ['00000000-0000-0000-0000-000000000000']);
      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const optionsByQuestion = new Map<string, SystemTestQuestionOption[]>();
      for (const opt of options || []) {
        const arr = optionsByQuestion.get(opt.question_id) || [];
        arr.push(opt as SystemTestQuestionOption);
        optionsByQuestion.set(opt.question_id, arr);
      }

      const questionsWithOptions = (questions || []).map((q) => ({
        ...(q as SystemTestQuestion),
        options: optionsByQuestion.get(q.id) || [],
      }));

      return { test: test as SystemTest, questions: questionsWithOptions };
    } catch (error) {
      console.error('[TestAdminService] Error in getTestWithDetails:', error);
      throw error;
    }
  }
}
