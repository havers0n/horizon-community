import { cva } from 'class-variance-authority';

export const checkboxVariants = cva(
  'rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-900',
  {
    variants: {
      variant: {
        default: 'border-secondary-600 bg-secondary-700',
        outline: 'border-secondary-500 bg-transparent',
        ghost: 'border-transparent bg-transparent',
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);