import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Заявки</h1>
        <p className="text-muted-foreground">
          Управление заявками на переводы, отпуска и другие запросы
        </p>
      </div>

      <div className="grid gap-6">
        {/* Application Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">На рассмотрении</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
        </div>

        {/* Application Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Переводы</CardTitle>
              <CardDescription>Заявки на перевод между отделами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">15</div>
              <p className="text-sm text-muted-foreground">Активных заявок</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Отпуска</CardTitle>
              <CardDescription>Заявки на отпуск и выходные</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">6</div>
              <p className="text-sm text-muted-foreground">Активных заявок</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Совместные</CardTitle>
              <CardDescription>Совместные заявки и проекты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">3</div>
              <p className="text-sm text-muted-foreground">Активных заявок</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Последние заявки</CardTitle>
            <CardDescription>
              Список недавно поданных заявок
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 'APP-001', 
                  type: 'Перевод', 
                  applicant: 'Иван Петров', 
                  department: 'Патрульная служба → Криминальная полиция',
                  status: 'pending',
                  date: '2024-01-15'
                },
                { 
                  id: 'APP-002', 
                  type: 'Отпуск', 
                  applicant: 'Мария Сидорова', 
                  department: 'Дорожная полиция',
                  status: 'approved',
                  date: '2024-01-14'
                },
                { 
                  id: 'APP-003', 
                  type: 'Совместная', 
                  applicant: 'Алексей Козлов', 
                  department: 'IT отдел',
                  status: 'rejected',
                  date: '2024-01-13'
                },
                { 
                  id: 'APP-004', 
                  type: 'Перевод', 
                  applicant: 'Елена Волкова', 
                  department: 'Служба безопасности → Администрация',
                  status: 'pending',
                  date: '2024-01-12'
                },
              ].map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{app.id}</span>
                      <Badge variant="outline">{app.type}</Badge>
                    </div>
                    <h3 className="font-semibold">{app.applicant}</h3>
                    <p className="text-sm text-muted-foreground">{app.department}</p>
                    <p className="text-xs text-muted-foreground">{app.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        app.status === 'approved' ? 'default' : 
                        app.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {app.status === 'approved' ? 'Одобрено' : 
                       app.status === 'rejected' ? 'Отклонено' : 'На рассмотрении'}
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
              <Button>Новая заявка</Button>
              <Button variant="outline">Фильтры</Button>
              <Button variant="outline">Экспорт</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 