import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        // Основные варианты - темный фон с цветными рамками
        default: "bg-slate-800/50 text-blue-400 border border-blue-500/50 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300",
        secondary: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200",
        destructive: "bg-slate-800/50 text-red-400 border border-red-500/50 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300",
        outline: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200",
        success: "bg-slate-800/50 text-green-400 border border-green-500/50 hover:bg-slate-800/70 hover:border-green-400 hover:text-green-300",
        warning: "bg-slate-800/50 text-yellow-400 border border-yellow-500/50 hover:bg-slate-800/70 hover:border-yellow-400 hover:text-yellow-300",
        error: "bg-slate-800/50 text-red-400 border border-red-500/50 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300",
        info: "bg-slate-800/50 text-blue-400 border border-blue-500/50 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300",
        glass: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200 backdrop-blur-sm",
        neon: "bg-slate-800/50 text-blue-400 border border-blue-500/70 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        
        // Новый тактический вариант
        tactical: "bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-800/70 hover:border-slate-500 hover:text-slate-200",
        tacticalSuccess: "bg-slate-800/50 text-green-400 border border-green-500/50 hover:bg-slate-800/70 hover:border-green-400 hover:text-green-300",
        tacticalWarning: "bg-slate-800/50 text-yellow-400 border border-yellow-500/50 hover:bg-slate-800/70 hover:border-yellow-400 hover:text-yellow-300",
        tacticalDanger: "bg-slate-800/50 text-red-400 border border-red-500/50 hover:bg-slate-800/70 hover:border-red-400 hover:text-red-300",
        tacticalInfo: "bg-slate-800/50 text-blue-400 border border-blue-500/50 hover:bg-slate-800/70 hover:border-blue-400 hover:text-blue-300",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants }; 
