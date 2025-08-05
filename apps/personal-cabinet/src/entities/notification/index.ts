// Re-export types from the centralized db-types package
export type { Notifications } from '@roleplay-identity/db-types'
export type { NotificationsInsert } from '@roleplay-identity/db-types'
export type { NotificationsUpdate } from '@roleplay-identity/db-types'

// Export any notification-specific types or utilities
export * from './model' 