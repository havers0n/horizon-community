import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface PageLoaderProps {
  className?: string
  message?: string
}

/**
 * Page loader component for consistent loading states
 * Used for lazy loading and asynchronous operations
 */
export function PageLoader({ className, message = 'Loading...' }: PageLoaderProps) {
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