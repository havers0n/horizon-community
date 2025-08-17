import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createTest,
  createQuestion,
  addOption,
  type CreateTestDto,
  listRanks,
  listQualifications,
} from '@/features/admin/tests/api'
import { getPublicDepartments } from '@/shared/api/public-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useSession } from '@/shared/contexts/SessionContext'

const optionSchema = z.object({
  option_text: z.string().min(1, 'Укажите текст варианта'),
  is_correct: z.boolean().optional().default(false),
})

const questionSchema = z.object({
  question_text: z.string().min(1, 'Обязательное поле'),
  question_type: z.enum(['single_choice', 'multiple_choice', 'free_text']),
  options: z.array(optionSchema),
}).superRefine((val, ctx) => {
  if (val.question_type === 'free_text') {
    // для свободного текста варианты не требуются
    return
  }
  if (!val.options || val.options.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Минимум 2 варианта', path: ['options'] })
  }
})

const testSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive('> 0'),
  passing_score_percent: z.coerce.number().int().min(0).max(100),
  max_focus_losses: z.coerce.number().int().min(0),
  purpose: z.enum(['entry','promotion','qualification']).optional(),
  target_department_id: z.string().uuid('Неверный UUID департамента').optional().nullable(),
  target_rank_id: z.string().uuid('Неверный UUID звания').optional().nullable(),
  target_qualification_id: z.string().uuid('Неверный UUID квалификации').optional().nullable(),
  questions: z.array(questionSchema).default([]),
})

type TestFormValues = z.infer<typeof testSchema>

type OptionPath = `questions.${number}.options`;

