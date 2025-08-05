// Re-export types from the centralized db-types package
export type { Departments } from '@roleplay-identity/db-types'
export type { DepartmentsInsert } from '@roleplay-identity/db-types'
export type { DepartmentsUpdate } from '@roleplay-identity/db-types'

// Export any department-specific types or utilities
export * from './model' 