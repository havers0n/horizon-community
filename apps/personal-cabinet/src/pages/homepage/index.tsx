import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { DiscordIcon, VKIcon } from '@/shared/ui/icons'
import { useAuth } from '@/features/auth'
import { cn } from '@/shared/lib/utils'

// Типы для департаментов
interface Department {
  id: string
  name: string
  fullName: string
  description: string
  icon: string
  color: string
  bgColor: string
}

// Типы для галереи
interface GalleryItem {
  id: string
  imageUrl: string
  title: string
  department: string
  alt: string
}

// Типы для FAQ
interface FAQItem {
  id: string
  question: string
  answer: string
}

// Данные департаментов
const departments: Department[] = [
  {
    id: 'lspd',
    name: 'LSPD',
    fullName: 'Los Santos Police Department',
    description: 'Департамент полиции отвечает за поддержание правопорядка, расследование преступлений и обеспечение безопасности граждан.',
    icon: '👮',
    color: 'text-horizon-600',
    bgColor: 'bg-horizon-100'
  },
  {
    id: 'sams',
    name: 'SAMS',
    fullName: 'San Andreas Medical Services',
    description: 'Служба экстренной медицинской помощи оказывает первую помощь, проводит реанимационные мероприятия и транспортирует пострадавших.',
    icon: '🚑',
    color: 'text-gold-600',
    bgColor: 'bg-gold-100'
  },
  {
    id: 'safr',
    name: 'SAFR',
    fullName: 'San Andreas Fire & Rescue',
    description: 'Пожарная служба и спасательные операции. Тушение пожаров, спасение людей и ликвидация последствий чрезвычайных ситуаций.',
    icon: '🚒',
    color: 'text-horizon-500',
    bgColor: 'bg-horizon-50'
  },
  {
    id: 'sahp',
    name: 'SAHP',
    fullName: 'San Andreas Highway Patrol',
    description: 'Дорожно-патрульная служба контролирует соблюдение ПДД, регулирует дорожное движение и расследует ДТП.',
    icon: '🚔',
    color: 'text-gold-500',
    bgColor: 'bg-gold-50'
  },
  {
    id: 'dd',
    name: 'DD',
    fullName: 'Dispatch Department',
    description: 'Диспетчерская служба координирует действия всех экстренных служб, принимает вызовы и направляет ресурсы.',
    icon: '📞',
    color: 'text-horizon-700',
    bgColor: 'bg-horizon-200'
  },
  {
    id: 'cd',
    name: 'CD',
    fullName: 'Civilian Department',
    description: 'Гражданский департамент объединяет обычных граждан, предпринимателей и представителей различных профессий.',
    icon: '👥',
    color: 'text-gold-700',
    bgColor: 'bg-gold-200'
  }
]

// Данные галереи
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    title: 'Патруль ДПС',
    department: 'SAHP',
    alt: 'Патрульная машина ДПС'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    title: 'Медицинская помощь',
    department: 'SAMS',
    alt: 'Медицинская бригада'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1608889825271-9696281ab804?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    title: 'Полицейский рейд',
    department: 'LSPD',
    alt: 'Полицейская операция'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    title: 'Пожарная служба',
    department: 'SAFR',
    alt: 'Пожарная машина'
  }
]

// Данные FAQ
const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Какие минимальные требования для игры?',
    answer: 'Для игры требуется лицензионная версия GTA V, микрофон и возраст от 16 лет.'
  },
  {
    id: '2',
    question: 'Нужен ли микрофон для игры?',
    answer: 'Да, микрофон обязателен для полноценного взаимодействия с другими игроками.'
  },
  {
    id: '3',
    question: 'Как вступить в департамент?',
    answer: 'После регистрации на сервере вы можете подать заявку на вступление в любой департамент через специальную систему.'
  },
  {
    id: '4',
    question: 'Сколько попыток подачи заявки у меня есть?',
    answer: 'Вы можете подать не более 3 заявок в календарный месяц. Счетчик попыток сбрасывается 1-го числа каждого месяца.'
  }
]

