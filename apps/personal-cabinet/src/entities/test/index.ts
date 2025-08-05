// Re-export types from the centralized db-types package
export type { Tests } from '@roleplay-identity/db-types'
export type { TestResults } from '@roleplay-identity/db-types'
export type { TestsInsert } from '@roleplay-identity/db-types'
export type { TestResultsInsert } from '@roleplay-identity/db-types'
export type { TestsUpdate } from '@roleplay-identity/db-types'
export type { TestResultsUpdate } from '@roleplay-identity/db-types'

// Export any test-specific types or utilities
export * from './model' 