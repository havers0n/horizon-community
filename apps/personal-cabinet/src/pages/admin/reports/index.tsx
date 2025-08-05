
import { AdminReportsWidget } from '@widgets/admin/reports'

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Админ панель - Управление отчетами</h1>
        <p className="text-muted-foreground">
          Администрирование отчетов и аналитики
        </p>
      </div>

      <AdminReportsWidget />
    </div>
  )
} 