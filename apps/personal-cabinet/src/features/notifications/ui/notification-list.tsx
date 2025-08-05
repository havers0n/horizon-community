import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const NotificationList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Уведомления</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Список уведомлений в разработке</p>
      </CardContent>
    </Card>
  )
}

export default NotificationList 