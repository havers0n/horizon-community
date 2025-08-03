import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui'
import { SettingsForm } from '@features/settings/form'
import { ThemeToggle } from '@features/settings/theme-toggle'

export function SettingsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Настройки приложения</CardTitle>
          <CardDescription>
            Настройка интерфейса и предпочтений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ThemeToggle />
            <SettingsForm />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 