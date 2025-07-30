// Citizen Search Feature
export * from './ui';
export * from './model';

// Types
export type { CitizenSearchResult } from './model/types';

// Store
export { useCitizenSearchStore } from './model/store';

// Legacy export for backward compatibility
export { PersonSearchWidget as CitizenSearchWidget } from './ui';