// Test exam feature exports
export * from './ui'
export * from './model'
export * from './api'

// Feature object for lazy loading
export const TestExamFeature = {
  AvailableTests: () => import('./ui/available-tests').then(m => ({ default: m.default })),
  MyResults: () => import('./ui/my-results').then(m => ({ default: m.default }))
} 