import React, { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'

// Lazy load components
const NotificationList = React.lazy(() => import('@/features/notifications/ui/notification-list'))
const NotificationSettings = React.lazy(() => import('@/features/notifications/ui/notification-settings'))

export function NotificationsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка уведомлений...</div>}>
            <NotificationList />
          </Suspense>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Настройки уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Загрузка настроек...</div>}>
            <NotificationSettings />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 