import { systemSupabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';

// Временные интерфейсы до обновления типизации Database['system']
// Эти интерфейсы соответствуют нормализованной схеме system.*
interface SystemTestRow {
  id: string;
  title: string;
  description?: string | null;
  is_active?: boolean | null;
  time_limit?: number | null; // секунды
  passing_score?: number | null; // проценты (0-100)
  max_focus_losses?: number | null;
}

interface SystemTestQuestionRow {
  id: string;
  test_id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text_input';
  order_index?: number | null;
}

interface SystemTestQuestionOptionRow {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order_index?: number | null;
}

interface SystemTestSessionRow {
  id: string;
  user_id: string;
  test_id: string;
  application_id?: string | null;
  status: 'in_progress' | 'paused' | 'completed' | 'expired' | 'annulled';
  start_time: string; // ISO
  end_time?: string | null;
  time_limit?: number | null; // секунды
  focus_losses_count?: number | null;
}

interface SystemTestResultInsert {
  session_id: string;
  user_id: string;
  test_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  answers: any; // JSON массив ответов пользователя
  time_taken: number; // секунды
}

export type UserAnswer = {
  questionId: string;
  // Для choice-вопросов ожидаем массив идентификаторов опций или одиночный id
  // Для текстовых — строка
  answer: string | string[];
};

export class TestSessionService {
  private db = systemSupabase as any;

  /**
   * Запустить сессию теста: создает запись в system.test_sessions и возвращает вопросы без флага is_correct
   */
  async startTestSession(userId: string, testId: string, applicationId?: string) {
    try {
      // 1) Получаем тест
      const { data: test, error: testError } = await this.db
        .from('tests')
        .select('*')
        .eq('id', testId)
        .eq('is_active', true)
        .single();

      if (testError || !test) {
        throw new AppError('Тест не найден или неактивен', 404);
      }

      // 2) Создаем сессию
      const now = new Date().toISOString();
      const sessionPayload = {
        user_id: userId,
        test_id: testId,
        application_id: applicationId ?? null,
        status: 'in_progress',
        start_time: now,
        time_limit: (test as SystemTestRow).time_limit ?? null,
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

      // 3) Получаем вопросы и опции, скрывая is_correct
      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, text, type, order_index')
        .eq('test_id', testId)
        .order('order_index', { ascending: true });

      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const questionIds = (questions || []).map((q: any) => q.id);
      const { data: options, error: oErr } = await this.db
        .from('test_question_options')
        .select('id, question_id, text, order_index')
        .in('question_id', questionIds.length ? questionIds : ['00000000-0000-0000-0000-000000000000'])
        .order('order_index', { ascending: true });

      if (oErr) {
        throw new AppError('Не удалось получить варианты ответов', 500);
      }

      const questionIdToOptions: Record<string, any[]> = {};
      for (const opt of options || []) {
        if (!questionIdToOptions[opt.question_id]) questionIdToOptions[opt.question_id] = [];
        questionIdToOptions[opt.question_id].push({ id: opt.id, text: opt.text, order_index: opt.order_index });
      }

      const questionsForClient = (questions || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        order_index: q.order_index,
        options: questionIdToOptions[q.id] || [],
      }));

      return {
        sessionId: session.id as string,
        questions: questionsForClient,
        startTime: session.start_time as string,
        timeLimit: session.time_limit as number | null,
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
      // Берем сессию и связанный тест
      const { data: session, error: sErr } = await this.db
        .from('test_sessions')
        .select('id, user_id, test_id, status, focus_losses_count')
        .eq('id', sessionId)
        .single();

      if (sErr || !session) {
        throw new AppError('Сессия не найдена', 404);
      }
      if (session.user_id !== userId) {
        throw new AppError('Доступ запрещен', 403);
      }
      if (session.status !== 'in_progress') {
        return { status: session.status, focus_losses_count: session.focus_losses_count ?? 0 };
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
      const maxLosses = (test as SystemTestRow).max_focus_losses ?? 0;

      if (maxLosses > 0 && current > maxLosses) {
        const { error: updErr } = await this.db
          .from('test_sessions')
          .update({ status: 'annulled', end_time: new Date().toISOString(), focus_losses_count: current })
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
      if (session.status !== 'in_progress') {
        throw new AppError(`Неверный статус сессии: ${session.status}`, 409);
      }

      // 2) Проверка времени
      const startTime = new Date(session.start_time).getTime();
      const timeLimit = (session.time_limit ?? 0) > 0 ? Number(session.time_limit) : null;
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

      if (timeLimit && elapsedSec > timeLimit) {
        await this.db
          .from('test_sessions')
          .update({ status: 'expired', end_time: new Date().toISOString() })
          .eq('id', sessionId);
        throw new AppError('Время тестирования истекло', 410);
      }

      // 3) Получить структуру теста
      const { data: questions, error: qErr } = await this.db
        .from('test_questions')
        .select('id, type')
        .eq('test_id', session.test_id);

      if (qErr) {
        throw new AppError('Не удалось получить вопросы теста', 500);
      }

      const questionIds = (questions || []).map((q: any) => q.id);
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
        if (q.type === 'text_input') {
          // Текстовые вопросы в этой версии не оцениваются автоматически
          continue;
        }
        const correctSet = correctOptionIdsByQuestion.get(q.id) || new Set<string>();
        if (!answer) continue;

        if (q.type === 'single_choice') {
          if (typeof answer === 'string' && correctSet.has(answer)) {
            score += 1;
          }
        } else if (q.type === 'multiple_choice') {
          if (Array.isArray(answer)) {
            const chosen = new Set(answer);
            // правильный выбор: точное совпадение множеств
            const allCorrectChosen = [...correctSet].every((id) => chosen.has(id));
            const noExtra = [...chosen].every((id) => correctSet.has(id));
            if (allCorrectChosen && noExtra) {
              score += 1;
            }
          }
        }
      }

      // 5) Получаем параметры прохождения
      const { data: test, error: tErr } = await this.db
        .from('tests')
        .select('passing_score')
        .eq('id', session.test_id)
        .single();

      if (tErr || !test) {
        throw new AppError('Тест не найден', 404);
      }

      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const passingScore = (test as SystemTestRow).passing_score ?? 85;
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
        answers,
        time_taken: elapsedSec,
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
        .update({ status: 'completed', end_time: new Date().toISOString() })
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
