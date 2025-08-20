import { z } from 'zod';

/**
 * Схема для начала теста
 */
export const startTestSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID теста должен быть валидным UUID'),
  }),
});

/**
 * Схема для отправки ответов на тест
 */
export const submitTestSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID теста должен быть валидным UUID'),
  }),
  body: z.object({
    sessionId: z.string().uuid('ID сессии должен быть валидным UUID'),
    answers: z.array(z.object({
      questionId: z.string().min(1, 'ID вопроса обязателен'),
      answer: z.any(), // Тип ответа может быть разным (string, number, array)
    })).min(1, 'Должен быть хотя бы один ответ'),
  }),
});

/**
 * Схема для репорта о нарушении
 */
export const reportViolationSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid('ID сессии должен быть валидным UUID'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Причина нарушения обязательна'),
    details: z.string().optional(),
  }),
});

/**
 * Схема для получения результатов теста
 */
export const getTestResultSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID теста должен быть валидным UUID'),
  }),
});

const uuid = z.string().uuid();

// --- ШАГ 1: СХЕМА-ПРЕПРОЦЕССОР ---
// Эта схема принимает ЛЮБОЙ объект, находит `purpose` и приводит его к нижнему регистру.
// .passthrough() сохраняет все остальные поля (title, target и т.д.) без изменений.
const PreprocessorSchema = z
	.object({
		purpose: z.string().trim().transform((val) => val.toLowerCase())
	})
	.passthrough();

// --- ШАГ 2: СТРОГАЯ СХЕМА-ВАЛИДАТОР ---
// Этот валидатор ожидает, что `purpose` УЖЕ в нижнем регистре.
const BaseTestSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(5000).optional(),
	duration_minutes: z.number().int().min(1).optional(),
	passing_score_percent: z.number().int().min(0).max(100).optional(),
	max_focus_losses: z.number().int().min(0).optional()
});

const ValidatorSchema = z.discriminatedUnion('purpose', [
	BaseTestSchema.extend({
		purpose: z.literal('entry'),
		target: z.object({ department_id: uuid })
	}),
	BaseTestSchema.extend({
		purpose: z.literal('promotion'),
		target: z.object({ rank_id: uuid })
	}),
	BaseTestSchema.extend({
		purpose: z.literal('qualification'),
		target: z.object({ qualification_id: uuid })
	})
]);

// --- ШАГ 3: ОБЪЕДИНЕНИЕ ЧЕРЕЗ .pipe() ---
// Сначала прогоняем данные через препроцессор, а результат — через валидатор.
export const TestCreateSchema = PreprocessorSchema.pipe(ValidatorSchema);

// Схема для обновления остается простой, так как `purpose` не меняется.
export const TestUpdateSchema = BaseTestSchema.partial().extend({
	target: z
		.union([
			z.object({ department_id: uuid }),
			z.object({ rank_id: uuid }),
			z.object({ qualification_id: uuid })
		])
		.optional()
});

// Экспортируем типы
export type TestCreatePayload = z.infer<typeof TestCreateSchema>;
export type TestUpdatePayload = z.infer<typeof TestUpdateSchema>; 