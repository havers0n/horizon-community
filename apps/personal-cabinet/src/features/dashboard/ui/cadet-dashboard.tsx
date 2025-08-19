import React from 'react'
import { Card, CardContent } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Link } from 'react-router-dom'
import { apiClient } from '@/shared/api/api-client'
import { useSession } from '@/shared/contexts/SessionContext'
import { toast } from 'sonner'
import { Progress } from '@/shared/ui/progress'

export type CadetTrack = {
  id?: string
  application_id?: string | null
  department_id?: string | null
  stage_code?: 'cadet_test' | 'cadet_training' | 'cadet_practice' | null | string
  is_active?: boolean
  [key: string]: any
}

type StageCode = 'cadet_test' | 'cadet_training' | 'cadet_practice' | null

export function CadetDashboard({ track }: { track: CadetTrack }) {
  const allowedStages: Exclude<StageCode, null>[] = ['cadet_test', 'cadet_training', 'cadet_practice']
  const current: StageCode = allowedStages.includes(track?.stage_code as any)
    ? (track.stage_code as StageCode)
    : 'cadet_test'
  const stages: { code: Exclude<StageCode, null>; title: string }[] = [
    { code: 'cadet_test', title: 'Тест' },
    { code: 'cadet_training', title: 'Тренировки' },
    { code: 'cadet_practice', title: 'Практика' },
  ]

  const currentIndex = Math.max(0, stages.findIndex(s => s.code === current))

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-100">Путь кадета</h2>
          <p className="text-gray-400 mt-1">Пройдите шаги по очереди. Прогресс обновляется автоматически.</p>
        </div>

        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => {
            const isDone = idx < currentIndex
            const isActive = idx === currentIndex
            const baseCircle = 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold'
            const baseLine = 'flex-1 h-1 mx-2'
            const circleClass = isActive
              ? 'bg-blue-600 text-white'
              : isDone
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-300'
            const lineClass = idx < stages.length - 1
              ? (idx < currentIndex ? 'bg-emerald-600' : 'bg-gray-700')
              : ''
            return (
              <div key={stage.code} className="flex items-center w-full">
                <div className={`${baseCircle} ${circleClass}`} aria-current={isActive ? 'step' : undefined}>
                  {idx + 1}
                </div>
                <div className={`${baseLine} ${lineClass}`} aria-hidden />
                <div className="sr-only">{stage.title}</div>
              </div>
            )
          })}
        </div>

        <div>
          {current === 'cadet_test' && <CadetTestBlock applicationId={track?.application_id} />}
          {current === 'cadet_training' && <CadetTrainingBlock />}
          {current === 'cadet_practice' && <CadetPracticeBlock />}
        </div>
      </CardContent>
    </Card>
  )
}

function CadetTestBlock({ applicationId }: { applicationId?: string | null }) {
  const [open, setOpen] = React.useState(false)
  const disabled = !applicationId
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-100">Вступительный тест</h3>
      <p className="text-gray-300">Пройдите вступительный тест, чтобы перейти к тренировкам. Тест ограничен по времени и требует внимательности.</p>
      <div className="flex gap-4 items-center">
        <Link to="/support" className="text-primary hover:underline">Документация по тесту</Link>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)} disabled={disabled}>
              {disabled ? 'Заявка не найдена' : 'Начать Вступительный Тест'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Вступительный тест</DialogTitle>
            </DialogHeader>
            {applicationId ? (
              <TestTakingModal applicationId={applicationId} onClose={() => setOpen(false)} />
            ) : (
              <div className="text-gray-400">Не удалось найти связанную заявку. Обратитесь в поддержку.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function CadetTrainingBlock() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-100">Тренировки</h3>
      <p className="text-gray-300">Поздравляем с успешной сдачей теста! Ниже появится ваше расписание тренировок, когда тренер его утвердит.</p>
      <div className="rounded-lg border border-gray-700 p-4 text-gray-400">Расписание тренировок появится здесь</div>
    </div>
  )
}

function CadetPracticeBlock() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-100">Практика</h3>
      <p className="text-gray-300">Добро пожаловать на практику. Ваш наставник свяжется с вами для первичного инструктажа.</p>
      <div className="rounded-lg border border-gray-700 p-4 text-gray-400">Информация о наставнике появится здесь</div>
    </div>
  )
}

type StartedSession = { sessionId: string; questions: Question[]; startTime: string; timeLimit?: number }
type Question = { id: string; question: string; type: string; options?: string[] }

type TestTakingModalProps = { applicationId: string; onClose: () => void }

