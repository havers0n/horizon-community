// --- НОВЫЙ КОД (100% правильный) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `common` и имя таблицы `departments`
export type Department = Database['common']['Tables']['departments']['Row']
export type DepartmentInsert = Database['common']['Tables']['departments']['Insert']
export type DepartmentUpdate = Database['common']['Tables']['departments']['Update']

// Export any department-specific types or utilities
export * from './model'