import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/api-client'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

type PendingImage = {
  id: string
  storage_path: string
  title: string
  description?: string | null
  created_at?: string
  department_id?: string | null
  profiles?: { username?: string | null }
  gallery_image_likes?: Array<{ count: number }>
}

const BUCKET_NAME = 'gallery'
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
const storageBase = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`.replace(/\/$/, '')

const AdminGalleryModerationPage: React.FC = () => {
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pendingImages'],
    queryFn: async (): Promise<PendingImage[]> => {
      const res = await apiClient.get<{ success: boolean; data: PendingImage[] }>(`/admin/gallery/pending`)
      // apiClient returns response.data; normalize
      const rows = (res as any)?.data ?? (Array.isArray(res) ? res : [])
      return rows as PendingImage[]
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/gallery/${id}/approve`, {}, { headers: { 'Content-Type': 'application/json' } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendingImages'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/gallery/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendingImages'] }),
  })

  if (isLoading) return <div className="container mx-auto px-4 py-6">Загрузка…</div>
  if (isError) return <div className="container mx-auto px-4 py-6 text-red-400">Ошибка загрузки</div>

  const items = (data || [])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Модерация галереи</h1>
        <p className="text-muted-foreground">Одобряйте или удаляйте пользовательские изображения</p>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground">Нет изображений на модерации</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((img) => {
            const imageUrl = `${storageBase}/${img.storage_path}`
            const likes = img.gallery_image_likes?.[0]?.count ?? 0
            return (
              <Card key={img.id} className="overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-black/20">
                  <img src={imageUrl} alt={img.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="text-sm font-semibold line-clamp-1" title={img.title}>{img.title}</div>
                  {img.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">{img.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{img.profiles?.username || 'Неизвестный автор'}</span>
                    <span>❤ {likes}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(img.id)} disabled={approveMutation.isPending}>
                      {approveMutation.isPending ? 'Одобряю…' : 'Одобрить'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(img.id)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? 'Удаляю…' : 'Удалить'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminGalleryModerationPage


