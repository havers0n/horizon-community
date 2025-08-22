/**
 * Design System Configuration
 * Centralized styling configuration for consistent component design
 */

// Animation durations
export const ANIMATION_DURATION = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Border radius scale
export const BORDER_RADIUS = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  full: '9999px',
} as const;

// Spacing scale (matches Tailwind)
export const SPACING = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// Component size variants
export const COMPONENT_SIZES = {
  xs: {
    height: '1.5rem', // h-6
    padding: '0.25rem 0.5rem', // px-2 py-1
    fontSize: '0.75rem', // text-xs
  },
  sm: {
    height: '2rem', // h-8
    padding: '0.25rem 0.75rem', // px-3 py-1
    fontSize: '0.875rem', // text-sm
  },
  md: {
    height: '2.5rem', // h-10
    padding: '0.5rem 1rem', // px-4 py-2
    fontSize: '0.875rem', // text-sm
  },
  lg: {
    height: '2.75rem', // h-11
    padding: '0.5rem 2rem', // px-8 py-2
    fontSize: '0.875rem', // text-sm
  },
  xl: {
    height: '3rem', // h-12
    padding: '0.75rem 2rem', // px-8 py-3
    fontSize: '1rem', // text-base
  },
} as const;

// Focus ring styles
export const FOCUS_RING = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  primary: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  destructive: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
} as const;

// Status colors configuration
export const STATUS_COLORS = {
  success: {
    bg: 'bg-success',
    text: 'text-success-foreground',
    border: 'border-success',
    badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
  warning: {
    bg: 'bg-warning',
    text: 'text-warning-foreground',
    border: 'border-warning',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  },
  error: {
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    border: 'border-destructive',
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
  info: {
    bg: 'bg-info',
    text: 'text-info-foreground',
    border: 'border-info',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  pending: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    border: 'border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  },
  approved: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  },
  rejected: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  },
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

/**
 * Get status color classes
 */
export function getStatusClasses(status: StatusType, type: 'bg' | 'text' | 'border' | 'badge' = 'badge') {
  return STATUS_COLORS[status]?.[type] || STATUS_COLORS.info[type];
}

// Component base classes for consistency
export const COMPONENT_BASE_CLASSES = {
  button: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  card: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  badge: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  dialog: 'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
} as const;
