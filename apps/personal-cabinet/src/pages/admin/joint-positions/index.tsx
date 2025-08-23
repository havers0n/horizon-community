import { AdminJointPositionManagementWidget } from '@widgets/admin/joint-position-management'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'

export default function AdminJointPositionManagementPage() {
  const { isLoading } = useSession()
  const { isLoggedIn, hasPermission } = usePermissions()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  if (!isLoggedIn || !hasPermission('admin.joint_positions.manage')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Админ панель - Управление совмещениями</h1>
        <p className="text-muted-foreground">
          Администрирование заявок на совмещение должностей
        </p>
      </div>

      <AdminJointPositionManagementWidget />
    </div>
  )
}