import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DashboardStats as DashboardStatsType } from '../model'

interface DashboardStatsProps {
  stats?: DashboardStatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Активные сессии</p>
            <p className="text-2xl font-bold">{stats?.activeSessions || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Документы</p>
            <p className="text-2xl font-bold">{stats?.documents || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Время работы</p>
            <p className="text-2xl font-bold">{stats?.timeSpent || '0ч'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Продуктивность</p>
            <p className="text-2xl font-bold">{stats?.productivity || 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 