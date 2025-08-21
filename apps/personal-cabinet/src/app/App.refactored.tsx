import React from 'react'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import { GlobalErrorBoundary } from '@/shared/ui/error-boundary'
import { Toaster } from '@/shared/ui/toaster'

/**
 * Основной компонент приложения
 * Отвечает только за инициализацию провайдеров и роутера
 */
function App() {
  return (
    <GlobalErrorBoundary>
      <AppProviders>
        <AppRouter />
        <Toaster />
      </AppProviders>
    </GlobalErrorBoundary>
  )
}

export default App