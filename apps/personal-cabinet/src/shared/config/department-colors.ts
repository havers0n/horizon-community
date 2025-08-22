/**
 * Centralized department color configuration
 * Provides consistent color schemes for all departments across the application
 */

export const DEPARTMENT_COLORS = {
  pd: {
    name: 'Police Department',
    colors: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Primary blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-500 to-blue-600',
    gradientHover: 'from-blue-600 to-blue-700',
  },
  sahp: {
    name: 'San Andreas Highway Patrol',
    colors: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a', 
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Primary yellow
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    gradient: 'from-yellow-500 to-yellow-600',
    gradientHover: 'from-yellow-600 to-yellow-700',
  },
  sams: {
    name: 'San Andreas Medical Services',
    colors: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac', 
      400: '#4ade80',
      500: '#22c55e', // Primary green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    gradient: 'from-green-500 to-green-600',
    gradientHover: 'from-green-600 to-green-700',
  },
  safr: {
    name: 'San Andreas Fire Rescue',
    colors: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Primary red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    gradient: 'from-red-500 to-red-600',
    gradientHover: 'from-red-600 to-red-700',
  },
  dd: {
    name: 'District Dispatch',
    colors: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Primary purple
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    gradient: 'from-purple-500 to-purple-600',
    gradientHover: 'from-purple-600 to-purple-700',
  },
  cd: {
    name: 'Civil Department',
    colors: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280', // Primary gray
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    gradient: 'from-gray-500 to-gray-600',
    gradientHover: 'from-gray-600 to-gray-700',
  },
} as const;

export type DepartmentCode = keyof typeof DEPARTMENT_COLORS;

/**
 * Get department color configuration
 */
export function getDepartmentColors(department: DepartmentCode | string) {
  return DEPARTMENT_COLORS[department as DepartmentCode] || DEPARTMENT_COLORS.cd;
}

/**
 * Generate Tailwind classes for department styling
 */
export function getDepartmentClasses(department: DepartmentCode | string, variant: 'solid' | 'outline' | 'ghost' = 'solid') {
  const config = getDepartmentColors(department);
  
  const baseClasses = {
    solid: `bg-gradient-to-r ${config.gradient} text-white hover:${config.gradientHover}`,
    outline: `border-2 border-${department}-500 text-${department}-600 hover:bg-${department}-50 dark:text-${department}-400 dark:hover:bg-${department}-900/20`,
    ghost: `text-${department}-600 hover:bg-${department}-100 dark:text-${department}-400 dark:hover:bg-${department}-900/20`,
  };
  
  return baseClasses[variant];
}

/**
 * Generate department badge classes
 */
export function getDepartmentBadgeClasses(department: DepartmentCode | string) {
  return `bg-${department}-100 text-${department}-800 border-${department}-200 dark:bg-${department}-900/20 dark:text-${department}-300 dark:border-${department}-800`;
}
