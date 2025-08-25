import { AdminTransfersWidget } from '@widgets/admin/transfers'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { PermissionGuard } from '@/shared/ui/permission-guard'

export default function AdminTransfersPage() {
  const { isLoading } = useSession()
  const { isLoggedIn, hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PermissionGuard permission="admin.transfers.manage">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Админ панель - Управление переводами</h1>
          <p className="text-muted-foreground">
            Администрирование заявок на перевод между департаментами
          </p>
        </div>

        <AdminTransfersWidget />
      </div>
    </PermissionGuard>
  )
}