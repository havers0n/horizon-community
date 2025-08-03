import { Button } from '../../../../../../libs/ui-components/src/components/button'
import { QuickAction } from '../model'

interface QuickActionsProps {
  actions?: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions = [
    {
      id: '1',
      title: 'Редактировать профиль',
      description: 'Обновить личную информацию',
      icon: '👤',
      href: '/profile',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Настройки',
      description: 'Изменить настройки аккаунта',
      icon: '⚙️',
      href: '/settings',
      color: 'gray'
    }
  ]

  const displayActions = actions || defaultActions

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2"
          onClick={() => window.location.href = action.href}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <div className="font-medium">{action.title}</div>
              <div className="text-sm text-gray-500">{action.description}</div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
} 