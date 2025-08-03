import { useTheme } from 'next-themes'
import { Button } from '@shared/ui'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <h3 className="text-base font-medium">Тема интерфейса</h3>
        <p className="text-sm text-muted-foreground">
          Выберите предпочитаемую тему
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 