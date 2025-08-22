/**
 * Unified Design System Export
 * Central export point for all design system utilities and configurations
 */

// Design system utilities
export {
  ANIMATION_DURATION,
  BORDER_RADIUS,
  SPACING,
  COMPONENT_SIZES,
  FOCUS_RING,
  STATUS_COLORS,
  COMPONENT_BASE_CLASSES,
  getStatusClasses,
  type StatusType,
} from './design-system';

// Department colors
export {
  DEPARTMENT_COLORS,
  getDepartmentColors,
  getDepartmentClasses,
  getDepartmentBadgeClasses,
  type DepartmentCode,
} from './department-colors';

// Common utility functions for consistent styling
export const createVariantClasses = (
  base: string,
  variants: Record<string, string>
) => {
  return (variant: string = 'default') => {
    return `${base} ${variants[variant] || variants.default || ''}`;
  };
};

export const createSizeClasses = (
  sizes: Record<string, { height: string; padding: string; fontSize: string }>
) => {
  return (size: string = 'md') => {
    const sizeConfig = sizes[size] || sizes.md;
    return {
      height: sizeConfig.height,
      padding: sizeConfig.padding,
      fontSize: sizeConfig.fontSize,
    };
  };
};

// Responsive breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;
