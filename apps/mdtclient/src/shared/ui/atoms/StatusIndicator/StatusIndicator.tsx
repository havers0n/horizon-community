import React from 'react';
import { cn } from '@/shared/lib/utils';

export type StatusVariant = 
  | 'available'    // Доступен (зеленый)
  | 'unavailable'  // Недоступен (красный)
  | 'busy'         // Занят (желтый)
  | 'enroute'      // В пути (синий)
  | 'on-scene'     // На месте (оранжевый)
  | 'offline'      // Офлайн (серый)
  | 'panic'        // Паника (красный мигающий)
  | 'custom';      // Кастомный цвет

export interface StatusIndicatorProps {
  variant?: StatusVariant;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
  customColor?: string;
}

const statusVariants = {
  available: 'bg-green-500 border-green-400',
  unavailable: 'bg-red-500 border-red-400',
  busy: 'bg-yellow-500 border-yellow-400',
  enroute: 'bg-blue-500 border-blue-400',
  'on-scene': 'bg-orange-500 border-orange-400',
  offline: 'bg-gray-500 border-gray-400',
  panic: 'bg-red-600 border-red-500 animate-pulse',
  custom: '',
};

const sizeVariants = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  variant = 'offline',
  size = 'md',
  animated = false,
  className,
  children,
  customColor,
}) => {
  const baseClasses = cn(
    'inline-block rounded-full border-2 transition-all duration-200',
    sizeVariants[size],
    variant !== 'custom' && statusVariants[variant],
    animated && 'animate-pulse',
    className
  );

  const customStyle = variant === 'custom' && customColor ? { backgroundColor: customColor, borderColor: customColor } : {};

  return (
    <div className="inline-flex items-center gap-2">
      <div 
        className={baseClasses}
        style={customStyle}
      />
      {children && (
        <span className="text-sm text-secondary-300">
          {children}
        </span>
      )}
    </div>
  );
};
