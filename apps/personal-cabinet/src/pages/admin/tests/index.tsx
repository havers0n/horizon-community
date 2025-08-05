
import { AdminTestsWidget } from '@widgets/admin/tests'

export default function AdminTestsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Админ панель - Управление тестами</h1>
        <p className="text-muted-foreground">
          Создание и управление тестами и экзаменами
        </p>
      </div>

      <AdminTestsWidget />
    </div>
  )
} 