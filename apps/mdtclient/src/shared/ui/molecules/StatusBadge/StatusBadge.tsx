import React from 'react';
import { Badge } from '@/shared/ui/atoms/Badge';
import { cn } from '@/shared/lib/utils';

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'completed' 
  | 'error' 
  | 'warning' 
  | 'info'
  | 'success'
  | 'danger'
  | 'default';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  active: {
    variant: 'success' as const,
    label: 'Активен',
    icon: '🟢',
  },
  inactive: {
    variant: 'secondary' as const,
    label: 'Неактивен',
    icon: '⚪',
  },
  pending: {
    variant: 'warning' as const,
    label: 'В ожидании',
    icon: '🟡',
  },
  completed: {
    variant: 'success' as const,
    label: 'Завершено',
    icon: '✅',
  },
  error: {
    variant: 'error' as const,
    label: 'Ошибка',
    icon: '❌',
  },
  warning: {
    variant: 'warning' as const,
    label: 'Предупреждение',
    icon: '⚠️',
  },
  info: {
    variant: 'info' as const,
    label: 'Информация',
    icon: 'ℹ️',
  },
  success: {
    variant: 'success' as const,
    label: 'Успешно',
    icon: '✅',
  },
  danger: {
    variant: 'error' as const,
    label: 'Опасно',
    icon: '🚨',
  },
  default: {
    variant: 'default' as const,
    label: 'По умолчанию',
    icon: '🔵',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  showIcon = true,
}) => {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-1", className)}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{displayLabel}</span>
    </Badge>
  );
}; 
