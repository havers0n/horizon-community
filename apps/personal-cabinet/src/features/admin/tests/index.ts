// Admin Tests feature exports
export * from './ui'
export * from './model'
export * from './api'

// Feature object for lazy loading
export const AdminTestsFeature = {
  TestManager: () => import('./ui/test-manager').then(m => ({ default: m.default })),
  TestResults: () => import('./ui/test-results').then(m => ({ default: m.default }))
} 