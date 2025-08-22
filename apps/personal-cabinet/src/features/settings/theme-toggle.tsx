import { Button } from '@/shared/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/features/theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { id: 'light', icon: Sun, label: 'Светлая' },
    { id: 'dark', icon: Moon, label: 'Темная' },
    { id: 'system', icon: Monitor, label: 'Системная' },
  ] as const

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h3 className="text-base font-medium">Тема интерфейса</h3>
        <p className="text-sm text-muted-foreground">
          Выберите предпочитаемую тему
        </p>
      </div>
      <div className="flex space-x-2">
        {themes.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={theme === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme(id)}
            className="transition-all duration-200"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  )
} 