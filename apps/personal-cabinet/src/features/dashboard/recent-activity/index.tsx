import { Button } from '@shared'

export function DashboardRecentActivity() {
  const activities = [
    {
      id: 1,
      action: 'Создана новая задача',
      description: 'Разработка нового функционала',
      time: '2 часа назад'
    },
    {
      id: 2,
      action: 'Задача выполнена',
      description: 'Исправление багов в системе',
      time: '4 часа назад'
    },
    {
      id: 3,
      action: 'Обновлен профиль',
      description: 'Изменены настройки уведомлений',
      time: '1 день назад'
    }
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full">
        Показать все
      </Button>
    </div>
  )
} 