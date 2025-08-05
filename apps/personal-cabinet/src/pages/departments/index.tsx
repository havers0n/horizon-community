
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function DepartmentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Отделы</h1>
        <p className="text-muted-foreground">
          Управление отделами и структурой организации
        </p>
      </div>

      <div className="grid gap-6">
        {/* Department Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего отделов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных сотрудников</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
            </CardContent>
          </Card>
        </div>

        {/* Department List */}
        <Card>
          <CardHeader>
            <CardTitle>Список отделов</CardTitle>
            <CardDescription>
              Просмотр и управление всеми отделами организации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Патрульная служба', members: 45, status: 'active' },
                { name: 'Криминальная полиция', members: 32, status: 'active' },
                { name: 'Дорожная полиция', members: 28, status: 'active' },
                { name: 'Служба безопасности', members: 18, status: 'active' },
                { name: 'IT отдел', members: 12, status: 'active' },
                { name: 'Администрация', members: 8, status: 'active' },
              ].map((dept, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dept.members} сотрудников
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                      {dept.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Просмотр
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button>Добавить отдел</Button>
              <Button variant="outline">Экспорт данных</Button>
              <Button variant="outline">Импорт данных</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 