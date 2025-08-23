import type { 
  TransferRequest, 
  AvailableTransferDepartment, 
  CreateTransferRequestDto 
} from '@/shared/api/cabinet-service';

// Re-export types for consistency
export type { 
  TransferRequest, 
  AvailableTransferDepartment, 
  CreateTransferRequestDto 
};

// Утилитарные типы для UI
export type TransferRequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface TransferRequestStatusConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
}

// Конфигурация статусов для Badge компонента
export const TRANSFER_REQUEST_STATUS_CONFIG: Record<TransferRequestStatus, TransferRequestStatusConfig> = {
  pending: {
    variant: 'secondary',
    label: 'Ожидает рассмотрения'
  },
  in_review: {
    variant: 'secondary',
    label: 'На рассмотрении'
  },
  approved: {
    variant: 'default', 
    label: 'Одобрена'
  },
  rejected: {
    variant: 'destructive',
    label: 'Отклонена'
  }
};

// Utility functions for UI formatting
export const formatTransferRequestStatus = (statusCode: string): { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline' 
} => {
  const config = TRANSFER_REQUEST_STATUS_CONFIG[statusCode as TransferRequestStatus];
  
  if (!config) {
    return { label: 'Неизвестно', variant: 'outline' };
  }
  
  return {
    label: config.label,
    variant: config.variant
  };
};

export const formatDepartmentName = (departmentName: string | null | undefined): string => {
  if (!departmentName) return 'Не указан';
  return departmentName;
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