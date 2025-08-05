import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const NotificationSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки уведомлений</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Настройки уведомлений в разработке</p>
      </CardContent>
    </Card>
  )
}

export default NotificationSettings 