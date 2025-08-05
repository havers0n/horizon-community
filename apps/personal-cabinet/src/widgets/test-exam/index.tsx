import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'

// Lazy load components
const AvailableTests = React.lazy(() => import('@/features/test-exam/ui/available-tests'))
const MyResults = React.lazy(() => import('@/features/test-exam/ui/my-results'))

export function TestExamWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Доступные тесты</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка тестов...</div>}>
            <AvailableTests />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои результаты</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка результатов...</div>}>
            <MyResults />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 