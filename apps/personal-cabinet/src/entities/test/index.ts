// --- НОВЫЙ КОД (только для таблицы tests) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `mdt` и таблицу `tests`
export type Test = Database['mdt']['Tables']['tests']['Row']
export type TestInsert = Database['mdt']['Tables']['tests']['Insert']
export type TestUpdate = Database['mdt']['Tables']['tests']['Update']

// Export any test-specific types or utilities
export * from './model'