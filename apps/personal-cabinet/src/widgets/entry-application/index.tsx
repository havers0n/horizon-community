import React, { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'

// Lazy load components
const ApplicationForm = React.lazy(() => import('@/features/entry-application/ui/application-form'))
const MyApplications = React.lazy(() => import('@/features/entry-application/ui/my-applications'))

export function EntryApplicationWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Заявка на вступление</CardTitle>
          <CardDescription>
            Заполните форму для подачи заявки на вступление в организацию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка...</div>}>
            <ApplicationForm />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Мои заявки</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка...</div>}>
            <MyApplications />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 