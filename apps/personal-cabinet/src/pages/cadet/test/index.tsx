// import React from 'react'
import { Layout } from '@/shared/ui'
import { Card, CardContent, Button } from '@/shared/ui'
import { useNavigate } from 'react-router-dom'

export default function CadetTestPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-gray-100 mb-2">Этап: Вступительный тест</h1>
            <p className="text-gray-400 mb-6">Добро пожаловать на этап cadet_test. Нажмите кнопку ниже, чтобы начать тест.</p>
            <Button onClick={() => navigate('/test-exam')}>Начать тест</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


