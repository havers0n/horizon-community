// Утилитарные типы для UI
export type JointPositionStatus = 'in_review' | 'approved' | 'rejected';

export interface JointPositionStatusConfig {
  variant: 'warning' | 'success' | 'destructive' | 'default';
  label: string;
}

// Конфигурация статусов для Badge компонента
export const JOINT_POSITION_STATUS_CONFIG: Record<JointPositionStatus, JointPositionStatusConfig> = {
  in_review: {
    variant: 'warning',
    label: 'На рассмотрении'
  },
  approved: {
    variant: 'success', 
    label: 'Одобрено'
  },
  rejected: {
    variant: 'destructive',
    label: 'Отклонено'
  }
};

// Утилиты для форматирования дат
export const formatCreatedAt = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};