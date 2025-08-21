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
 * Centralized configuration of all application providers
 * Following single responsibility principle
 * IMPORTANT: Provider order matters - SessionProvider must come before AuthProvider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            {/* SessionProvider MUST come first - AuthProvider depends on it */}
            <SessionProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </SessionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}