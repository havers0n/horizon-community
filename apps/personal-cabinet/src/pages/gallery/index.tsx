import { Layout } from '@/shared/ui/layout'
import { GalleryWidget } from '@/features/gallery'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { UploadModal } from '@/features/gallery/UploadModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/shared/ui/dialog'

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

// Маппер элементов API -> UI
const mapToGalleryItems = (rows: any[]): GalleryItem[] => {
  const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string
  const BUCKET_NAME = 'gallery'
  const base = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`.replace(/\/$/, '')
  return (rows || []).map((r: any) => ({
    id: r.id,
    imageUrl: `${base}/${r.storage_path}`,
    title: r.title,
    description: r.description ?? undefined,
    department: r.department_id || 'all',
    alt: r.title || 'gallery image',
    date: r.created_at,
    author: r.profiles?.username ?? undefined,
  }))
}

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
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gallery', '/gallery/images'],
    queryFn: async () => {
      const resp = await apiClient.get<any>('/gallery/images')
      return resp?.data ?? []
    },
  })

  const items = mapToGalleryItems(data || [])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Галерея сообщества</h1>
          <p className="text-muted-foreground">
            Скриншоты и фотографии из жизни нашего игрового сообщества
          </p>
        </div>

        {isLoading && <div>Загрузка...</div>}
        {isError && <div>Ошибка загрузки галереи</div>}
        {!isLoading && !isError && (
          <GalleryWidget
            items={items}
            departments={departments}
            showFilter={true}
          />
        )}

        <div className="mt-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Загрузить фото</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Загрузка изображения</DialogTitle>
                <DialogDescription>Выберите файл и заполните поля</DialogDescription>
              </DialogHeader>
              <UploadModal
                departments={departments}
                onSuccess={() => {
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  )
} 