import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { Button } from '@shared/ui'
import { Switch } from '@shared/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui'
import { useCabinet } from '@shared/hooks'
import { Settings, Moon, Sun, Monitor, Globe, Bell, Eye } from 'lucide-react'

export function UserSettings() {
  const { settings, settingsLoading, updateSettings, updateSettingsLoading } = useCabinet()
  
  const [localSettings, setLocalSettings] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'ru' as 'en' | 'ru',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profile_visible: true,
      show_email: false,
      show_phone: false,
    },
  })

  // Обновляем локальные настройки при загрузке данных
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: (settings.theme as 'light' | 'dark' | 'system') || 'system',
        language: (settings.language as 'en' | 'ru') || 'ru',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profile_visible: true,
          show_email: false,
          show_phone: false,
        },
      })
    }
  }, [settings])

  const handleSave = () => {
    updateSettings(localSettings)
  }

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Настройки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Внешний вид */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Внешний вид
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Тема</label>
              <Select
                value={localSettings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') =>
                  setLocalSettings(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Светлая
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Темная
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Системная
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Язык</label>
              <Select
                value={localSettings.language}
                onValueChange={(value: 'en' | 'ru') =>
                  setLocalSettings(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Русский
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      English
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Уведомления */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email уведомления</label>
              <Switch
                checked={localSettings.notifications.email}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Push уведомления</label>
              <Switch
                checked={localSettings.notifications.push}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">SMS уведомления</label>
              <Switch
                checked={localSettings.notifications.sms}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sms: checked }
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Приватность */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Приватность
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Профиль видим</label>
              <Switch
                checked={localSettings.privacy.profile_visible}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, profile_visible: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Показывать email</label>
              <Switch
                checked={localSettings.privacy.show_email}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, show_email: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Показывать телефон</label>
              <Switch
                checked={localSettings.privacy.show_phone}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, show_phone: checked }
                  }))
                }
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateSettingsLoading}
          className="w-full"
        >
          {updateSettingsLoading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  )
} 