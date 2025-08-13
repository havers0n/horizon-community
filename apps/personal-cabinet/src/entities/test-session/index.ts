import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `system` и таблицу `test_sessions`
export type TestSession = Database['system']['Tables']['test_sessions']['Row']
export type TestSessionInsert = Database['system']['Tables']['test_sessions']['Insert']
export type TestSessionUpdate = Database['system']['Tables']['test_sessions']['Update']