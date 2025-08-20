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

	// --- ДОБАВЛЕНО: безопасный метод получения результата без ответов ---
	public async getResultBySessionId(sessionId: string, userId: string, db: any) {
		console.log('[TestSessionService] getResultBySessionId: start', { sessionId, userId });

		const { data: result, error } = await db.system
			.from('test_results')
			.select(`
				score,
				max_score,
				percentage,
				passed,
				created_at,
				test_sessions (
					tests ( title, passing_score_percent )
				)
			`)
			.eq('session_id', sessionId)
			.eq('user_id', userId)
			.single();

		if (error) {
			throw new Error(`DB error fetching test result: ${error.message}`);
		}
		if (!result) {
			throw new AppError('Результат теста не найден или не принадлежит вам.', 404);
		}

		return result;
	}

	public async startTestSession(userId: string, testId: string, applicationId: string, db: any) {
		console.log('[TestSessionService] startTestSession: start', { userId, testId, applicationId });

		try {
			// Шаг 1: Найти ID "вида" статусов для тестовых сессий
			console.log('[TestSessionService] Step 1.1: Fetching kind_id for "test_session_status"...');
			const { data: statusKind, error: kindError } = await db.common
				.from('status_kinds')
				.select('id')
				.eq('code', 'test_session')
				.single();

			if (kindError) throw new Error(`DB error fetching status_kind: ${kindError.message}`);
			if (!statusKind) throw new Error('Status kind with code "test_session_status" not found in common.status_kinds');
			
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
	 * --- ЗАМЕНИТЕ ВАШ СТАРЫЙ МЕТОД SUBMITTEST НА ЭТОТ ---
	 */
	public async submitTest(sessionId: string, userId: string, answers: any[], db: any) {
		console.log('[TestSessionService] submitTest: start', { sessionId, userId });

		try {
			// Шаг 1: Найти сессию и убедиться, что она принадлежит пользователю
			console.log('[TestSessionService] Step 1: Fetching session with test data...');
			const { data: session, error: sessionError } = await db.system
				.from('test_sessions')
				.select(`
					*,
					tests (
						passing_score_percent,
						test_questions (
							id,
							question_type,
							test_question_options (id, is_correct)
						)
					)
				`)
				.eq('id', sessionId)
				.eq('user_id', userId)
				.single();

			if (sessionError) throw new Error(`DB error fetching session: ${sessionError.message}`);
			if (!session) throw new AppError('Тестовая сессия не найдена или не принадлежит вам.', 404);
			
			// --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ ---
			// Шаг 2: Найти ID нужных статусов, но ТОЛЬКО для тестовых сессий
			console.log('[TestSessionService] Step 2: Fetching status IDs for "test_session_status"...');
			const { data: statusKind, error: kindError } = await db.common
				.from('status_kinds')
				.select('id')
				.eq('code', 'test_session')
				.single();

			if (kindError) throw new Error(`DB error fetching status_kind: ${kindError.message}`);
			if (!statusKind) throw new Error('Status kind with code "test_session_status" not found');

			const { data: statuses, error: statusesError } = await db.common
				.from('statuses')
				.select('id, code')
				.eq('kind_id', statusKind.id) // <-- УТОЧНЕННЫЙ ПРИКАЗ
				.in('code', ['in_progress', 'completed', 'failed']);

			if (statusesError) throw new Error(`DB error fetching statuses: ${statusesError.message}`);
			const statusMap = statuses.reduce((acc, s) => ({ ...acc, [s.code]: s.id }), {} as Record<string, string>);

			if (!statusMap.in_progress || !statusMap.completed || !statusMap.failed) {
				throw new Error('Could not find required statuses: in_progress, completed, failed for test sessions');
			}
			console.log('[TestSessionService] Step 2 OK: Status map loaded.', statusMap);
			// --- КОНЕЦ ИСПРАВЛЕНИЯ ---

			// Шаг 3: Проверить, что сессия находится в статусе "в процессе"
			console.log(`[TestSessionService] Step 3: Verifying session status. Current statusId: ${session.status_id}`);
			if (session.status_id !== statusMap.in_progress) {
				throw new AppError('Этот тест уже был завершен.', 409);
			}
			console.log('[TestSessionService] Step 3 OK: Session is in_progress.');

			// Шаг 4: Подсчет результатов (логика остается прежней)
			console.log('[TestSessionService] Step 4: Calculating score...');
			const test = session.tests;
			let score = 0;
			const totalQuestions = test.test_questions.length;

			for (const question of test.test_questions) {
				const userAnswer = answers.find((a: any) => a.questionId === question.id);
				if (!userAnswer) continue;

				const correctOptions = question.test_question_options.filter((o: any) => o.is_correct).map((o: any) => o.id);
				if (question.question_type === 'single_choice') {
					if (correctOptions.includes((userAnswer as any).optionId)) {
						score++;
					}
				}
			}
			const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
			const passed = percentage >= test.passing_score_percent;
			console.log(`[TestSessionService] Step 4 OK: Score calculated. ${score}/${totalQuestions} (${percentage}%), Passed: ${passed}`);

			// Шаг 5: Сохранить результаты в `test_results`
			console.log('[TestSessionService] Step 5: Saving test results...');
			const { error: resultError } = await db.system
				.from('test_results')
				.insert({
					session_id: sessionId,
					user_id: userId,
					test_id: session.test_id,
					score,
					max_score: totalQuestions,
					percentage,
					passed,
					answers,
				});
			
			if (resultError) throw new Error(`DB error saving test results: ${resultError.message}`);
			console.log('[TestSessionService] Step 5 OK: Results saved.');

			// Шаг 6: Обновить статус сессии
			console.log('[TestSessionService] Step 6: Updating session status...');
			const finalStatusId = passed ? statusMap.completed : statusMap.failed;
			const { data: updatedSession, error: updateError } = await db.system
				.from('test_sessions')
				.update({ status_id: finalStatusId, end_time: new Date().toISOString() })
				.eq('id', sessionId)
				.select()
				.single();

			if (updateError) throw new Error(`DB error updating session status: ${updateError.message}`);
			console.log('[TestSessionService] Step 6 OK: Session status updated.', updatedSession);

			return { result: 'success', score, percentage, passed, updatedSession };

		} catch (error: any) {
			console.error('[TestSessionService] FATAL ERROR in submitTest:', {
				message: error.message,
				stack: error.stack,
			});

			if (error instanceof AppError) {
				throw error;
			}
			
			throw new AppError('Не удалось завершить тест.', 500);
		}
	}
}
