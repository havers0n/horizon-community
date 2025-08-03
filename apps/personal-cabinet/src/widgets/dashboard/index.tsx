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