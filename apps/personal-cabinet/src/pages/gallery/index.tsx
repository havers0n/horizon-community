import { Layout } from '@/shared/ui/layout'
import { GalleryWidget } from '@/features/gallery'

// Типы для галереи
interface GalleryItem {
  id: string
  imageUrl: string
  title: string
  description?: string
  department: string
  alt: string
  date?: string
  author?: string
}

// Данные галереи
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Патруль ДПС',
    description: 'Ежедневная патрульная служба на дорогах города',
    department: 'SAHP',
    alt: 'Патрульная машина ДПС',
    date: '2024-01-15',
    author: 'Officer Smith'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Медицинская помощь',
    description: 'Экстренная медицинская помощь на месте происшествия',
    department: 'SAMS',
    alt: 'Медицинская бригада',
    date: '2024-01-14',
    author: 'Dr. Johnson'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1608889825271-9696281ab804?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Полицейский рейд',
    description: 'Совместная операция по задержанию преступников',
    department: 'LSPD',
    alt: 'Полицейская операция',
    date: '2024-01-13',
    author: 'Detective Brown'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Пожарная служба',
    description: 'Тушение пожара в жилом районе',
    department: 'SAFR',
    alt: 'Пожарная машина',
    date: '2024-01-12',
    author: 'Firefighter Wilson'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Дорожный контроль',
    description: 'Проверка документов на дорожном посту',
    department: 'SAHP',
    alt: 'Дорожный контроль',
    date: '2024-01-11',
    author: 'Officer Davis'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Спасательная операция',
    description: 'Спасение пострадавших из затонувшего автомобиля',
    department: 'SAFR',
    alt: 'Спасательная операция',
    date: '2024-01-10',
    author: 'Rescuer Miller'
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1608889825271-9696281ab804?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Расследование',
    description: 'Работа следователей на месте преступления',
    department: 'LSPD',
    alt: 'Расследование',
    date: '2024-01-09',
    author: 'Detective Garcia'
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1608889825102-ebffa5a6e92f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Экстренная помощь',
    description: 'Оказание первой помощи пострадавшему',
    department: 'SAMS',
    alt: 'Экстренная помощь',
    date: '2024-01-08',
    author: 'Paramedic Taylor'
  }
]

// Департаменты для фильтрации
const departments = [
  { id: 'all', name: 'Все департаменты', color: 'bg-gray-500' },
  { id: 'LSPD', name: 'LSPD', color: 'bg-blue-500' },
  { id: 'SAMS', name: 'SAMS', color: 'bg-red-500' },
  { id: 'SAFR', name: 'SAFR', color: 'bg-orange-500' },
  { id: 'SAHP', name: 'SAHP', color: 'bg-green-500' },
  { id: 'DD', name: 'DD', color: 'bg-purple-500' },
  { id: 'CD', name: 'CD', color: 'bg-gray-500' }
]

export default function GalleryPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Галерея сообщества</h1>
          <p className="text-muted-foreground">
            Скриншоты и фотографии из жизни нашего игрового сообщества
          </p>
        </div>

        <GalleryWidget
          items={galleryItems}
          departments={departments}
          showFilter={true}
          showUpload={false}
        />
      </div>
    </Layout>
  )
} 