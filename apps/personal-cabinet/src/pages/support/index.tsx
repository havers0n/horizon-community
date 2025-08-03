import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Поддержка</h1>
        <p className="text-muted-foreground">
          Получите помощь и поддержку по любым вопросам
        </p>
      </div>

      <div className="grid gap-6">
        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Открытых тикетов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Решенных сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Среднее время ответа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2ч</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Удовлетворенность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Help */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Часто задаваемые вопросы</CardTitle>
              <CardDescription>
                Быстрые ответы на популярные вопросы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  'Как подать заявку на перевод?',
                  'Как создать новый отчет?',
                  'Как пройти обязательный тест?',
                  'Как изменить личные данные?',
                  'Как получить доступ к MDT?',
                  'Как связаться с администрацией?',
                ].map((question, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Создать тикет</CardTitle>
              <CardDescription>
                Отправьте запрос в службу поддержки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Тип проблемы</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Техническая проблема</option>
                    <option>Вопрос по функционалу</option>
                    <option>Ошибка в системе</option>
                    <option>Запрос доступа</option>
                    <option>Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Приоритет</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Низкий</option>
                    <option>Средний</option>
                    <option>Высокий</option>
                    <option>Критический</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-24 resize-none"
                    placeholder="Опишите вашу проблему подробно..."
                  />
                </div>
                <Button className="w-full">Отправить тикет</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Мои тикеты</CardTitle>
            <CardDescription>
              История ваших обращений в поддержку
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 'TKT-2024-001', 
                  title: 'Проблема с доступом к отчетам', 
                  type: 'Техническая проблема',
                  status: 'open',
                  priority: 'high',
                  date: '2024-01-15'
                },
                { 
                  id: 'TKT-2024-002', 
                  title: 'Вопрос по созданию теста', 
                  type: 'Вопрос по функционалу',
                  status: 'resolved',
                  priority: 'medium',
                  date: '2024-01-12'
                },
                { 
                  id: 'TKT-2024-003', 
                  title: 'Ошибка при сохранении данных', 
                  type: 'Ошибка в системе',
                  status: 'in_progress',
                  priority: 'high',
                  date: '2024-01-10'
                },
                { 
                  id: 'TKT-2024-004', 
                  title: 'Запрос на расширение прав', 
                  type: 'Запрос доступа',
                  status: 'closed',
                  priority: 'low',
                  date: '2024-01-08'
                },
              ].map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                      <Badge variant="outline">{ticket.type}</Badge>
                      <Badge 
                        variant={
                          ticket.priority === 'high' ? 'destructive' : 
                          ticket.priority === 'medium' ? 'secondary' : 'default'
                        }
                      >
                        {ticket.priority === 'high' ? 'Высокий' : 
                         ticket.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <p className="text-xs text-muted-foreground">{ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        ticket.status === 'open' ? 'default' : 
                        ticket.status === 'in_progress' ? 'secondary' : 
                        ticket.status === 'resolved' ? 'outline' : 'destructive'
                      }
                    >
                      {ticket.status === 'open' ? 'Открыт' : 
                       ticket.status === 'in_progress' ? 'В работе' : 
                       ticket.status === 'resolved' ? 'Решен' : 'Закрыт'}
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
            <CardDescription>
              Способы связи с командой поддержки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Discord</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Присоединяйтесь к нашему серверу
                </p>
                <Button variant="outline" size="sm">Присоединиться</Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  support@organization.com
                </p>
                <Button variant="outline" size="sm">Написать</Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Документация</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Руководства и инструкции
                </p>
                <Button variant="outline" size="sm">Открыть</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 