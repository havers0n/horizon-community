import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui'
import { ProfileForm } from '@features/profile/form'
import { ProfileAvatar } from '@features/profile/avatar'

export function ProfileWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
          <CardDescription>
            Управление личной информацией и настройками профиля
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <ProfileAvatar />
            <ProfileForm />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 