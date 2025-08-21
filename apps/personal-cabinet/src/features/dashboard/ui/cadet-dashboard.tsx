import React from 'react'
import { Card, CardContent } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/api-client'
import { toast } from 'sonner'

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
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const disabled = !applicationId || loading

  const handleStart = async () => {
    if (!applicationId) return
    try {
      setLoading(true)
      const res = await apiClient.post<any>(`/applications/${applicationId}/test-session`, {} as any)
      const data: any = (res as any)?.data ?? res
      const sessionId = data?.id ?? data?.data?.id
      if (!sessionId) throw new Error('Не удалось получить идентификатор сессии')
      navigate(`/tests/session/${sessionId}`)
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось начать тестовую сессию')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-100">Вступительный тест</h3>
      <p className="text-gray-300">Пройдите вступительный тест, чтобы перейти к тренировкам. Тест ограничен по времени и требует внимательности.</p>
      <div className="flex gap-4 items-center">
        <Link to="/docs" className="text-primary hover:underline">Документация по тесту</Link>
        <Button onClick={handleStart} disabled={disabled}>
          {disabled ? 'Заявка не найдена' : (loading ? 'Запуск…' : 'Начать Вступительный Тест')}
        </Button>
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

// Удалён устаревший модальный сценарий прохождения теста. Теперь используется страница /tests/session/:id
