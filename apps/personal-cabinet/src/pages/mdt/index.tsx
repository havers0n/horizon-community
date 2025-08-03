import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function MDTPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MDT - Mobile Data Terminal</h1>
        <p className="text-muted-foreground">
          Система мобильного терминала данных для оперативной работы
        </p>
      </div>

      <div className="grid gap-6">
        {/* MDT Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных сессий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Запросов сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">База данных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Онлайн</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Последнее обновление</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 мин</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрый поиск</CardTitle>
            <CardDescription>
              Поиск по базе данных MDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Тип поиска</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Граждане</option>
                  <option>Транспортные средства</option>
                  <option>Оружие</option>
                  <option>Номера</option>
                  <option>Адреса</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Поисковый запрос</label>
                <input
                  type="text"
                  placeholder="Введите данные для поиска..."
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Поиск</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card>
          <CardHeader>
            <CardTitle>Последние запросы</CardTitle>
            <CardDescription>
              История ваших поисковых запросов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  query: 'Иван Петров', 
                  type: 'Граждане',
                  result: 'Найдено: 1 запись',
                  time: '2 минуты назад'
                },
                { 
                  query: 'ABC123', 
                  type: 'Номера',
                  result: 'Найдено: 0 записей',
                  time: '15 минут назад'
                },
                { 
                  query: 'ул. Мира, 15', 
                  type: 'Адреса',
                  result: 'Найдено: 3 записи',
                  time: '1 час назад'
                },
                { 
                  query: 'Toyota Camry', 
                  type: 'Транспортные средства',
                  result: 'Найдено: 12 записей',
                  time: '2 часа назад'
                },
              ].map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{search.type}</Badge>
                    </div>
                    <h3 className="font-semibold">{search.query}</h3>
                    <p className="text-sm text-muted-foreground">{search.result}</p>
                    <p className="text-xs text-muted-foreground">{search.time}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Повторить
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Новый гражданин</CardTitle>
              <CardDescription>
                Добавить нового гражданина в базу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Добавить</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Транспортное средство</CardTitle>
              <CardDescription>
                Зарегистрировать ТС
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Добавить</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Оружие</CardTitle>
              <CardDescription>
                Зарегистрировать оружие
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Добавить</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Отчет</CardTitle>
              <CardDescription>
                Создать отчет о проверке
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Создать</Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Статус системы</CardTitle>
            <CardDescription>
              Состояние подключения к базе данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Основная база данных</span>
                  <Badge variant="default">Онлайн</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Резервная база данных</span>
                  <Badge variant="default">Онлайн</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API сервер</span>
                  <Badge variant="default">Онлайн</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Синхронизация</span>
                  <Badge variant="default">Активна</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Шифрование</span>
                  <Badge variant="default">Включено</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Мониторинг</span>
                  <Badge variant="default">Онлайн</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>
              Недавние действия в системе MDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  action: 'Поиск гражданина', 
                  user: 'Офицер Петров',
                  details: 'Иван Сидоров - найдено 1 запись',
                  time: '2 минуты назад'
                },
                { 
                  action: 'Добавлен новый гражданин', 
                  user: 'Офицер Иванов',
                  details: 'Мария Козлова - данные внесены',
                  time: '15 минут назад'
                },
                { 
                  action: 'Проверка ТС', 
                  user: 'Офицер Сидоров',
                  details: 'ABC123 - проверка завершена',
                  time: '1 час назад'
                },
                { 
                  action: 'Обновление данных', 
                  user: 'Система',
                  details: 'Автоматическая синхронизация',
                  time: '2 часа назад'
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.action}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} • {activity.details}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 