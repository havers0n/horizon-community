import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { DiscordIcon, VKIcon } from '@/shared/ui/icons'

interface CommunityStats {
  totalMembers: number
  activeDepartments: number
  totalApplications: number
  averageResponseTime: string
}

interface GalleryItem {
  id: number
  title: string
  description: string
  imageUrl: string
  department: string
  author: string
  date: string
  likes: number
}

export default function Homepage() {
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 1250,
    activeDepartments: 7,
    totalApplications: 3420,
    averageResponseTime: '2.5 часа'
  })

  const [gallery, setGallery] = useState<GalleryItem[]>([])

  useEffect(() => {
    // Загрузка статистики и галереи
    const fetchData = async () => {
      try {
        // Здесь будут реальные API вызовы
        console.log('Loading homepage data...')
      } catch (error) {
        console.error('Failed to load homepage data:', error)
      }
    }

    fetchData()
  }, [])

  const handleDiscordClick = () => {
    window.open('https://discord.gg/roleplayidentity', '_blank')
  }

  const handleVKClick = () => {
    window.open('https://vk.com/roleplayidentity', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              RolePlay Identity
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Профессиональная система управления персоналом для ролевых серверов
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/register">Присоединиться</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/departments">Узнать больше</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalMembers}</div>
              <div className="text-gray-600 dark:text-gray-400">Участников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeDepartments}</div>
              <div className="text-gray-600 dark:text-gray-400">Департаментов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalApplications}</div>
              <div className="text-gray-600 dark:text-gray-400">Заявок</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.averageResponseTime}</div>
              <div className="text-gray-600 dark:text-gray-400">Время ответа</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности системы</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Управление персоналом</CardTitle>
                <CardDescription>
                  Полный цикл работы с персоналом от подачи заявки до назначения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Подача заявок в департаменты</li>
                  <li>• Система тестирования</li>
                  <li>• Управление отпусками</li>
                  <li>• Переводы между департаментами</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Отчетность и аналитика</CardTitle>
                <CardDescription>
                  Создание отчетов и аналитика деятельности
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Шаблоны отчетов</li>
                  <li>• Интерактивные формы</li>
                  <li>• Экспорт в PDF</li>
                  <li>• Статистика и графики</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Коммуникация</CardTitle>
                <CardDescription>
                  Инструменты для эффективной коммуникации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Внутренний форум</li>
                  <li>• Система уведомлений</li>
                  <li>• Техническая поддержка</li>
                  <li>• Чат между департаментами</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы присоединиться?</h2>
          <p className="text-xl mb-8 opacity-90">
            Станьте частью профессионального сообщества
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/register">Создать аккаунт</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/login">Войти</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RolePlay Identity</h3>
              <p className="text-gray-400">
                Профессиональная система управления персоналом для ролевых серверов
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ссылки</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/departments" className="hover:text-white">Департаменты</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/support" className="hover:text-white">Поддержка</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Сообщество</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" onClick={handleDiscordClick} className="p-0">
                  <DiscordIcon className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleVKClick} className="p-0">
                  <VKIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Статус</h4>
              <Badge variant="secondary" className="bg-green-500 text-white">
                Онлайн
              </Badge>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RolePlay Identity. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 