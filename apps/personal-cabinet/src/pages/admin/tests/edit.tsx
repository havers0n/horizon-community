import React, { useMemo, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getTest,
  updateTest,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
  type AdminTest,
  type AdminQuestion,
  type AdminQuestionOption,
  type CreateOptionDto,
  type CreateQuestionDto,
  deleteTest,
  listDepartments,
  listRanks,
  listQualifications,
} from '@/features/admin/tests/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useSession } from '@/shared/contexts/SessionContext'

// -------- Test Form --------
const testSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive('> 0'),
  passing_score_percent: z.coerce.number().int().min(0).max(100),
  max_focus_losses: z.coerce.number().int().min(0),
  // purpose неизменяем — не валидируем его здесь
  target: z.union([
    z.object({ department_id: z.string().uuid() }),
    z.object({ rank_id: z.string().uuid() }),
    z.object({ qualification_id: z.string().uuid() }),
  ]).optional(),
})

type TestFormValues = z.infer<typeof testSchema>

function TestForm({ test, onSubmit }: { test: AdminTest, onSubmit: (values: TestFormValues) => Promise<any> }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: test.title,
      description: test.description || '',
      duration_minutes: test.duration_minutes,
      passing_score_percent: test.passing_score_percent,
      max_focus_losses: test.max_focus_losses,
    },
  })

  React.useEffect(() => {
    reset({
      title: test.title,
      description: test.description || '',
      duration_minutes: test.duration_minutes,
      passing_score_percent: test.passing_score_percent,
      max_focus_losses: test.max_focus_losses,
    })
  }, [test, reset])

  const purpose = (test.purpose || '').toUpperCase()

  // словари
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments, staleTime: 300_000 })
  const { data: ranks } = useQuery({
    queryKey: ['ranks', test.target_department_id],
    queryFn: () => listRanks((test as any).target_department_id || undefined),
    enabled: purpose === 'PROMOTION',
  })
  const { data: qualifications } = useQuery({
    queryKey: ['qualifications', test.target_department_id],
    queryFn: () => listQualifications((test as any).target_department_id || undefined),
    enabled: purpose === 'QUALIFICATION',
  })

  return (
    <form onSubmit={handleSubmit(async (v) => { await onSubmit(v) })} className="space-y-3">
      <div className="grid gap-3">
        <Input placeholder="Название" {...register('title')} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>
      <Textarea placeholder="Описание" {...register('description')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Длительность (мин)</label>
          <Input type="number" {...register('duration_minutes')} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Проходной %</label>
          <Input type="number" {...register('passing_score_percent')} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Макс. потерь фокуса</label>
          <Input type="number" {...register('max_focus_losses')} />
        </div>
      </div>

      {/* Purpose — только просмотр */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Назначение теста</label>
          <Input readOnly value={purpose} />
        </div>
      </div>

      {/* Target — редактируем в рамках текущего purpose */}
      {purpose === 'ENTRY' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Департамент</label>
            <Controller
              control={control}
              name={'target' as const}
              render={({ field }) => (
                <Select
                  value={(field.value as any)?.department_id || (test as any).target_department_id || undefined}
                  onValueChange={(v) => field.onChange({ department_id: v })}
                >
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
        </div>
      )}

      {purpose === 'PROMOTION' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Звание</label>
            <Controller
              control={control}
              name={'target' as const}
              render={({ field }) => (
                <Select
                  value={(field.value as any)?.rank_id || (test as any).target_rank_id || undefined}
                  onValueChange={(v) => field.onChange({ rank_id: v })}
                >
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
        </div>
      )}

      {purpose === 'QUALIFICATION' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Квалификация</label>
            <Controller
              control={control}
              name={'target' as const}
              render={({ field }) => (
                <Select
                  value={(field.value as any)?.qualification_id || (test as any).target_qualification_id || undefined}
                  onValueChange={(v) => field.onChange({ qualification_id: v })}
                >
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
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>Сохранить</Button>
      </div>
    </form>
  )
}

// -------- Question Form --------
const questionSchema = z.object({
  question_text: z.string().min(1, 'Обязательное поле'),
  question_type: z.enum(['single_choice', 'multiple_choice']),
})

type QuestionFormValues = z.infer<typeof questionSchema>

function QuestionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<QuestionFormValues>
  onSubmit: (values: QuestionFormValues) => Promise<any>
  onCancel?: () => void
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: initial?.question_text || '',
      question_type: (initial?.question_type as any) || 'single_choice',
    },
  })

  return (
    <form onSubmit={handleSubmit(async (v) => { await onSubmit(v) })} className="space-y-3">
      <Input placeholder="Текст вопроса" {...register('question_text')} />
      {errors.question_text && <p className="text-destructive text-sm">{errors.question_text.message}</p>}

      <div>
        <label className="text-sm text-muted-foreground">Тип вопроса</label>
        <Select defaultValue={(initial?.question_type as any) || 'single_choice'} onValueChange={(val) => setValue('question_type', val as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">Один вариант</SelectItem>
            <SelectItem value="multiple_choice">Несколько вариантов</SelectItem>
          </SelectContent>
        </Select>
        {errors.question_type && <p className="text-destructive text-sm">{errors.question_type.message}</p>}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>Сохранить вопрос</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>}
      </div>
    </form>
  )
}

// -------- Options Editor --------
function OptionsEditor({ question, testId }: { question: AdminQuestion, testId: string }) {
  const queryClient = useQueryClient()
  const [newOptionText, setNewOptionText] = useState('')
  const [newOptionCorrect, setNewOptionCorrect] = useState(false)

  const addOptionMutation = useMutation({
    mutationFn: (dto: CreateOptionDto) => addOption(question.id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] }),
  })

  const updateOptionMutation = useMutation({
    mutationFn: ({ optionId, dto }: { optionId: string, dto: Partial<CreateOptionDto> }) => updateOption(optionId, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] }),
  })

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: string) => deleteOption(optionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] }),
  })

  const handleToggleCorrect = async (opt: AdminQuestionOption, newValue: boolean) => {
    if (question.question_type === 'single_choice' && newValue) {
      const others = question.options.filter(o => o.id !== opt.id && o.is_correct)
      await Promise.all(others.map(o => updateOptionMutation.mutateAsync({ optionId: o.id, dto: { is_correct: false } })))
    }
    await updateOptionMutation.mutateAsync({ optionId: opt.id, dto: { is_correct: newValue } })
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ответ</TableHead>
            <TableHead>Правильный</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {question.options.map((opt) => (
            <TableRow key={opt.id}>
              <TableCell>
                <Input
                  defaultValue={opt.option_text}
                  onBlur={(e) => updateOptionMutation.mutate({ optionId: opt.id, dto: { option_text: e.target.value } })}
                />
              </TableCell>
              <TableCell className="w-[140px]">
                <div className="flex items-center gap-2">
                  <input
                    type={question.question_type === 'single_choice' ? 'radio' : 'checkbox'}
                    checked={!!opt.is_correct}
                    onChange={(e) => handleToggleCorrect(opt, e.target.checked)}
                  />
                </div>
              </TableCell>
              <TableCell className="w-[160px]">
                <Button variant="destructive" size="sm" onClick={() => deleteOptionMutation.mutate(opt.id)}>Удалить</Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <Input placeholder="Новый вариант ответа" value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <input
                  type={question.question_type === 'single_choice' ? 'radio' : 'checkbox'}
                  checked={newOptionCorrect}
                  onChange={(e) => setNewOptionCorrect(e.target.checked)}
                />
              </div>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={async () => {
                  if (!newOptionText.trim()) return
                  if (question.question_type === 'single_choice' && newOptionCorrect) {
                    const others = question.options.filter(o => o.is_correct)
                    await Promise.all(others.map(o => updateOptionMutation.mutateAsync({ optionId: o.id, dto: { is_correct: false } })))
                  }
                  await addOptionMutation.mutateAsync({ option_text: newOptionText, is_correct: newOptionCorrect })
                  setNewOptionText('')
                  setNewOptionCorrect(false)
                }}
              >Добавить</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

// -------- Questions Manager --------
function QuestionsManager({ testId }: { testId: string }) {
  const queryClient = useQueryClient()
  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-test-questions', testId],
    queryFn: () => listQuestions(testId),
    staleTime: 30_000,
  })

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (dto: CreateQuestionDto) => createQuestion(testId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] })
      setIsCreating(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: Partial<CreateQuestionDto> }) => updateQuestion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-test-questions', testId] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Вопросы</h3>
        <Button onClick={() => setIsCreating((v) => !v)}>{isCreating ? 'Скрыть' : 'Добавить вопрос'}</Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Новый вопрос</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionForm onSubmit={(v) => createMutation.mutateAsync(v)} onCancel={() => setIsCreating(false)} />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div>Загрузка вопросов...</div>
      ) : (
        <div className="space-y-4">
          {questions?.map((q) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{q.question_text}</CardTitle>
                  <CardDescription>
                    {q.question_type === 'single_choice' ? 'Один вариант' : 'Несколько вариантов'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingId(editingId === q.id ? null : q.id)}>
                    {editingId === q.id ? 'Свернуть' : 'Редактировать'}
                  </Button>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate(q.id)}>Удалить</Button>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === q.id ? (
                  <div className="space-y-6">
                    <QuestionForm
                      initial={{ question_text: q.question_text, question_type: q.question_type as any }}
                      onSubmit={(v) => updateMutation.mutateAsync({ id: q.id, dto: v })}
                      onCancel={() => setEditingId(null)}
                    />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Варианты ответа</h4>
                      <OptionsEditor question={q} testId={testId} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Варианты ответа</h4>
                    <OptionsEditor question={q} testId={testId} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// -------- Page --------
export default function AdminTestEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session, isLoading: isSessionLoading } = useSession()

  const testId = useMemo(() => id as string, [id])

  const { data: test, isLoading } = useQuery({
    queryKey: ['admin-test', testId],
    queryFn: () => getTest(testId),
    enabled: !!testId,
    staleTime: 60_000,
  })

  const updateMutation = useMutation({
    mutationFn: (dto: TestFormValues) => updateTest(testId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test', testId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTest(testId),
    onSuccess: () => {
      queryClient.setQueryData<AdminTest[] | undefined>(['admin-tests'], (old) =>
        Array.isArray(old) ? old.filter((t) => t.id !== testId) : old
      )
      queryClient.removeQueries({ queryKey: ['admin-test', testId] })
      queryClient.removeQueries({ queryKey: ['admin-test-questions', testId] })
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
      navigate('/admin/tests')
    },
  })

  if (!testId) return <div>Некорректный идентификатор теста</div>

  if (isSessionLoading) {
    return <div className="container mx-auto p-6">Загрузка...</div>
  }
  if (!session?.permissions?.includes('tests.manage')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Редактирование теста</h1>
          <p className="text-muted-foreground">Управление свойствами теста, вопросами и ответами</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/tests')}>Назад к списку</Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!confirm('Удалить тест? Действие необратимо.')) return
              deleteMutation.mutate()
            }}
            disabled={deleteMutation.isPending}
          >
            Удалить тест
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Свойства теста</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !test ? (
            <div>Загрузка...</div>
          ) : (
            <TestForm test={test} onSubmit={(v) => updateMutation.mutateAsync(v)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Вопросы и ответы</CardTitle>
          <CardDescription>Добавляйте вопросы и управляйте вариантами ответов</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionsManager testId={testId} />
        </CardContent>
      </Card>
    </div>
  )
}
