import { useState } from 'react'
import { GalleryGrid } from './gallery-grid'
import { GalleryFilter } from './gallery-filter'
import { GalleryLightbox } from './gallery-lightbox'
import { GalleryItem } from '../model/types'

interface GalleryWidgetProps {
  items: GalleryItem[]
  departments: Array<{ id: string; name: string; color: string }>
  showFilter?: boolean
  showUpload?: boolean
  className?: string
}

export function GalleryWidget({
  items,
  departments,
  showFilter = true,
  showUpload = false,
  className
}: GalleryWidgetProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  const filteredItems = selectedDepartment === 'all' 
    ? items 
    : items.filter(item => item.department === selectedDepartment)

  return (
    <div className={className}>
      {showFilter && (
        <GalleryFilter
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          totalItems={items.length}
          filteredItems={filteredItems.length}
        />
      )}

      <GalleryGrid
        items={filteredItems}
        onImageClick={setSelectedImage}
        departments={departments}
        emptyState={
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">Изображения не найдены</h3>
            <p className="text-muted-foreground mb-4">
              Для выбранного департамента пока нет изображений
            </p>
            <button
              onClick={() => setSelectedDepartment('all')}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Показать все изображения
            </button>
          </div>
        }
      />

      <GalleryLightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        departments={departments}
      />
    </div>
  )
} 