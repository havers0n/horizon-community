import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'

export default function TestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Тесты</h1>
        <p className="text-muted-foreground">
          Система тестирования и экзаменов для сотрудников
        </p>
      </div>

      <div className="grid gap-6">
        {/* Test Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего тестов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активных экзаменов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Завершено сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Доступные тесты</CardTitle>
            <CardDescription>
              Выберите тест для прохождения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  name: 'Основы законодательства', 
                  description: 'Базовые знания законов и нормативов',
                  questions: 25,
                  timeLimit: 30,
                  difficulty: 'easy',
                  category: 'Обязательные'
                },
                { 
                  name: 'Правила дорожного движения', 
                  description: 'Тест на знание ПДД',
                  questions: 40,
                  timeLimit: 45,
                  difficulty: 'medium',
                  category: 'Специализация'
                },
                { 
                  name: 'Протоколы безопасности', 
                  description: 'Правила безопасности и протоколы',
                  questions: 20,
                  timeLimit: 25,
                  difficulty: 'easy',
                  category: 'Обязательные'
                },
                { 
                  name: 'Криминалистика', 
                  description: 'Основы криминалистики и следствия',
                  questions: 35,
                  timeLimit: 40,
                  difficulty: 'hard',
                  category: 'Специализация'
                },
                { 
                  name: 'Первая помощь', 
                  description: 'Оказание первой медицинской помощи',
                  questions: 30,
                  timeLimit: 35,
                  difficulty: 'medium',
                  category: 'Обязательные'
                },
                { 
                  name: 'Тактика и стратегия', 
                  description: 'Тактические приемы и стратегическое планирование',
                  questions: 50,
                  timeLimit: 60,
                  difficulty: 'hard',
                  category: 'Продвинутые'
                },
              ].map((test, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{test.category}</Badge>
                      <Badge 
                        variant={
                          test.difficulty === 'easy' ? 'default' : 
                          test.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }
                      >
                        {test.difficulty === 'easy' ? 'Легкий' : 
                         test.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Вопросов:</span>
                        <span className="font-medium">{test.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Время:</span>
                        <span className="font-medium">{test.timeLimit} мин</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Начать тест</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Последние результаты</CardTitle>
            <CardDescription>
              Ваши недавние результаты тестирования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  testName: 'Основы законодательства', 
                  score: 92,
                  totalQuestions: 25,
                  date: '2024-01-15',
                  status: 'passed'
                },
                { 
                  testName: 'Правила дорожного движения', 
                  score: 78,
                  totalQuestions: 40,
                  date: '2024-01-12',
                  status: 'passed'
                },
                { 
                  testName: 'Криминалистика', 
                  score: 65,
                  totalQuestions: 35,
                  date: '2024-01-10',
                  status: 'failed'
                },
                { 
                  testName: 'Первая помощь', 
                  score: 88,
                  totalQuestions: 30,
                  date: '2024-01-08',
                  status: 'passed'
                },
              ].map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.testName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.score}/{result.totalQuestions} правильных ответов
                    </p>
                    <p className="text-xs text-muted-foreground">{result.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={result.status === 'passed' ? 'default' : 'destructive'}
                    >
                      {result.status === 'passed' ? 'Сдан' : 'Не сдан'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold">{result.score}%</div>
                    </div>
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
              <Button>Создать тест</Button>
              <Button variant="outline">Мои результаты</Button>
              <Button variant="outline">Статистика</Button>
              <Button variant="outline">Сертификаты</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 