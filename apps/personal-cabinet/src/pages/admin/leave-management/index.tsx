
import { AdminLeaveManagementWidget } from '@widgets/admin/leave-management'

export default function AdminLeaveManagementPage() {
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