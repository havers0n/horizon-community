import React, { useState, useEffect } from 'react'
import type { Department } from '@/entities/documentation/model/types'

interface DepartmentPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
  loadDepartments: () => Promise<Department[]>
}

/**
 * Компонент выбора департаментов для документации
 * Извлечен из App.tsx для лучшей организации кода
 */
export const DepartmentPicker: React.FC<DepartmentPickerProps> = ({ 
  value, 
  onChange, 
  loadDepartments 
}) => {
  const [items, setItems] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    loadDepartments()
      .then((list) => { 
        if (mounted) setItems(list) 
      })
      .catch((error) => {
        if (mounted) {
          console.error('Failed to load departments:', error)
          setItems([])
        }
      })
      .finally(() => { 
        if (mounted) setLoading(false) 
      })
    
    return () => { mounted = false }
  }, [loadDepartments])

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Загрузка департаментов…
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(department => {
        const isActive = value.includes(department.id)
        return (
          <button
            key={department.id}
            type="button"
            onClick={() => toggle(department.id)}
            className={`px-2 py-1 rounded border text-sm transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-accent'
            }`}
            title={department.full_name || department.name}
          >
            {department.name}
          </button>
        )
      })}
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground">
          Нет департаментов
        </div>
      )}
    </div>
  )
}