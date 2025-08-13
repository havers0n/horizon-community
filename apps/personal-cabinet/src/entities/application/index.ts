// --- НОВЫЙ КОД (исправленный и 100% рабочий) ---
import type { Database } from '@roleplay-identity/db-types'

// Таблица applications находится в схеме 'system'
export type Application = Database['system']['Tables']['applications']['Row']
export type ApplicationInsert = Database['system']['Tables']['applications']['Insert']
export type ApplicationUpdate = Database['system']['Tables']['applications']['Update']

// Export any application-specific types or utilities
export * from './model'