export default function AdminTestNewPage() {
  const navigate = useNavigate()
  const { session, isLoading } = useSession()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: '',
      description: '',
      duration_minutes: 20,
      passing_score_percent: 70,
      max_focus_losses: 0,
      questions: [],
    },
  })

  const questionsFA = useFieldArray({ control, name: 'questions' })

  // Dictionaries
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: getPublicDepartments, staleTime: 300_000 })
  const purpose = useWatch({ control, name: 'purpose' as const })
  const targetDepartmentId = useWatch({ control, name: 'target_department_id' as const })
  const { data: ranks } = useQuery({
    queryKey: ['ranks', targetDepartmentId],
    queryFn: () => listRanks(targetDepartmentId || undefined),
    enabled: !!targetDepartmentId,
    staleTime: 300_000,
  })
  const { data: qualifications } = useQuery({
    queryKey: ['qualifications', targetDepartmentId],
    queryFn: () => listQualifications(targetDepartmentId || undefined),
    enabled: !!targetDepartmentId,
    staleTime: 300_000,
  })

  // Вложенный редактор вопроса с собственным useFieldArray для опций
  function QuestionItem({ qIndex, fieldId }: { qIndex: number; fieldId: string }) {
    const optionsFA = useFieldArray({ control, name: `questions.${qIndex}.options` as const })

    const onToggleCorrectLocal = (oIndex: number, newVal: boolean) => {
      const type = useWatch({ control, name: `questions.${qIndex}.question_type` as const })
      if (type === 'single_choice' && newVal) {
        const options = useWatch({ control, name: `questions.${qIndex}.options` as const }) || []
        options.forEach((_: any, idx: number) => {
          setValue(`questions.${qIndex}.options.${idx}.is_correct` as const, idx === oIndex, { shouldDirty: true })
        })
      } else {
        setValue(`questions.${qIndex}.options.${oIndex}.is_correct` as const, newVal, { shouldDirty: true })
      }
    }

    const qType = useWatch({ control, name: `questions.${qIndex}.question_type` as const })

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Вопрос #{qIndex + 1}</CardTitle>
          <div className="flex gap-2">
            <Button variant="destructive" type="button" onClick={() => questionsFA.remove(qIndex)}>
              Удалить вопрос
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Controller
              control={control}
              name={`questions.${qIndex}.question_text` as const}
              render={({ field }) => (
                <Input placeholder="Текст вопроса" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            {errors.questions?.[qIndex]?.question_text && (
              <p className="text-destructive text-sm">{errors.questions?.[qIndex]?.question_text?.message as string}</p>
            )}

            <div>
              <label className="text-sm text-muted-foreground">Тип вопроса</label>
              <Controller
                control={control}
                name={`questions.${qIndex}.question_type` as const}
                render={({ field: ctrl }) => (
                  <Select
                    value={ctrl.value}
                    onValueChange={(v) => {
                      ctrl.onChange(v)
                      if (v === 'single_choice') {
                        while (optionsFA.fields.length < 2) {
                          optionsFA.append({ option_text: '', is_correct: false })
                        }
                        for (let idx = 0; idx < optionsFA.fields.length; idx++) {
                          setValue(`questions.${qIndex}.options.${idx}.is_correct` as const, idx === 0, { shouldDirty: true })
                        }
                      } else if (v === 'multiple_choice') {
                        while (optionsFA.fields.length < 2) {
                          optionsFA.append({ option_text: '', is_correct: false })
                        }
                      } else if (v === 'free_text') {
                        for (let i = optionsFA.fields.length - 1; i >= 0; i--) {
                          optionsFA.remove(i)
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_choice">Один вариант</SelectItem>
                      <SelectItem value="multiple_choice">Несколько вариантов</SelectItem>
                      <SelectItem value="free_text">Свободный текст</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {qType === 'free_text' ? (
              <div className="text-sm text-muted-foreground">Для типа "Свободный текст" варианты ответов не требуются.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Варианты ответа</h4>
                  <Button type="button" variant="outline" onClick={() => optionsFA.append({ option_text: '', is_correct: false })}>
                    Добавить вариант
                  </Button>
                </div>

                {optionsFA.fields.map((opt, oIndex) => {
                  const isSingle = qType === 'single_choice'
                  return (
                    <div key={opt.id} className="flex items-center gap-3">
                      <Controller
                        control={control}
                        name={`questions.${qIndex}.options.${oIndex}.option_text` as const}
                        render={({ field }) => (
                          <Input className="flex-1" placeholder={`Вариант #${oIndex + 1}`} value={field.value || ''} onChange={field.onChange} />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`questions.${qIndex}.options.${oIndex}.is_correct` as const}
                        render={({ field }) => (
                          <input
                            name={isSingle ? `q${qIndex}-correct` : undefined}
                            type={isSingle ? 'radio' : 'checkbox'}
                            checked={!!field.value}
                            onChange={(e) => {
                              const newVal = e.target.checked
                              if (isSingle && newVal) {
                                const opts = optionsFA.fields
                                for (let i = 0; i < opts.length; i++) {
                                  if (i !== oIndex) {
                                    setValue(`questions.${qIndex}.options.${i}.is_correct` as const, false, { shouldDirty: true })
                                  }
                                }
                                field.onChange(true)
                              } else {
                                field.onChange(newVal)
                              }
                            }}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => optionsFA.remove(oIndex)}
                      >
                        Удалить
                      </Button>
                    </div>
                  )
                })}

                {errors.questions?.[qIndex]?.options && (
                  <p className="text-destructive text-sm">Минимум 2 варианта</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const createMutation = useMutation({
    mutationFn: (dto: CreateTestDto) => createTest(dto),
  })

  const onSubmit = handleSubmit(async (values) => {
    // Валидация правильных ответов
    for (const q of values.questions) {
      if (q.question_type === 'free_text') continue
      const correctCount = q.options.filter(o => !!o.is_correct).length
      if (q.question_type === 'single_choice' && correctCount !== 1) {
        throw new Error(`В вопросе "${q.question_text}" должен быть отмечен ровно один правильный вариант`)
      }
      if (q.question_type === 'multiple_choice' && correctCount < 1) {
        throw new Error(`В вопросе "${q.question_text}" должен быть отмечен минимум один правильный вариант`)
      }
    }

    const { questions, ...testDto } = values
    const created = await createMutation.mutateAsync(testDto)
    const testId: string | undefined = (created as any)?.id || (created as any)?.data?.id
    if (!testId) {
      console.error('[CreateTest] Unexpected createTest response shape:', created)
      throw new Error('Не удалось получить идентификатор теста из ответа сервера')
    }

    // Последовательно создаём вопросы и их варианты
    for (const q of questions) {
      const createdQuestion = await createQuestion(testId, {
        question_text: q.question_text,
        question_type: q.question_type,
      })
      const questionId: string | undefined = (createdQuestion as any)?.id || (createdQuestion as any)?.data?.id
      if (!questionId) {
        console.error('[CreateTest] Unexpected createQuestion response shape:', createdQuestion)
        throw new Error('Не удалось получить идентификатор вопроса из ответа сервера')
      }
      if (q.question_type !== 'free_text') {
        for (const opt of q.options) {
          await addOption(questionId, {
            option_text: opt.option_text,
            is_correct: !!opt.is_correct,
          })
        }
      }
    }

    navigate(`/admin/tests/${testId}/edit`)
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        Загрузка...
      </div>
    )
  }

  if (!session?.permissions?.includes('tests.manage')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <form className="container mx-auto p-6 space-y-6" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Создание теста</h1>
          <p className="text-muted-foreground">Заполните свойства теста, добавьте вопросы и варианты</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/tests')}>Назад к списку</Button>
          <Button type="submit" disabled={isSubmitting}>Сохранить</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Свойства теста</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input placeholder="Название" {...register('title')} />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            <Textarea placeholder="Описание" {...register('description')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Длительность (мин)</label>
                <Input type="number" {...register('duration_minutes')} />
                <p className="text-xs text-muted-foreground mt-1">Сколько минут даётся на прохождение теста</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Проходной %</label>
                <Input type="number" {...register('passing_score_percent')} />
                <p className="text-xs text-muted-foreground mt-1">Минимальный процент правильных ответов для зачёта</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Макс. потерь фокуса</label>
                <Input type="number" {...register('max_focus_losses')} />
                <p className="text-xs text-muted-foreground mt-1">Сколько раз можно потерять фокус окна (0 — без потерь)</p>
              </div>
            </div>

            {/* Context selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Назначение теста</label>
                <Controller
                  control={control}
                  name={'purpose' as const}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите назначение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Вступительный</SelectItem>
                        <SelectItem value="promotion">Повышение</SelectItem>
                        <SelectItem value="qualification">Квалификация</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Департамент</label>
                <Controller
                  control={control}
                  name={'target_department_id' as const}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Не выбрано" />
                      </SelectTrigger>
                      <SelectContent>
                        {(departments || []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* spacer */}
              <div />
            </div>

            {purpose === 'promotion' && (
              <div>
                <label className="text-sm text-muted-foreground">Звание (для повышения)</label>
                <Controller
                  control={control}
                  name={'target_rank_id' as const}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Не выбрано" />
                      </SelectTrigger>
                      <SelectContent>
                        {(ranks || []).map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {purpose === 'qualification' && (
              <div>
                <label className="text-sm text-muted-foreground">Квалификация</label>
                <Controller
                  control={control}
                  name={'target_qualification_id' as const}
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Не выбрано" />
                      </SelectTrigger>
                      <SelectContent>
                        {(qualifications || []).map((q) => (
                          <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Вопросы</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() =>
                questionsFA.append({
                  question_text: '',
                  question_type: 'single_choice',
                  options: [
                    { option_text: '', is_correct: true },
                    { option_text: '', is_correct: false },
                  ],
                })
              }
            >
              Добавить вопрос
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questionsFA.fields.length === 0 && (
              <div className="text-sm text-muted-foreground">Вопросы пока не добавлены</div>
            )}

            {questionsFA.fields.map((field, qIndex) => (
              <QuestionItem key={field.id} fieldId={field.id} qIndex={qIndex} />
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
