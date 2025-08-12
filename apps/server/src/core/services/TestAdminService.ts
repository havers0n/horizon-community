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
    try {
      const payload: SystemTestQuestionInsert = {
        ...questionData,
        test_id: testId,
      };

      const { data, error } = await this.db
        .from('test_questions')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать вопрос для теста', 500);
      }
      return data as SystemTestQuestion;
    } catch (error) {
      console.error('[TestAdminService] Error in addQuestionToTest:', error);
      throw error;
    }
  }

  /**
   * Добавить опцию к вопросу
   */
  async addOptionToQuestion(questionId: string, optionData: Omit<SystemTestQuestionOptionInsert, 'question_id'>): Promise<SystemTestQuestionOption> {
    try {
      const payload: SystemTestQuestionOptionInsert = {
        ...optionData,
        question_id: questionId,
      };

      const { data, error } = await this.db
        .from('test_question_options')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать опцию вопроса', 500);
      }
      return data as SystemTestQuestionOption;
    } catch (error) {
      console.error('[TestAdminService] Error in addOptionToQuestion:', error);
      throw error;
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
