import React from 'react'
import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router/AppRouter'
import { GlobalErrorBoundary } from '@/shared/ui/error-boundary'
import { Toaster } from '@/shared/ui/toaster'
import { SupportChatContainer } from '@/widgets/support-chat-container'

/**
 * Main Application Component
 * Responsible only for initializing providers and router
 * Following separation of concerns principle
 */
function App() {
  return (
    <GlobalErrorBoundary>
      <AppProviders>
        <AppRouter />
        <Toaster />
        <SupportChatContainer />
      </AppProviders>
    </GlobalErrorBoundary>
  )
}

export default App