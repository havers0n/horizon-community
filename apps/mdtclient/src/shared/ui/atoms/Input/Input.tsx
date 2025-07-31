import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const inputVariants = cva(
  "block w-full rounded-lg border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border border-slate-600 bg-slate-800 text-slate-100 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500",
        error: "border border-red-500 bg-slate-800 text-slate-100 focus:ring-red-500 focus:border-red-500 hover:border-red-400",
        success: "border border-green-500 bg-slate-800 text-slate-100 focus:ring-green-500 focus:border-green-500 hover:border-green-400",
        glass: "border border-slate-600 bg-slate-800 text-slate-100 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-500",
        neon: "border border-blue-500/50 bg-slate-800 text-slate-100 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400",
        neonPink: "border border-pink-500/50 bg-slate-800 text-slate-100 focus:ring-pink-500 focus:border-pink-500 hover:border-pink-400",
        neonPurple: "border border-purple-500/50 bg-slate-800 text-slate-100 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400",
        neonGreen: "border border-green-500/50 bg-slate-800 text-slate-100 focus:ring-green-500 focus:border-green-500 hover:border-green-400",
        neonOrange: "border border-orange-500/50 bg-slate-800 text-slate-100 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-400",
        glassmorphism: "bg-slate-950/70 backdrop-blur-sm border border-green-500/30 text-green-400 focus:ring-green-500/50 focus:border-green-400 hover:border-green-300 placeholder-green-300/50",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground">{leftIcon}</span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant: error ? "error" : variant, size, className }),
              leftIcon && "pl-10",
              rightIcon && "pr-10"
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants }; 
