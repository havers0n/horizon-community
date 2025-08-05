// Notifications feature exports
export * from './ui'
export * from './model'
export * from './api'

// Feature object for lazy loading
export const NotificationsFeature = {
  NotificationList: () => import('./ui/notification-list').then(m => ({ default: m.default })),
  Settings: () => import('./ui/notification-settings').then(m => ({ default: m.default }))
} 