import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { GalleryItem } from '../model/types'

interface GalleryGridProps {
  items: GalleryItem[]
  onImageClick: (item: GalleryItem) => void
  emptyState?: React.ReactNode
  departments?: Array<{ id: string; name: string; color: string }>
}

export function GalleryGrid({ items, onImageClick, emptyState, departments }: GalleryGridProps) {
  const getDepartmentColor = (department: string) => {
    if (!departments) return 'bg-gray-500'
    const dept = departments.find(d => d.id === department)
    return dept?.color || 'bg-gray-500'
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => onImageClick(item)}
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getDepartmentColor(item.department))}
              >
                {item.department}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              {item.date && (
                <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
              )}
              {item.author && (
                <span>{item.author}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 