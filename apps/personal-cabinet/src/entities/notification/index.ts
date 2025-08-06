// --- НОВЫЙ КОД (100% правильный) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `mdt` и имя таблицы `notifications`
export type Notification = Database['mdt']['Tables']['notifications']['Row']
export type NotificationInsert = Database['mdt']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['mdt']['Tables']['notifications']['Update']

// Export any notification-specific types or utilities
export * from './model'