import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Link } from 'react-router-dom'
import { PageHeader, SectionCard } from '@/shared/ui/page-sections'

export default function AdminPanelPage() {
  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <PageHeader title="Админ-панель" description="Управление системой и пользователями" />

      <div className="grid gap-6">
        {/* System Stats */}
        <SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активных сессий</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Системная нагрузка</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
              </CardContent>
            </Card>
            <Card className="card-horizon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ошибки сегодня</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>
        </SectionCard>

        {/* Admin Tools */}
        <SectionCard title="Инструменты администрирования" description="Управление пользователями, отделами и контентом">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>
                  Добавление, редактирование и удаление пользователей
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full"><Link to="/admin/applications">Заявки кандидатов</Link></Button>
                  <Button className="w-full">Просмотр всех пользователей</Button>
                  <Button variant="outline" className="w-full">Добавить пользователя</Button>
                  <Button variant="outline" className="w-full">Массовые операции</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Управление отделами</CardTitle>
                <CardDescription>
                  Создание и настройка отделов и подразделений
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full">Управление отделами</Button>
                  <Button variant="outline" className="w-full">Создать отдел</Button>
                  <Button variant="outline" className="w-full">Иерархия отделов</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
                <CardDescription>
                  Конфигурация системы и параметров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full">Общие настройки</Button>
                  <Button variant="outline" className="w-full">Безопасность</Button>
                  <Button variant="outline" className="w-full">Резервное копирование</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Логи и мониторинг</CardTitle>
                <CardDescription>
                  Просмотр системных логов и мониторинг
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full">Системные логи</Button>
                  <Button variant="outline" className="w-full">Активность пользователей</Button>
                  <Button variant="outline" className="w-full">Ошибки системы</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Управление контентом</CardTitle>
                <CardDescription>
                  Управление шаблонами, тестами и контентом
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild className="w-full"><Link to="/admin/tests">Тесты и экзамены</Link></Button>
                  <Button variant="outline" className="w-full">Шаблоны отчетов</Button>
                  <Button asChild variant="outline" className="w-full"><Link to="/admin/documents">Документация</Link></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-horizon">
              <CardHeader>
                <CardTitle>Аналитика и отчеты</CardTitle>
                <CardDescription>
                  Системная аналитика и генерация отчетов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full">Системная аналитика</Button>
                  <Button variant="outline" className="w-full">Отчеты по пользователям</Button>
                  <Button variant="outline" className="w-full">Экспорт данных</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard title="Последняя активность" description="Недавние действия в системе">
          <div className="space-y-4">
            {[
              { 
                action: 'Пользователь добавлен', 
                user: 'admin@system.com',
                target: 'Иван Петров',
                time: '2 минуты назад',
                type: 'user_created'
              },
              { 
                action: 'Отдел обновлен', 
                user: 'admin@system.com',
                target: 'Патрульная служба',
                time: '15 минут назад',
                type: 'department_updated'
              },
              { 
                action: 'Системная настройка изменена', 
                user: 'admin@system.com',
                target: 'Настройки безопасности',
                time: '1 час назад',
                type: 'settings_changed'
              },
              { 
                action: 'Пользователь заблокирован', 
                user: 'admin@system.com',
                target: 'user@example.com',
                time: '2 часа назад',
                type: 'user_blocked'
              },
              { 
                action: 'Резервная копия создана', 
                user: 'system',
                target: 'Автоматическое резервное копирование',
                time: '3 часа назад',
                type: 'backup_created'
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={
                        activity.type === 'user_created' ? 'default' : 
                        activity.type === 'user_blocked' ? 'destructive' : 
                        activity.type === 'backup_created' ? 'outline' : 'secondary'
                      }
                    >
                      {activity.type === 'user_created' ? 'Создание' : 
                       activity.type === 'user_blocked' ? 'Блокировка' : 
                       activity.type === 'backup_created' ? 'Резервная копия' : 'Обновление'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{activity.action}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activity.user} • {activity.target}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* System Health */}
        <SectionCard title="Состояние системы" description="Мониторинг ключевых компонентов системы">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>База данных</span>
                <Badge variant="default">Онлайн</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>API сервер</span>
                <Badge variant="default">Онлайн</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Файловое хранилище</span>
                <Badge variant="default">Онлайн</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Email сервис</span>
                <Badge variant="secondary">Предупреждение</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Кэш сервер</span>
                <Badge variant="default">Онлайн</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Мониторинг</span>
                <Badge variant="default">Онлайн</Badge>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
} 