import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui'
import { Progress } from '@/shared/ui/progress'
import { toast } from 'sonner'

type Option = { id: string; option_text: string }
type Question = { id: string; question_text: string; question_type: string; test_question_options?: Option[] }

const TestSessionPage: React.FC = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['test-session', sessionId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/test-sessions/${sessionId}`)
      return (res as any)?.data ?? res
    },
    enabled: !!sessionId,
    staleTime: 30_000,
  })

  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({})
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const submitMutation = useMutation({
    mutationFn: async (payload: { answers: { questionId: string; answer: any }[] }) => {
      const res = await apiClient.post<any>(`/test-sessions/${sessionId}/submit`, payload as any)
      return (res as any)?.data ?? res
    },
    onSuccess: async (r: any) => {
      const passed = !!r?.passed
      if (passed) {
        toast.success('Поздравляем! Тест пройден.')
        navigate('/cadet/training')
      } else {
        toast.message('Тест не пройден', { description: 'Вы можете попробовать снова, когда будет доступно.' })
      }
    },
    onError: (e: any) => {
      toast.error(e?.message || 'Ошибка при отправке ответов')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-red-400">{(error as any)?.message || 'Ошибка загрузки сессии'}</div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => refetch()}>Повторить</Button>
        </div>
      </div>
    )
  }

  const session = data
  const test = session?.tests
  const questions: Question[] = (test?.test_questions || [])
  const total = questions.length
  const current = questions[currentIndex]

  const setAnswer = (q: Question, value: string) => {
    setAnswers(prev => {
      const type = String(q.question_type || '').toLowerCase()
      if (type.includes('multiple')) {
        const arr = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : []
        return { ...prev, [q.id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
      }
      return { ...prev, [q.id]: value }
    })
  }

  const submit = async () => {
    const payload = { answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) }
    await submitMutation.mutateAsync(payload)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{test?.title || 'Тест'}</h1>
        {typeof test?.duration_minutes === 'number' && test.duration_minutes > 0 && (
          <div className="text-sm text-gray-300">Ограничение: {test.duration_minutes} мин.</div>
        )}
      </div>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>Сессия: {session?.id}</div>
            <div>Вопрос {currentIndex + 1} из {total}</div>
          </div>
          <Progress value={(total ? (currentIndex) / total : 0) * 100} className="h-2" />
          {current ? (
            <div className="rounded-md border border-gray-700 p-3">
              <div className="text-gray-100 font-medium mb-2">{currentIndex + 1}. {current.question_text}</div>
              <div className="space-y-1">
                {(current.test_question_options || []).map(opt => {
                  const isMultiple = String(current.question_type || '').toLowerCase().includes('multiple')
                  const name = `q_${current.id}`
                  const checked = isMultiple
                    ? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(opt.option_text)
                    : answers[current.id] === opt.option_text
                  return (
                    <label key={opt.id} className="flex items-center gap-2 text-gray-200">
                      <input
                        type={isMultiple ? 'checkbox' : 'radio'}
                        name={name}
                        value={opt.option_text}
                        checked={checked}
                        onChange={() => setAnswer(current, opt.option_text)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">{opt.option_text}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Нет доступных вопросов</div>
          )}
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} disabled={currentIndex === 0}>Назад</Button>
            {currentIndex < (total - 1) ? (
              <Button onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))}>Далее</Button>
            ) : (
              <Button onClick={submit} disabled={submitMutation.isPending}>Отправить ответы</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestSessionPage



