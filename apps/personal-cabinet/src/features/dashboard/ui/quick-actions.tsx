import { Button } from '@/shared/ui/button'
import { QuickAction } from '../model'

interface QuickActionsProps {
  actions?: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions = [
    {
      id: '1',
      title: 'Создать заявку',
      description: 'Подать новую заявку',
      icon: '📝',
      href: '/applications',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Отчеты',
      description: 'Просмотр отчетов',
      icon: '📊',
      href: '/reports',
      color: 'green'
    },
    {
      id: '3',
      title: 'Тесты',
      description: 'Пройти тестирование',
      icon: '🧪',
      href: '/tests',
      color: 'purple'
    }
  ]

  const displayActions = actions || defaultActions

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {displayActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2"
          onClick={() => window.location.href = action.href}
        >
          <div className="text-2xl">{action.icon}</div>
          <div className="text-left">
            <h3 className="font-semibold">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
        </Button>
      ))}
    </div>
  )
} 