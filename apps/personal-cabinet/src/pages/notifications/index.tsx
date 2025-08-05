import { NotificationsWidget } from '@widgets/notifications'

function NotificationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Уведомления</h1>
        <p className="text-muted-foreground">
          Просмотр и управление уведомлениями
        </p>
      </div>

      <NotificationsWidget />
    </div>
  )
}

export default NotificationsPage 