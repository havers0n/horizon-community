import { systemSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Типы для схемы system
export type SystemTest = Database['system']['Tables']['tests']['Row'];
export type SystemTestQuestion = Database['system']['Tables']['test_questions']['Row'];
export type SystemTestQuestionOption = Database['system']['Tables']['test_question_options']['Row'];
export type SystemTestSession = Database['system']['Tables']['test_sessions']['Row'];
export type SystemTestResultInsert = Database['system']['Tables']['test_results']['Insert'];

export type UserAnswer = {
  questionId: string;
  answer: string | string[];
};

export class TestSessionService {
  private readonly db: SupabaseClient<Database, 'system'>;

  constructor(systemDb?: SupabaseClient<Database, 'system'>) {
    // Временный fallback для обратной совместимости с существующими вызовами
    this.db = (systemDb ?? (systemSupabase as unknown as SupabaseClient<Database, 'system'>));
  }

  /**
   * Запустить сессию теста: создает запись в system.test_sessions и возвращает вопросы без флага is_correct
   */
  async startTestSession(userId: string, testId: string, applicationId?: string) {
    try {
      // 1) Получаем тест (только активные)
      const { data: test, error: testError } = await this.db
        .from('tests')
        .select('id, duration_minutes, passing_score_percent, max_focus_losses')
        .eq('id', testId)
        .single();

      if (testError || !test) {
        throw new AppError('Тест не найден', 404);
      }

      // 2) Создаем сессию
      const now = new Date().toISOString();
      const sessionPayload: Database['system']['Tables']['test_sessions']['Insert'] = {
        user_id: userId,
        test_id: testId,
        application_id: applicationId ?? null,
        status_id: 'in_progress',
        start_time: now,
        focus_losses_count: 0,
      };

      const { data: session, error: sessionError } = await this.db
        .from('test_sessions')
        .insert(sessionPayload)
        .select('*')
        .single();

      if (sessionError || !session) {
        throw new AppError('Не удалось создать сессию тестирования', 500);
      }

      // 3) Получаем вопросы и опции, скрывая корректность
      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, question_text, question_type, order_index')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });

      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const questionIds = (questions || []).map((q) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, option_text')
        .in('question_id', questionIds.length ? questionIds : ['00000000-0000-0000-0000-000000000000'])
        .order('id');

      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const optionsByQuestion = new Map<string, Array<{ id: string; option_text: string }>>();
      for (const opt of options || []) {
        const arr = optionsByQuestion.get(opt.question_id) || [];
        arr.push({ id: opt.id, option_text: opt.option_text });
        optionsByQuestion.set(opt.question_id, arr);
      }

      const questionsForClient = (questions || []).map((q) => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        order_index: q.order_index,
        options: optionsByQuestion.get(q.id) || [],
      }));

      // duration_minutes -> в секундах
      const timeLimitSeconds = (test.duration_minutes ?? 0) > 0 ? (test.duration_minutes as number) * 60 : null;

      return {
        sessionId: (session as SystemTestSession).id,
        questions: questionsForClient,
        startTime: (session as SystemTestSession).start_time!,
        timeLimit: timeLimitSeconds,
      };
    } catch (error) {
      console.error('[TestSessionService] Error in startTestSession:', error);
      throw error;
    }
  }

  /**
   * Зафиксировать потерю фокуса. Если превышен лимит, аннулировать сессию
   */
  async recordFocusLoss(sessionId: string, userId: string) {
    try {
      const { data: session, error: sErr } = await this.db
        .from('test_sessions')
        .select('id, user_id, test_id, status_id, focus_losses_count')
        .eq('id', sessionId)
        .single();

      if (sErr || !session) {
        throw new AppError('Сессия не найдена', 404);
      }
      if (session.user_id !== userId) {
        throw new AppError('Доступ запрещен', 403);
      }
      if (session.status_id !== 'in_progress') {
        return { status: session.status_id, focus_losses_count: session.focus_losses_count ?? 0 };
      }

      const { data: test, error: tErr } = await this.db
        .from('tests')
        .select('id, max_focus_losses')
        .eq('id', session.test_id)
        .single();

      if (tErr || !test) {
        throw new AppError('Тест не найден', 404);
      }

      const current = (session.focus_losses_count ?? 0) + 1;
      const maxLosses = test.max_focus_losses ?? 0;

      if (maxLosses > 0 && current > maxLosses) {
        const { error: updErr } = await this.db
          .from('test_sessions')
          .update({ status_id: 'annulled', end_time: new Date().toISOString(), focus_losses_count: current })
          .eq('id', sessionId);
        if (updErr) {
          throw new AppError('Не удалось обновить статус сессии', 500);
        }
        return { status: 'annulled' as const, focus_losses_count: current };
      }

      const { error: incErr } = await this.db
        .from('test_sessions')
        .update({ focus_losses_count: current })
        .eq('id', sessionId);
      if (incErr) {
        throw new AppError('Не удалось обновить сессию', 500);
      }
      return { status: 'in_progress' as const, focus_losses_count: current };
    } catch (error) {
      console.error('[TestSessionService] Error in recordFocusLoss:', error);
      throw error;
    }
  }

  /**
   * Отправить тест: сохраняем ответы, считаем баллы и результат, закрываем сессию
   */
  async submitTest(sessionId: string, userId: string, answers: UserAnswer[]) {
    try {
      // 1) Найти сессию
      const { data: session, error: sErr } = await this.db
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sErr || !session) {
        throw new AppError('Сессия тестирования не найдена', 404);
      }
      if (session.user_id !== userId) {
        throw new AppError('Доступ запрещен', 403);
      }
      if (session.status_id !== 'in_progress') {
        throw new AppError(`Неверный статус сессии: ${session.status_id}`, 409);
      }

      // 2) Проверка времени
      const startTime = new Date(session.start_time!).getTime();
      const { data: test } = await this.db.from('tests').select('duration_minutes, passing_score_percent').eq('id', session.test_id).single();
      const limitSec = (test?.duration_minutes ?? 0) > 0 ? (test!.duration_minutes as number) * 60 : null;
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

      if (limitSec && elapsedSec > limitSec) {
        await this.db
          .from('test_sessions')
          .update({ status_id: 'expired', end_time: new Date().toISOString() })
          .eq('id', sessionId);
        throw new AppError('Время тестирования истекло', 410);
      }

      // 3) Получить структуру теста
      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, question_type')
        .eq('test_id', session.test_id);

      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const questionIds = (questions || []).map((q) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, is_correct')
        .in('question_id', questionIds.length ? questionIds : ['00000000-0000-0000-0000-000000000000']);

      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const correctOptionIdsByQuestion = new Map<string, Set<string>>();
      for (const opt of options || []) {
        if (opt.is_correct) {
          if (!correctOptionIdsByQuestion.has(opt.question_id)) {
            correctOptionIdsByQuestion.set(opt.question_id, new Set());
          }
          correctOptionIdsByQuestion.get(opt.question_id)!.add(opt.id);
        }
      }

      // 4) Подсчёт результата
      let score = 0;
      const totalQuestions = (questions || []).length;

      const answerMap = new Map<string, string | string[]>();
      for (const a of answers) {
        answerMap.set(a.questionId, a.answer);
      }

      for (const q of questions || []) {
        const answer = answerMap.get(q.id);
        if (q.question_type === 'text_input') {
          continue; // текстовые не оцениваем автоматически
        }
        const correctSet = correctOptionIdsByQuestion.get(q.id) || new Set<string>();
        if (!answer) continue;

        if (q.question_type === 'single_choice') {
          if (typeof answer === 'string' && correctSet.has(answer)) {
            score += 1;
          }
        } else if (q.question_type === 'multiple_choice') {
          if (Array.isArray(answer)) {
            const chosen = new Set(answer);
            const allCorrectChosen = [...correctSet].every((id) => chosen.has(id));
            const noExtra = [...chosen].every((id) => correctSet.has(id));
            if (allCorrectChosen && noExtra) {
              score += 1;
            }
          }
        }
      }

      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const passingScore = test?.passing_score_percent ?? 85;
      const passed = percentage >= passingScore;

      // 6) Сохраняем результат
      const resultPayload: SystemTestResultInsert = {
        session_id: sessionId,
        user_id: userId,
        test_id: session.test_id,
        score,
        max_score: totalQuestions,
        percentage,
        passed,
        answers: answers as unknown as any, // answers: Json
        time_spent_seconds: elapsedSec,
      };

      const { error: rErr } = await this.db
        .from('test_results')
        .insert(resultPayload);
      if (rErr) {
        throw new AppError('Не удалось сохранить результат теста', 500);
      }

      // 7) Закрываем сессию
      const { error: uErr } = await this.db
        .from('test_sessions')
        .update({ status_id: 'completed', end_time: new Date().toISOString() })
        .eq('id', sessionId);
      if (uErr) {
        throw new AppError('Не удалось обновить статус сессии', 500);
      }

      return { score, totalQuestions, percentage, passed };
    } catch (error) {
      console.error('[TestSessionService] Error in submitTest:', error);
      throw error;
    }
  }
}
