import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Activity } from '../model'

interface RecentActivityProps {
  activities?: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities = [
    {
      id: '1',
      userId: '1',
      type: 'login',
      description: 'Вход в систему',
      timestamp: new Date().toISOString(),
      metadata: {}
    },
    {
      id: '2',
      userId: '1',
      type: 'profile_update',
      description: 'Обновлен профиль',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      metadata: {}
    }
  ]

  const displayActivities = activities || defaultActivities

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последняя активность</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 