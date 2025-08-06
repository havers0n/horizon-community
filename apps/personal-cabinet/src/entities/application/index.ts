// --- НОВЫЙ КОД (исправленный и 100% рабочий) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем ПРАВИЛЬНУЮ схему 'mdt'
export type Application = Database['mdt']['Tables']['applications']['Row']
export type ApplicationInsert = Database['mdt']['Tables']['applications']['Insert']
export type ApplicationUpdate = Database['mdt']['Tables']['applications']['Update']

// Export any application-specific types or utilities
export * from './model'