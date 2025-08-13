import React from 'react'
import { Layout } from '@/shared/ui'
import { Card, CardContent } from '@/shared/ui'

export default function CadetTrainingPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-gray-100 mb-2">Этап: Тренировка кадета</h1>
            <p className="text-gray-400">Добро пожаловать в академию! Этот раздел будет расширен по мере готовности материалов.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}


