import { Link, useLocation } from 'react-router-dom'
import { cn } from '@shared/lib/utils'
import { Home, User, Settings } from 'lucide-react'

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: Home },
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
              aria-current={isActive ? 'page' : undefined}
              className={cn('nav-item', isActive && 'active')}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )}
        )}
      </nav>
    </div>
  )
} 