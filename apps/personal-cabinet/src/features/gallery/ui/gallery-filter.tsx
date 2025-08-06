import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface GalleryFilterProps {
  departments: Array<{ id: string; name: string; color: string }>
  selectedDepartment: string
  onDepartmentChange: (department: string) => void
  totalItems: number
  filteredItems: number
}

export function GalleryFilter({
  departments,
  selectedDepartment,
  onDepartmentChange,
  totalItems,
  filteredItems
}: GalleryFilterProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Фильтр по департаментам</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {departments.map((dept) => (
          <Button
            key={dept.id}
            variant={selectedDepartment === dept.id ? "default" : "outline"}
            size="sm"
            onClick={() => onDepartmentChange(dept.id)}
            className={cn(
              "transition-all duration-200",
              selectedDepartment === dept.id && dept.color !== 'bg-gray-500' && "bg-opacity-80"
            )}
          >
            {dept.name}
          </Button>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Показано {filteredItems} из {totalItems} изображений
      </p>
    </div>
  )
} 