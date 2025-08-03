import { Button } from '@shared'

export function DashboardQuickActions() {
  const actions = [
    {
      id: 1,
      title: 'Создать задачу',
      description: 'Добавить новую задачу в систему',
      variant: 'default' as const
    },
    {
      id: 2,
      title: 'Просмотр отчетов',
      description: 'Аналитика и статистика',
      variant: 'outline' as const
    },
    {
      id: 3,
      title: 'Настройки',
      description: 'Конфигурация системы',
      variant: 'outline' as const
    },
    {
      id: 4,
      title: 'Поддержка',
      description: 'Обратиться в техподдержку',
      variant: 'outline' as const
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant}
          className="h-auto p-3 flex flex-col items-start"
        >
          <span className="font-medium">{action.title}</span>
          <span className="text-xs opacity-80">{action.description}</span>
        </Button>
      ))}
    </div>
  )
} 