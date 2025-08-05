// Re-export types from the centralized db-types package
export type { ReportTemplates } from '@roleplay-identity/db-types'
export type { ReportTemplatesInsert } from '@roleplay-identity/db-types'
export type { ReportTemplatesUpdate } from '@roleplay-identity/db-types'

// Export any report-specific types or utilities
export * from './model' 