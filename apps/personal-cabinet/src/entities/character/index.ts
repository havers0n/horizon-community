// --- НОВЫЙ КОД (100% правильный) ---
import type { Database } from '@roleplay-identity/db-types'

// Указываем правильную схему `common` и имя таблицы `characters`
export type Character = Database['common']['Tables']['characters']['Row']
export type CharacterInsert = Database['common']['Tables']['characters']['Insert']
export type CharacterUpdate = Database['common']['Tables']['characters']['Update']

// Export any character-specific types or utilities
export * from './model'