// Admin Reports feature exports
export * from './ui'
export * from './model'
export * from './api'

// Feature object for lazy loading
export const AdminReportsFeature = {
  ReportManager: () => import('./ui/report-manager').then(m => ({ default: m.default })),
  Analytics: () => import('./ui/analytics').then(m => ({ default: m.default }))
} 