import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../libs/ui-components/src/components/card'
import { Activity } from '../model'

interface RecentActivityProps {
  activities?: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities = [
    {
      id: '1',
      userId: '1',
      type: 'login' as const,
      description: 'Вход в систему',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      userId: '1',
      type: 'profile_update' as const,
      description: 'Обновлен профиль',
      timestamp: new Date(Date.now() - 3600000).toISOString()
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
            <div key={activity.id} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">
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