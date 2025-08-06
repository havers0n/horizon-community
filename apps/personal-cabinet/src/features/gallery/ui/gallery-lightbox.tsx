import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { GalleryItem } from '../model/types'

interface GalleryLightboxProps {
  image: GalleryItem | null
  onClose: () => void
  departments?: Array<{ id: string; name: string; color: string }>
}

export function GalleryLightbox({ image, onClose, departments }: GalleryLightboxProps) {
  const getDepartmentColor = (department: string) => {
    if (!departments) return 'bg-gray-500'
    const dept = departments.find(d => d.id === department)
    return dept?.color || 'bg-gray-500'
  }

  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        {image && (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img
                src={image.imageUrl}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{image.title}</h3>
                <Badge 
                  variant="secondary" 
                  className={cn(getDepartmentColor(image.department))}
                >
                  {image.department}
                </Badge>
              </div>
              {image.description && (
                <p className="text-muted-foreground">{image.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                {image.date && (
                  <span>Дата: {new Date(image.date).toLocaleDateString('ru-RU')}</span>
                )}
                {image.author && (
                  <span>Автор: {image.author}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 