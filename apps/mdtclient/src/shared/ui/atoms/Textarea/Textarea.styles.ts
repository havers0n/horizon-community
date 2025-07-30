import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none',
  {
    variants: {
      variant: {
        default: 'bg-secondary-700 border-secondary-600',
        outline: 'bg-transparent border-secondary-500',
        ghost: 'bg-transparent border-transparent',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        default: 'px-3 py-2',
        lg: 'px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);