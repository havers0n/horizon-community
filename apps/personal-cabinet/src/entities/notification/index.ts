// --- НОВЫЙ КОД (100% правильный) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `system` и имя таблицы `notifications`
export type Notification = Database['system']['Tables']['notifications']['Row']
export type NotificationInsert = Database['system']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['system']['Tables']['notifications']['Update']

// Export any notification-specific types or utilities
export * from './model'