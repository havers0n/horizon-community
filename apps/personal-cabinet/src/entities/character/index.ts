// Re-export types from the centralized db-types package
export type { Characters } from '@roleplay-identity/db-types'
export type { CharactersInsert } from '@roleplay-identity/db-types'
export type { CharactersUpdate } from '@roleplay-identity/db-types'

// Export any character-specific types or utilities
export * from './model' 