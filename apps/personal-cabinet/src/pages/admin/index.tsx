import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'

export default function AdminPanelPage() {
  const { isLoading } = useSession()
  const { isLoggedIn, isAdmin } = usePermissions()

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-6">Загрузка...</div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="container mx-auto px-6 py-12 text-center">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          Добро пожаловать в Админ-панель
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Пожалуйста, выберите раздел в меню слева, чтобы начать работу.
        </p>
        <div className="pt-8">
          <div className="text-sm text-muted-foreground">
            Вам доступны разделы управления системой в зависимости от ваших прав доступа.
          </div>
        </div>
      </div>
    </div>
  )
}
 