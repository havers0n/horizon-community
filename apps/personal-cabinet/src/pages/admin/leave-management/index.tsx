
import { AdminLeaveManagementWidget } from '@widgets/admin/leave-management'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'

export default function AdminLeaveManagementPage() {
  const { isLoading } = useSession()
  const { isLoggedIn, isAdmin } = usePermissions()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Админ панель - Управление отпусками</h1>
        <p className="text-muted-foreground">
          Администрирование заявок на отпуск
        </p>
      </div>

      <AdminLeaveManagementWidget />
    </div>
  )
} 