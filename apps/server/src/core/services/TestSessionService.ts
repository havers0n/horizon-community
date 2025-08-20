import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';

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

	constructor(systemDb: SupabaseClient<Database, 'system'>) {
		this.db = systemDb;
	}

	/**
	 * Получить полную информацию о сессии с вложенными тестом, вопросами и опциями
	 */
	public async getTestSessionById(sessionId: string, userId: string, db: any) {
		try {
			const { data, error } = await db.system
				.from('test_sessions')
				.select(`
					*,
					tests (
						*,
						test_questions (
							*,
							test_question_options (*)
						)
					)
				`)
				.eq('id', sessionId)
				.eq('user_id', userId)
				.single();

			if (error) {
				console.error('[TestSessionService] getTestSessionById DB error:', error);
				throw new AppError('Не удалось получить сессию тестирования', 500);
			}
			if (!data) {
				throw new AppError('Сессия не найдена', 404);
			}

			return data;
		} catch (err) {
			console.error('[TestSessionService] Error in getTestSessionById:', err);
			throw err;
		}
	}

	public async startTestSession(userId: string, testId: string, applicationId: string, db: any) {
		console.log('[TestSessionService] startTestSession: start', { userId, testId, applicationId });

		try {
			// Шаг 1: Найти ID "вида" статусов для тестовых сессий
			console.log('[TestSessionService] Step 1.1: Fetching kind_id for "test_session"...');
			const { data: statusKind, error: kindError } = await db.common
				.from('status_kinds')
				.select('id')
				.eq('code', 'test_session')
				.single();

			if (kindError) throw new Error(`DB error fetching status_kind: ${kindError.message}`);
			if (!statusKind) throw new Error('Status kind with code "test_session" not found in common.status_kinds');
			
			const testSessionStatusKindId = statusKind.id;
			console.log(`[TestSessionService] Step 1.1 OK: statusKindId is ${testSessionStatusKindId}`);

			// Шаг 2: Найти ID статуса "в процессе", используя kind_id
			console.log('[TestSessionService] Step 1.2: Fetching status_id for "in_progress"...');
			const { data: inProgressStatus, error: statusError } = await db.common
				.from('statuses')
				.select('id')
				.eq('code', 'in_progress')
				.eq('kind_id', testSessionStatusKindId) // <-- УТОЧНЕНИЕ ПРИКАЗА
				.single();

			if (statusError) throw new Error(`DB error fetching status: ${statusError.message}`);
			if (!inProgressStatus) throw new Error('Status with code "in_progress" for test sessions not found in common.statuses');

			const statusId = inProgressStatus.id;
			console.log(`[TestSessionService] Step 1.2 OK: statusId is ${statusId}`);

			// Шаг 2: Проверить, нет ли у пользователя уже активной сессии
			console.log('[TestSessionService] Step 2: Checking for existing active sessions...');
			const { data: existingSessions, error: selectSessionError } = await db.system
				.from('test_sessions')
				.select('id')
				.eq('user_id', userId)
				.eq('status_id', statusId);

			if (selectSessionError) throw new Error(`DB error checking existing sessions: ${selectSessionError.message}`);

			// Проверяем, вернулся ли массив, и есть ли в нем хоть что-то
			if (Array.isArray(existingSessions) && existingSessions.length > 0) {
				console.warn(`[TestSessionService] User already has ${existingSessions.length} active session(s). Denying creation of a new one.`);
				throw new AppError('У вас уже есть активная сессия тестирования.', 409);
			}

			console.log('[TestSessionService] Step 2 OK: No active session found.');

			// Шаг 4: Получить детали самого теста
			console.log(`[TestSessionService] Step 3: Fetching test details for testId: ${testId}...`);
			const { data: testDetails, error: testDetailsError } = await db.system
				.from('tests')
				.select('id')
				.eq('id', testId)
				.single();
				
			if (testDetailsError) throw new Error(`DB error fetching test details: ${testDetailsError.message}`);
			if (!testDetails) throw new AppError(`Тест с ID ${testId} не найден.`, 404);

			console.log(`[TestSessionService] Step 3 OK: Test with id ${testId} found.`);

			// Шаг 5: Создать новую сессию
			const sessionRecord = {
				user_id: userId,
				test_id: testId,
				application_id: applicationId,
				status_id: statusId,
			};
			console.log('[TestSessionService] Step 4: Inserting new test session with data:', sessionRecord);

			const { data: newSession, error: insertError } = await db.system
				.from('test_sessions')
				.insert(sessionRecord)
				.select('*')
				.single();

			if (insertError) throw new Error(`DB error inserting new session: ${insertError.message}`);

			console.log('[TestSessionService] Step 4 OK: Session created successfully!', newSession);
			return newSession;

		} catch (error: any) {
			// Логируем НАСТОЯЩУЮ ошибку
			console.error('[TestSessionService] FATAL ERROR in startTestSession:', {
				message: error.message,
				stack: error.stack,
			});
			
			if (error instanceof AppError) {
				throw error;
			}
			
			throw new AppError('Не удалось создать сессию тестирования', 500);
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
