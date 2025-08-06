import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `mdt` и таблицу `test_sessions`
export type TestSession = Database['mdt']['Tables']['test_sessions']['Row']
export type TestSessionInsert = Database['mdt']['Tables']['test_sessions']['Insert']
export type TestSessionUpdate = Database['mdt']['Tables']['test_sessions']['Update']