import React, { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'

// Lazy load components
const TestManager = React.lazy(() => import('@/features/admin/tests/ui/test-manager'))
const TestResults = React.lazy(() => import('@/features/admin/tests/ui/test-results'))

export function AdminTestsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление тестами</CardTitle>
          <CardDescription>
            Создание и управление тестами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка...</div>}>
            <TestManager />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Результаты тестов</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка...</div>}>
            <TestResults />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 