import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared'
import { Button } from '@shared'
import { DashboardStats } from '@features/dashboard/stats'
import { DashboardRecentActivity } from '@features/dashboard/recent-activity'
import { DashboardQuickActions } from '@features/dashboard/quick-actions'

export function DashboardWidget() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <Button>Добавить задачу</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardStats />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>Ваши недавние действия в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentActivity />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Часто используемые функции</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardQuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Экспорт всех виджетов дашборда
export { ProfileWidget } from './ui/profile-widget';
export { FeedWidget } from './ui/feed-widget';
export { QuickActionsWidget } from './ui/quick-actions-widget';
export { AnnouncementsWidget } from './ui/announcements-widget';
export { UsefulLinksWidget } from './ui/useful-links-widget';
export { StatisticsWidget } from './ui/statistics-widget';
export { ApplicationStatusWidget } from './ui/application-status-widget';
export { NextStepsWidget } from './ui/next-steps-widget';
export { EventsWidget } from './ui/events-widget'; 