function TestTakingModal({ applicationId, onClose }: TestTakingModalProps) {
  const { refetch } = useSession()
  const [loading, setLoading] = React.useState(false)
  const [phase, setPhase] = React.useState<'in_progress' | 'result'>('in_progress')
  const [session, setSession] = React.useState<StartedSession | null>(null)
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({})
  const [result, setResult] = React.useState<{ passed: boolean; percentage?: number } | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState<number>(0)
  const [remaining, setRemaining] = React.useState<number | null>(null)

  // Автостарт при открытии модалки
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiClient.post<{ success: boolean; data: StartedSession }>(`/applications/${applicationId}/test-session`, {} as any)
        const data = (res as any)?.data ?? res
        if (mounted && data) {
          setSession(data)
          setPhase('in_progress')
          setAnswers({})
          setCurrentIndex(0)
        }
      } catch (e: any) {
        toast.error(e?.message || 'Не удалось начать тестовую сессию')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [applicationId])

  // Таймер обратного отсчёта
  React.useEffect(() => {
    if (phase !== 'in_progress' || !session?.timeLimit) {
      setRemaining(null)
      return
    }
    const startMs = new Date(session.startTime).getTime()
    const endMs = startMs + session.timeLimit * 1000
    const tick = () => {
      const now = Date.now()
      const left = Math.max(0, Math.floor((endMs - now) / 1000))
      setRemaining(left)
      if (left <= 0) {
        // Автоподача при окончании времени
        submit()
      }
    }
    tick()
    const timerId = window.setInterval(tick, 1000)
    return () => window.clearInterval(timerId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session?.sessionId])

  // Anti-cheat: фиксация потери фокуса
  React.useEffect(() => {
    if (phase !== 'in_progress' || !session?.sessionId) return
    const handler = async () => {
      try {
        await apiClient.post(`/test-sessions/${session.sessionId}/focus-loss`, { at: new Date().toISOString() } as any)
        toast.message('Внимание', { description: 'Обнаружена потеря фокуса окна. Это фиксируется системой.' })
      } catch {}
    }
    const onVisibility = () => { if (document.hidden) handler() }
    window.addEventListener('blur', handler)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', handler)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [phase, session?.sessionId])

  const submit = async () => {
    if (!session?.sessionId) return
    try {
      setLoading(true)
      const payload = { answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })) }
      const res = await apiClient.post<{ success: boolean; data: { passed: boolean; percentage?: number } }>(`/test-sessions/${session.sessionId}/submit`, payload as any)
      const data = (res as any)?.data ?? res
      const passed = !!data?.passed
      setResult({ passed, percentage: data?.percentage })
      setPhase('result')
      if (passed) {
        toast.success('Поздравляем! Тест пройден. Переходим к тренировкам.')
        await refetch()
        onClose()
      } else {
        toast.message('Тест не пройден', { description: 'Вы можете попробовать снова, когда будет доступно.' })
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка при отправке ответов')
    } finally {
      setLoading(false)
    }
  }

  const setAnswer = (q: Question, value: string) => {
    setAnswers(prev => {
      if (String(q.type).toLowerCase().includes('multiple')) {
        const arr = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : []
        return { ...prev, [q.id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
      }
      return { ...prev, [q.id]: value }
    })
  }

  const nextQuestion = () => {
    if (!session) return
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }
  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {phase === 'in_progress' && session && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>Сессия: {session.sessionId}</div>
            {typeof remaining === 'number' && (
              <div className="font-mono text-gray-200">⏱ {formatTime(remaining)}</div>
            )}
          </div>
          <Progress value={((currentIndex) / session.questions.length) * 100} className="h-2" />
          <div className="rounded-md border border-gray-700 p-3">
            {(() => {
              const q = session.questions[currentIndex]
              return (
                <>
                  <div className="text-gray-100 font-medium mb-2">{currentIndex + 1}. {q.question}</div>
                  <div className="space-y-1">
                    {(q.options || []).map(opt => {
                      const isMultiple = String(q.type).toLowerCase().includes('multiple')
                      const name = `q_${q.id}`
                      const checked = isMultiple
                        ? Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
                        : answers[q.id] === opt
                      return (
                        <label key={opt} className="flex items-center gap-2 text-gray-200">
                          <input
                            type={isMultiple ? 'checkbox' : 'radio'}
                            name={name}
                            value={opt}
                            checked={checked}
                            onChange={() => setAnswer(q, opt)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={prevQuestion} disabled={loading || currentIndex === 0}>Назад</Button>
            {currentIndex < (session.questions.length - 1) ? (
              <Button onClick={nextQuestion} disabled={loading}>Далее</Button>
            ) : (
              <Button onClick={submit} disabled={loading}>Отправить ответы</Button>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="space-y-2">
          <div className="text-gray-100 text-lg font-semibold">Результат</div>
          <div className="text-gray-300">{result.passed ? 'Тест пройден ✅' : 'Тест не пройден'}</div>
          {typeof result.percentage === 'number' && (
            <div className="text-gray-400 text-sm">Процент: {result.percentage}%</div>
          )}
          <div className="flex justify-end">
            <Button onClick={onClose}>Закрыть</Button>
          </div>
        </div>
      )}
    </div>
  )
}


