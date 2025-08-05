// Admin Leave Management feature exports
export * from './ui'
export * from './model'
export * from './api'

// Feature object for lazy loading
export const AdminLeaveManagementFeature = {
  PendingRequests: () => import('./ui/pending-requests').then(m => ({ default: m.default })),
  ApprovedRequests: () => import('./ui/approved-requests').then(m => ({ default: m.default })),
  RejectedRequests: () => import('./ui/rejected-requests').then(m => ({ default: m.default }))
} 