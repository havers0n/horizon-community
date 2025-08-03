import { Link, useLocation } from 'react-router-dom'
import { cn } from '@shared/lib/utils'
import { Home, User, Settings } from 'lucide-react'

const navigation = [
  { name: 'Дашборд', href: '/', icon: Home },
  { name: 'Профиль', href: '/profile', icon: User },
  { name: 'Настройки', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 border-r bg-background">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 