import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `mdt` и таблицу `test_results`
export type TestResult = Database['mdt']['Tables']['test_results']['Row']
export type TestResultInsert = Database['mdt']['Tables']['test_results']['Insert']
export type TestResultUpdate = Database['mdt']['Tables']['test_results']['Update']