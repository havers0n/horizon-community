/**
 * Responsive Design Utilities
 * Helper functions and constants for consistent responsive design patterns
 */

import { BREAKPOINTS, type BreakpointKey } from '../config';

/**
 * Generate responsive classes based on breakpoints
 */
export function createResponsiveClasses(
  classes: Partial<Record<BreakpointKey | 'base', string>>
): string {
  const { base = '', sm, md, lg, xl, '2xl': xl2 } = classes;
  
  const responsiveClasses = [
    base,
    sm ? `sm:${sm}` : '',
    md ? `md:${md}` : '',
    lg ? `lg:${lg}` : '',
    xl ? `xl:${xl}` : '',
    xl2 ? `2xl:${xl2}` : '',
  ].filter(Boolean);
  
  return responsiveClasses.join(' ');
}

/**
 * Common responsive patterns
 */
export const RESPONSIVE_PATTERNS = {
  // Grid patterns
  grid: {
    autoFit: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    twoCol: 'grid grid-cols-1 md:grid-cols-2',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  
  // Flex patterns
  flex: {
    stack: 'flex flex-col',
    stackToRow: 'flex flex-col md:flex-row',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    wrap: 'flex flex-wrap',
  },
  
  // Spacing patterns
  spacing: {
    section: 'py-8 sm:py-12 lg:py-16',
    container: 'px-4 sm:px-6 lg:px-8',
    gap: 'gap-4 sm:gap-6 lg:gap-8',
  },
  
  // Typography patterns
  text: {
    heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    subheading: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm text-muted-foreground',
  },
  
  // Hide/show patterns
  visibility: {
    mobileOnly: 'block sm:hidden',
    tabletUp: 'hidden sm:block',
    desktopOnly: 'hidden lg:block',
    mobileTablet: 'block lg:hidden',
  },
} as const;

/**
 * Container width utilities matching Tailwind's container component
 */
export const CONTAINER_WIDTHS = {
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
} as const;

/**
 * Generate container classes with responsive padding
 */
export function containerClasses(
  maxWidth: keyof typeof CONTAINER_WIDTHS = 'xl',
  padding: boolean = true
): string {
  const classes = ['mx-auto', CONTAINER_WIDTHS[maxWidth]];
  
  if (padding) {
    classes.push(RESPONSIVE_PATTERNS.spacing.container);
  }
  
  return classes.join(' ');
}

/**
 * Hook-like function to get responsive values based on screen size
 * Note: This is a utility function, not a React hook
 */
export function getResponsiveValue<T>(
  values: Partial<Record<BreakpointKey | 'base', T>>,
  currentBreakpoint: BreakpointKey | 'base' = 'base'
): T | undefined {
  // Order of precedence: current -> smaller breakpoints -> base
  const breakpointOrder: (BreakpointKey | 'base')[] = [
    currentBreakpoint,
    'xl', 'lg', 'md', 'sm', 'base'
  ];
  
  for (const bp of breakpointOrder) {
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

/**
 * Generate aspect ratio classes
 */
export const ASPECT_RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video', // 16/9
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[21/9]',
} as const;

/**
 * Card size variants for responsive design
 */
export const CARD_SIZES = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10',
} as const;

export type CardSize = keyof typeof CARD_SIZES;
