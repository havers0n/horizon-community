import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор вашей деятельности и статистики
        </p>
      </div>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Отчетов за месяц</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 с прошлого месяца
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                1 требует внимания
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Тестов пройдено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Средний балл: 85%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Часов на дежурстве</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                За текущий месяц
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Часто используемые функции
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col">
                <span className="text-lg">📝</span>
                <span className="text-sm">Новый отчет</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg">📋</span>
                <span className="text-sm">Заявка</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg">📊</span>
                <span className="text-sm">Статистика</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <span className="text-lg">❓</span>
                <span className="text-sm">Поддержка</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>
              Ваши недавние действия в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Создан отчет', time: '2 часа назад', type: 'report' },
                { action: 'Подана заявка на отпуск', time: '1 день назад', type: 'application' },
                { action: 'Пройден тест по ПДД', time: '2 дня назад', type: 'test' },
                { action: 'Обновлен профиль', time: '3 дня назад', type: 'profile' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>
              Важные сообщения и обновления
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900">Новый тест доступен</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Тест "Основы криминалистики" теперь доступен для прохождения
                </p>
                <Button size="sm" className="mt-2">Пройти тест</Button>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900">Заявка требует внимания</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Ваша заявка на перевод была рассмотрена, требуется дополнительная информация
                </p>
                <Button size="sm" variant="outline" className="mt-2">Просмотреть</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { DashboardPage } 