import { systemSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// Временные интерфейсы до обновления типизации Database['system']
interface SystemTestRow {
  id: string;
  title: string;
  description?: string | null;
  is_active?: boolean | null;
  time_limit?: number | null; // секунды
  passing_score?: number | null; // проценты (0-100)
  max_focus_losses?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface CreateTestData {
  title: string;
  description?: string | null;
  is_active?: boolean | null;
  time_limit?: number | null;
  passing_score?: number | null;
  max_focus_losses?: number | null;
}

interface UpdateTestData extends Partial<CreateTestData> {}

interface CreateQuestionData {
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text_input';
  order_index?: number | null;
}

interface CreateOptionData {
  text: string;
  is_correct: boolean;
  order_index?: number | null;
}

export class TestAdminService {
  private db = systemSupabase as any;

  /**
   * Создать новый тест
   */
  async createTest(_userId: string, testData: CreateTestData): Promise<SystemTestRow> {
    try {
      const payload = {
        title: testData.title,
        description: testData.description ?? null,
        is_active: testData.is_active ?? true,
        time_limit: testData.time_limit ?? null,
        passing_score: testData.passing_score ?? 85,
        max_focus_losses: testData.max_focus_losses ?? 0,
      };

      const { data, error } = await this.db
        .from('tests')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать тест', 500);
      }
      return data as SystemTestRow;
    } catch (error) {
      console.error('[TestAdminService] Error in createTest:', error);
      throw error;
    }
  }

  /**
   * Обновить тест
   */
  async updateTest(testId: string, testData: UpdateTestData): Promise<SystemTestRow> {
    try {
      const update: any = {};
      if (testData.title !== undefined) update.title = testData.title;
      if (testData.description !== undefined) update.description = testData.description;
      if (testData.is_active !== undefined) update.is_active = testData.is_active;
      if (testData.time_limit !== undefined) update.time_limit = testData.time_limit;
      if (testData.passing_score !== undefined) update.passing_score = testData.passing_score;
      if (testData.max_focus_losses !== undefined) update.max_focus_losses = testData.max_focus_losses;

      const { data, error } = await this.db
        .from('tests')
        .update(update)
        .eq('id', testId)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось обновить тест', 500);
      }
      return data as SystemTestRow;
    } catch (error) {
      console.error('[TestAdminService] Error in updateTest:', error);
      throw error;
    }
  }

  /**
   * Добавить вопрос к тесту
   */
  async addQuestionToTest(testId: string, questionData: CreateQuestionData) {
    try {
      const payload = {
        test_id: testId,
        text: questionData.text,
        type: questionData.type,
        order_index: questionData.order_index ?? null,
      };

      const { data, error } = await this.db
        .from('test_questions')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать вопрос для теста', 500);
      }
      return data;
    } catch (error) {
      console.error('[TestAdminService] Error in addQuestionToTest:', error);
      throw error;
    }
  }

  /**
   * Добавить опцию к вопросу
   */
  async addOptionToQuestion(questionId: string, optionData: CreateOptionData) {
    try {
      const payload = {
        question_id: questionId,
        text: optionData.text,
        is_correct: optionData.is_correct,
        order_index: optionData.order_index ?? null,
      };

      const { data, error } = await this.db
        .from('test_question_options')
        .insert(payload)
        .select('*')
        .single();

      if (error || !data) {
        throw new AppError('Не удалось создать опцию вопроса', 500);
      }
      return data;
    } catch (error) {
      console.error('[TestAdminService] Error in addOptionToQuestion:', error);
      throw error;
    }
  }

  /**
   * Получить тест с вопросами и опциями
   */
  async getTestWithDetails(testId: string) {
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
        .select('id, text, type, order_index')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });
      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const qIds = (questions || []).map((q: any) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, text, is_correct, order_index')
        .in('question_id', qIds.length ? qIds : ['00000000-0000-0000-0000-000000000000'])
        .order('order_index', { ascending: true });
      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const questionIdToOptions: Record<string, any[]> = {};
      for (const opt of options || []) {
        if (!questionIdToOptions[opt.question_id]) questionIdToOptions[opt.question_id] = [];
        questionIdToOptions[opt.question_id].push(opt);
      }

      return {
        ...test,
        questions: (questions || []).map((q: any) => ({
          ...q,
          options: questionIdToOptions[q.id] || [],
        })),
      };
    } catch (error) {
      console.error('[TestAdminService] Error in getTestWithDetails:', error);
      throw error;
    }
  }
}
