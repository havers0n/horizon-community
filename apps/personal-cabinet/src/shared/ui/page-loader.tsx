import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface PageLoaderProps {
  className?: string
  message?: string
}

/**
 * Компонент загрузки страниц
 * Используется для lazy loading и асинхронных операций
 */
export function PageLoader({ className, message = 'Загрузка...' }: PageLoaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-center min-h-screen',
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}