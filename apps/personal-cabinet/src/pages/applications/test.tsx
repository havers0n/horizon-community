import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { startTestSession, reportFocusLoss, submitTestSession, type StartSessionResponse } from '@/shared/api/test-sessions-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { useToast } from '@/shared/lib/use-toast'

export default function ApplicationTestPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation() as any
  const { toast } = useToast()

  const [session, setSession] = React.useState<StartSessionResponse | null>(null)
  const [answers, setAnswers] = React.useState<Record<string, string[]>>({})
  const [remainingSec, setRemainingSec] = React.useState<number>(0)
  const [focusLocked, setFocusLocked] = React.useState(false)
  const [focusLosses, setFocusLosses] = React.useState<number>(0)
  const [results, setResults] = React.useState<{ passed: boolean; score: number } | null>(null)

  const startMutation = useMutation({
    mutationFn: startTestSession,
    onSuccess: (data) => {
      setSession(data)
      setRemainingSec(data.duration_minutes * 60)
      setFocusLosses(0)
    },
  })

  const focusLossMutation = useMutation({
    mutationFn: (sessionId: string) => reportFocusLoss(sessionId),
    onSuccess: () => {
      setFocusLosses((n) => n + 1)
      toast({ title: 'Потеря фокуса', description: 'Вы покинули вкладку. Это нарушение правил прохождения теста.', variant: 'destructive' })
    },
    onError: () => {
      setFocusLocked(true)
      toast({ title: 'Тест аннулирован', description: 'Нарушение правил. Сессия завершена.', variant: 'destructive' })
    }
  })

  const submitMutation = useMutation({
    mutationFn: (payload: { sessionId: string, answers: Record<string, string[]> }) =>
      submitTestSession(payload.sessionId, { answers: Object.entries(payload.answers).map(([questionId, selected]) => ({ questionId, selectedOptionIds: selected })) }),
    onSuccess: (res) => {
      setResults(res)
    }
  })

  React.useEffect(() => {
    if (!applicationId) return
    const testId = location?.state?.testId as string | undefined
    startMutation.mutate({ applicationId, testId })
  }, [applicationId])

  React.useEffect(() => {
    if (!session || focusLocked || results) return
    const interval = setInterval(() => setRemainingSec((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(interval)
  }, [session, focusLocked, results])

  React.useEffect(() => {
    if (!session || results) return
    if (remainingSec === 0 && !focusLocked) {
      submitMutation.mutate({ sessionId: session.sessionId, answers })
    }
  }, [remainingSec, session, results])

  React.useEffect(() => {
    const onBlur = () => {
      if (session && !focusLocked && !results) {
        focusLossMutation.mutate(session.sessionId)
      }
    }
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [session, focusLocked, results])

  React.useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (session && !focusLocked && !results) {
        e.preventDefault()
        e.returnValue = 'Вы уверены, что хотите покинуть страницу? Прогресс теста будет потерян.'
        return e.returnValue
      }
      return undefined
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [session, focusLocked, results])

  const toggleAnswer = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || []
      let next: string[]
      if (isMultiple) {
        next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
      } else {
        next = current.includes(optionId) ? [] : [optionId]
      }
      return { ...prev, [questionId]: next }
    })
  }

  const handleSubmit = () => {
    if (!session) return
    submitMutation.mutate({ sessionId: session.sessionId, answers })
  }

  const totalSec = session ? session.duration_minutes * 60 : 0
  const progress = totalSec > 0 ? ((totalSec - remainingSec) / totalSec) * 100 : 0
  const remainingFocusAllowed = session ? Math.max(0, session.max_focus_losses - focusLosses) : 0

  if (results && session) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Результаты теста</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={results.passed ? 'text-green-600 font-semibold' : 'text-destructive font-semibold'}>
              {results.passed ? 'Поздравляем, вы прошли тест!' : 'К сожалению, вы не прошли тест.'}
            </div>
            <div>Ваш результат: <span className="font-mono">{results.score}%</span></div>
            <div>Проходной балл: <span className="font-mono">{session.passing_score_percent}%</span></div>
            <div className="pt-2">
              <Button onClick={() => navigate('/applications')}>Вернуться к заявкам</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Прохождение теста</h1>
          {session && (
            <div className="text-sm text-muted-foreground">
              Нарушений фокуса: {focusLosses} / {session.max_focus_losses} ({remainingFocusAllowed} осталось)
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Оставшееся время</div>
          <div className="text-xl font-mono">{Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}</div>
        </div>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle>Вопросы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!session ? (
            <div>Инициализация сессии...</div>
          ) : focusLocked ? (
            <div className="text-destructive">Сессия аннулирована из-за нарушения правил. Обратитесь к администратору.</div>
          ) : (
            session.questions.map((q, idx) => (
              <div key={q.id} className="space-y-2">
                <div className="font-medium">{idx + 1}. {q.question_text}</div>
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2">
                      <input
                        type={q.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                        name={q.id}
                        checked={(answers[q.id] || []).includes(opt.id)}
                        onChange={() => toggleAnswer(q.id, opt.id, q.question_type === 'multiple_choice')}
                      />
                      <span>{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={!session || focusLocked}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={!session || focusLocked}>Отправить</Button>
      </div>
    </div>
  )
}
