import { NotificationsWidget } from '@widgets/notifications'
import { PageHeader, SectionCard } from '@/shared/ui/page-sections'

function NotificationsPage() {
  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <PageHeader title="Уведомления" description="Просмотр и управление уведомлениями" />

      <SectionCard>
        <NotificationsWidget />
      </SectionCard>
    </div>
  )
}

export default NotificationsPage 