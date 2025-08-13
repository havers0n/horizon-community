import type { Database } from '@roleplay-identity/db-types'

// Указываем схему `system` и таблицу `test_results`
export type TestResult = Database['system']['Tables']['test_results']['Row']
export type TestResultInsert = Database['system']['Tables']['test_results']['Insert']
export type TestResultUpdate = Database['system']['Tables']['test_results']['Update']