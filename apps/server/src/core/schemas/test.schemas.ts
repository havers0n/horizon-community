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

/**
 * Схема для создания теста (админ)
 */
export const createTestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Название теста обязательно'),
    description: z.string().optional(),
    questions: z.array(z.object({
      id: z.string().min(1, 'ID вопроса обязателен'),
      question: z.string().min(1, 'Текст вопроса обязателен'),
      type: z.enum(['single', 'multiple', 'text']),
      options: z.array(z.string()).optional(),
      correct_answer: z.any(),
      points: z.number().min(1, 'Количество баллов должно быть больше 0'),
    })).min(1, 'Должен быть хотя бы один вопрос'),
    timeLimit: z.number().min(1, 'Лимит времени должен быть больше 0').optional(),
    passingScore: z.number().min(0, 'Проходной балл не может быть отрицательным').optional(),
  }),
});

/**
 * Схема для обновления теста (админ)
 */
export const updateTestSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID теста должен быть валидным UUID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Название теста обязательно').optional(),
    description: z.string().optional(),
    questions: z.array(z.object({
      id: z.string().min(1, 'ID вопроса обязателен'),
      question: z.string().min(1, 'Текст вопроса обязателен'),
      type: z.enum(['single', 'multiple', 'text']),
      options: z.array(z.string()).optional(),
      correct_answer: z.any(),
      points: z.number().min(1, 'Количество баллов должно быть больше 0'),
    })).min(1, 'Должен быть хотя бы один вопрос').optional(),
    timeLimit: z.number().min(1, 'Лимит времени должен быть больше 0').optional(),
    passingScore: z.number().min(0, 'Проходной балл не может быть отрицательным').optional(),
  }),
}); 