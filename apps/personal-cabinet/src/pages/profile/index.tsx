import React from 'react'
import { useSession } from '@/shared/contexts/SessionContext'
import { Layout } from '@/shared/ui/layout'
import { Card, CardContent } from '@/shared/ui/card'
import { H2, H3, Muted, Stack } from '@/shared/ui'
import { ProfileInfo } from '@/features/profile/ui'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { AlertTriangle } from 'lucide-react'

const ProfilePage: React.FC = () => {
  const { session, isLoading, error } = useSession()

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6 space-y-6">
          <Stack space="xs">
            <H2 className="text-2xl font-bold">Профиль</H2>
            <Muted>Ваши данные и информация о статусе</Muted>
          </Stack>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6 space-y-6">
          <Stack space="xs">
            <H2 className="text-2xl font-bold">Профиль</H2>
            <Muted>Ваши данные и информация о статусе</Muted>
          </Stack>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Не удалось загрузить данные профиля: {error}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-6 space-y-6">
          <Stack space="xs">
            <H2 className="text-2xl font-bold">Профиль</H2>
            <Muted>Ваши данные и информация о статусе</Muted>
          </Stack>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Данные сессии не найдены. Попробуйте обновить страницу.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-6 space-y-6">
        <Stack space="xs">
          <H2 className="text-2xl font-bold">Профиль</H2>
          <Muted>Ваши данные и информация о статусе</Muted>
        </Stack>
        
        <ProfileInfo session={session} />
      </div>
    </Layout>
  )
}

export default ProfilePage 