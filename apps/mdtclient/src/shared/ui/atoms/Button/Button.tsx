import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        // Основные варианты - темный фон с цветными рамками
        default: "bg-slate-800/50 text-blue-400 border border-blue-500/50 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300 focus:ring-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        primary: "bg-slate-800/50 text-blue-400 border border-blue-500/50 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300 focus:ring-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        secondary: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200 focus:ring-slate-500/50",
        danger: "bg-slate-800/50 text-red-400 border border-red-500/50 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300 focus:ring-red-500/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        destructive: "bg-slate-800/50 text-red-400 border border-red-500/50 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300 focus:ring-red-500/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        ghost: "bg-transparent text-slate-300 border border-transparent hover:bg-slate-700/20 hover:border-slate-600/50 focus:ring-slate-500/50",
        outline: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200 focus:ring-slate-500/50",
        glass: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200 focus:ring-slate-500/50",
        
        // Неоновые варианты - более яркие рамки
        neon: "bg-slate-800/50 text-blue-400 border border-blue-500/70 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300 focus:ring-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
        neonPink: "bg-slate-800/50 text-pink-400 border border-pink-500/70 hover:bg-slate-800/70 hover:border-pink-400 hover:text-pink-300 focus:ring-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]",
        neonPurple: "bg-slate-800/50 text-purple-400 border border-purple-500/70 hover:bg-slate-800/70 hover:border-purple-400 hover:text-purple-300 focus:ring-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)]",
        neonGreen: "bg-slate-800/50 text-green-400 border border-green-500/70 hover:bg-slate-800/70 hover:border-green-400 hover:text-green-300 focus:ring-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]",
        neonOrange: "bg-slate-800/50 text-orange-400 border border-orange-500/70 hover:bg-slate-800/70 hover:border-orange-400 hover:text-orange-300 focus:ring-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        dangerGlow: "bg-slate-800/50 text-red-400 border border-red-500/70 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300 focus:ring-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        
        // Тактические варианты для статусов - более тонкие рамки
        tacticalAvailable: "bg-slate-800/50 text-green-400 border border-green-500/40 hover:bg-slate-800/70 hover:border-green-400 hover:text-green-300 focus:ring-green-500/50",
        tacticalBusy: "bg-slate-800/50 text-orange-400 border border-orange-500/40 hover:bg-slate-800/70 hover:border-orange-400 hover:text-orange-300 focus:ring-orange-500/50",
        tacticalEnRoute: "bg-slate-800/50 text-blue-400 border border-blue-500/40 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300 focus:ring-blue-500/50",
        tacticalOnScene: "bg-slate-800/50 text-purple-400 border border-purple-500/40 hover:bg-slate-800/70 hover:border-purple-400 hover:text-purple-300 focus:ring-purple-500/50",
        tacticalUnavailable: "bg-slate-800/50 text-slate-400 border border-slate-500/40 hover:bg-slate-800/70 hover:border-slate-400 hover:text-slate-300 focus:ring-slate-500/50",
        tacticalPanic: "bg-slate-800/50 text-red-400 border border-red-500/60 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300 focus:ring-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
        
        // Варианты для многослойного стекла
        glassmorphism: "bg-slate-950/50 backdrop-blur-sm text-green-400 border border-green-500/30 hover:bg-slate-950/70 hover:border-green-400 hover:text-green-300 focus:ring-green-500/50",
        glassmorphismAccent: "bg-slate-950/40 backdrop-blur-md text-green-300 border border-green-400/30 hover:bg-slate-950/60 hover:border-green-300 hover:text-green-200 focus:ring-green-400/50",
        glassmorphismDanger: "bg-slate-950/30 backdrop-blur-lg text-red-400 border border-red-500/30 hover:bg-slate-950/50 hover:border-red-400 hover:text-red-300 focus:ring-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      },
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    isLoading = false, 
    leftIcon, 
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 
