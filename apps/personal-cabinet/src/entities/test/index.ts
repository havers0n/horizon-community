// --- НОВЫЙ КОД (только для таблицы tests) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `system` и таблицу `tests`
export type Test = Database['system']['Tables']['tests']['Row']
export type TestInsert = Database['system']['Tables']['tests']['Insert']
export type TestUpdate = Database['system']['Tables']['tests']['Update']

// Export any test-specific types or utilities
export * from './model'