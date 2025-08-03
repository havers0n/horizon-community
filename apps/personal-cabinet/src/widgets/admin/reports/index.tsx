import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { AdminReportsFeature } from '@features/admin/reports'

export function AdminReportsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление отчетами</CardTitle>
          <CardDescription>
            Создание и анализ отчетов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminReportsFeature.ReportManager />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Аналитика</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminReportsFeature.Analytics />
        </CardContent>
      </Card>
    </div>
  )
} 