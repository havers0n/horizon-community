import React from 'react'
import { Card, CardContent, Button } from '@/shared/ui'
import { useNavigate } from 'react-router-dom'

type NextStepCardProps = {
  stageCode?: string | null
}

export const NextStepCard: React.FC<NextStepCardProps> = ({ stageCode }) => {
  const navigate = useNavigate()
  if (!stageCode) return null

  const lower = stageCode.toLowerCase()
  if (lower === 'cadet_test') {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Ваш следующий шаг</h3>
              <p className="text-gray-400 mt-1">Пройти вступительный тест для перехода к обучению</p>
            </div>
            <Button onClick={() => navigate('/cadet/test')}>Перейти к тесту</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (lower === 'cadet_training') {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Добро пожаловать в академию!</h3>
              <p className="text-gray-400 mt-1">Продолжайте обучение и следуйте инструкциям тренеров</p>
            </div>
            <Button onClick={() => navigate('/cadet/training')}>Открыть раздел</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}


