import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { AdminTestsFeature } from '@features/admin/tests'

export function AdminTestsWidget() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление тестами</CardTitle>
          <CardDescription>
            Создание и редактирование тестов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTestsFeature.TestManager />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Результаты тестов</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTestsFeature.TestResults />
        </CardContent>
      </Card>
    </div>
  )
} 