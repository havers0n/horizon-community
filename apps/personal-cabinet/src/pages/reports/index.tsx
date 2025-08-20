import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { PageHeader, SectionCard } from '@/shared/ui/page-sections'

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <PageHeader title="Отчеты" description="Создание, управление и просмотр отчетов" />

      <div className="grid gap-6">
        {/* Report Stats */}
        <SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего отчетов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">За этот месяц</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Шаблоны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Черновики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
          </div>
        </SectionCard>

        {/* Report Templates */}
        <SectionCard title="Шаблоны отчетов" description="Выберите шаблон для создания нового отчета">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Ежедневный отчет', description: 'Стандартный ежедневный отчет о деятельности', category: 'Ежедневные' },
              { name: 'Инцидент', description: 'Отчет о происшествии или инциденте', category: 'Инциденты' },
              { name: 'Патрулирование', description: 'Отчет о патрулировании территории', category: 'Патрули' },
              { name: 'Арест', description: 'Отчет об аресте подозреваемого', category: 'Аресты' },
              { name: 'ДТП', description: 'Отчет о дорожно-транспортном происшествии', category: 'ДТП' },
              { name: 'Проверка', description: 'Отчет о проверке объекта или территории', category: 'Проверки' },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{template.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </SectionCard>

        {/* Recent Reports */}
        <SectionCard title="Последние отчеты" description="Недавно созданные отчеты">
          <div className="space-y-4">
            {[
              { 
                id: 'RPT-2024-001', 
                title: 'Ежедневный отчет - 15.01.2024', 
                author: 'Иван Петров',
                department: 'Патрульная служба',
                date: '2024-01-15',
                status: 'published'
              },
              { 
                id: 'RPT-2024-002', 
                title: 'Инцидент на улице Мира', 
                author: 'Мария Сидорова',
                department: 'Криминальная полиция',
                date: '2024-01-14',
                status: 'draft'
              },
              { 
                id: 'RPT-2024-003', 
                title: 'Патрулирование центра города', 
                author: 'Алексей Козлов',
                department: 'Дорожная полиция',
                date: '2024-01-13',
                status: 'published'
              },
              { 
                id: 'RPT-2024-004', 
                title: 'Арест подозреваемого', 
                author: 'Елена Волкова',
                department: 'Служба безопасности',
                date: '2024-01-12',
                status: 'published'
              },
            ].map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-мono text-sm text-muted-foreground">{report.id}</span>
                    <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                      {report.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {report.author} • {report.department}
                  </p>
                  <p className="text-xs text-muted-foreground">{report.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Просмотр
                  </Button>
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Быстрые действия">
          <div className="flex gap-4">
            <Button>Новый отчет</Button>
            <Button variant="outline">Создать шаблон</Button>
            <Button variant="outline">Экспорт</Button>
            <Button variant="outline">Поиск</Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
} 