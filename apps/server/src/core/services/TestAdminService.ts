import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';
import type { TestCreatePayload, TestUpdatePayload } from '../schemas/test.schemas';

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

  // === Helpers для новой модели назначения целей ===
  private mapTargetColumns(purpose: string, target: any) {
    const p = (purpose || '').toLowerCase();
    switch (p) {
      case 'entry':
        return {
          target_department_id: target.department_id,
          target_rank_id: null,
          target_qualification_id: null,
        } as Partial<SystemTestInsert>;
      case 'promotion':
        return {
          target_department_id: null,
          target_rank_id: target.rank_id,
          target_qualification_id: null,
        } as Partial<SystemTestInsert>;
      case 'qualification':
        return {
          target_department_id: null,
          target_rank_id: null,
          target_qualification_id: target.qualification_id,
        } as Partial<SystemTestInsert>;
      default:
        throw new AppError('UNSUPPORTED_TEST_PURPOSE', 400);
    }
  }

  private async ensureReferenceExists(purpose: string, target: any) {
    const p = (purpose || '').toLowerCase();
    // Дружественная проверка FK до вставки/обновления
    switch (p) {
      case 'entry': {
        if (!target?.department_id) {
          throw new AppError('DEPARTMENT_ID_REQUIRED', 422);
        }
        const { data, error } = await (this.db as any)
          .schema('common')
          .from('departments')
          .select('id')
          .eq('id', target.department_id)
          .single();
        if (error || !data) throw new AppError('DEPARTMENT_NOT_FOUND', 422);
        return;
      }
      case 'promotion': {
        if (!target?.rank_id) {
          throw new AppError('RANK_ID_REQUIRED', 422);
        }
        const { data, error } = await (this.db as any)
          .schema('common')
          .from('ranks')
          .select('id')
          .eq('id', target.rank_id)
          .single();
        if (error || !data) throw new AppError('RANK_NOT_FOUND', 422);
        return;
      }
      case 'qualification': {
        if (!target?.qualification_id) {
          throw new AppError('QUALIFICATION_ID_REQUIRED', 422);
        }
        const { data, error } = await (this.db as any)
          .schema('common')
          .from('qualifications')
          .select('id')
          .eq('id', target.qualification_id)
          .single();
        if (error || !data) throw new AppError('QUALIFICATION_NOT_FOUND', 422);
        return;
      }
      default: {
        throw new AppError('UNKNOWN_TEST_PURPOSE', 400);
      }
    }
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
   * Создать новый тест (новая схема payload)
   */
  async createTest(userId: string, payload: TestCreatePayload): Promise<SystemTest> {
    try {
      const purpose = payload.purpose as any; // 'entry' | 'promotion' | 'qualification'
      await this.ensureReferenceExists(purpose, payload.target);

      const targetCols = this.mapTargetColumns(purpose, payload.target);

      const insertRecord: SystemTestInsert = {
        title: payload.title,
        description: payload.description ?? null,
        duration_minutes: payload.duration_minutes ?? null,
        passing_score_percent: payload.passing_score_percent ?? undefined,
        max_focus_losses: payload.max_focus_losses ?? undefined,
        purpose,
        ...targetCols,
        created_by_user_id: userId,
      } as SystemTestInsert;

      const { data, error } = await this.db
        .from('tests')
        .insert(insertRecord)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[TestAdminService] RAW DB ERROR on createTest:', { error, insertRecord });
        throw new AppError('Не удалось создать тест', 500);
      }
      return data as SystemTest;
    } catch (error) {
      console.error('[TestAdminService] Error in createTest (catch):', error);
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
   * Обновить тест (новая схема payload)
   */
  async updateTest(testId: string, payload: TestUpdatePayload): Promise<SystemTest> {
    try {
      // Сначала читаем существующий тест, чтобы знать фиксированный purpose
      const existing = await this.db
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();
      if (existing.error || !existing.data) {
        throw new AppError('Тест не найден', 404);
      }

      const currentPurpose = existing.data.purpose as 'ENTRY' | 'PROMOTION' | 'QUALIFICATION';

      const updateRecord: SystemTestUpdate = {} as SystemTestUpdate;
      if (typeof payload.title === 'string') updateRecord.title = payload.title;
      if (typeof payload.description !== 'undefined') updateRecord.description = payload.description ?? null;
      if (typeof payload.duration_minutes !== 'undefined') updateRecord.duration_minutes = payload.duration_minutes;
      if (typeof payload.passing_score_percent !== 'undefined') updateRecord.passing_score_percent = payload.passing_score_percent;
      if (typeof payload.max_focus_losses !== 'undefined') updateRecord.max_focus_losses = payload.max_focus_losses;

      if (payload.target) {
        await this.ensureReferenceExists(currentPurpose, payload.target);
        const targetCols = this.mapTargetColumns(currentPurpose, payload.target);
        // Явно устанавливаем все три целевых поля согласно текущему purpose
        updateRecord.target_department_id = (targetCols as any).target_department_id ?? null;
        updateRecord.target_rank_id = (targetCols as any).target_rank_id ?? null;
        updateRecord.target_qualification_id = (targetCols as any).target_qualification_id ?? null;
      }

      const { data, error } = await this.db
        .from('tests')
        .update(updateRecord)
        .eq('id', testId)
        .select('*')
        .single();

      if (error || !data) {
        console.error('[TestAdminService] RAW DB ERROR on updateTest:', { error, updateRecord, testId });
        throw new AppError('Не удалось обновить тест', 500);
      }
      return data as SystemTest;
    } catch (error) {
      console.error('[TestAdminService] Error in updateTest (catch):', error);
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