export default function Homepage() {
  const { user, isLoading } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  // Редирект авторизованных пользователей на dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Показываем загрузку пока проверяется аутентификация
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleDiscordClick = () => {
    window.open('https://discord.gg/roleplayidentity', '_blank')
  }

  const handleVKClick = () => {
    window.open('https://vk.com/roleplayidentity', '_blank')
  }

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3 bg-gradient-to-br from-horizon-400 to-horizon-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-horizon-400 to-horizon-500 bg-clip-text text-transparent">
              HorizonCommunity
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleDiscordClick}
              className="flex items-center text-gray-300 hover:text-gold-400 hover:bg-gray-800"
            >
              <DiscordIcon className="w-4 h-4 mr-2" />
              <span>Наш Discord</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleVKClick}
              className="flex items-center text-gray-300 hover:text-horizon-400 hover:bg-gray-800"
            >
              <VKIcon className="w-4 h-4 mr-2" />
              <span>Группа ВК</span>
            </Button>
            <Button asChild className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700">
              <Link to="/register">Регистрация / Вход</Link>
            </Button>
          </nav>
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <span className="text-2xl">☰</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-center justify-center text-center px-4 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            HorizonCommunity:<br />Где начинается твоя история
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Серьезное игровое сообщество, построенное на платформе FiveM. Вступай в ряды одного из департаментов и начни свою карьеру.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-8 py-4 text-lg font-bold shadow-lg">
            <Link to="/register">Подать заявку</Link>
          </Button>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Наши Департаменты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <Card
                key={department.id}
                className={cn(
                  "bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                  "hover:transform hover:-translate-y-1 hover:shadow-xl"
                )}
                onClick={() => setSelectedDepartment(selectedDepartment === department.id ? null : department.id)}
              >
                <CardContent className="p-6 relative">
                  <div className="text-center">
                    <div className={cn(
                      "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl",
                      department.bgColor
                    )}>
                      <span>{department.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{department.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{department.fullName}</p>
                    <p className="text-gray-500 text-xs">Обеспечение правопорядка</p>
                  </div>
                  
                  {/* Hover overlay with description */}
                  <div className={cn(
                    "absolute inset-0 bg-gray-900/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "flex items-center justify-center p-6 text-center"
                  )}>
                    <p className="text-sm text-gray-300">{department.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Жизнь нашего сообщества</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg h-64 group cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <span className="font-medium text-white">{item.title}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.department}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="ghost" className="text-gold-500 hover:text-gold-400">
              <Link to="/gallery">
                Смотреть всю галерею
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Остались вопросы?</h2>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
            {faqItems.map((item) => (
              <div key={item.id} className="border-b border-gray-700 last:border-b-0">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-700"
                  onClick={() => toggleFAQ(item.id)}
                >
                  <span className="font-medium text-lg">{item.question}</span>
                  <span className={cn(
                    "transition-transform duration-300",
                    openFAQ === item.id ? "rotate-180" : ""
                  )}>
                    ▼
                  </span>
                </Button>
                {openFAQ === item.id && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" className="text-gold-500 hover:text-gold-400">
              <Link to="/faq">
                Читать все вопросы (FAQ)
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 mr-2 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">HC</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
                  HorizonCommunity
                </span>
              </div>
              <p className="text-gray-400">© 2024 HorizonCommunity. Все права защищены.</p>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscordClick}
                  className="text-2xl text-gray-400 hover:text-gold-400 p-0 h-auto"
                >
                  <DiscordIcon className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVKClick}
                  className="text-2xl text-gray-400 hover:text-horizon-400 p-0 h-auto"
                >
                  <VKIcon className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto">
                  Пользовательское соглашение
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0 h-auto">
                  Политика конфиденциальности
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 