import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AuthProvider } from '@/features/auth'
import { SessionProvider } from '@/shared/contexts/SessionContext'
import { ThemeProvider } from '@/features/theme'
import { queryClient } from '@/shared/lib'

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Централизованная конфигурация всех провайдеров приложения
 * Следует принципу единственной ответственности
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <SessionProvider>
                {children}
              </SessionProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}