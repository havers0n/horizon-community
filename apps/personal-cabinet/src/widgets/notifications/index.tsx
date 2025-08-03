import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { NotificationsFeature } from '@features/notifications'

export function NotificationsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsFeature.NotificationList />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Настройки уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsFeature.Settings />
        </CardContent>
      </Card>
    </div>
  )
} 