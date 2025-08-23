// Типы для заявок на отпуск
export interface LeaveRequest {
  id: string; // uuid
  start_date: string; // date string 'YYYY-MM-DD'
  end_date: string; // date string 'YYYY-MM-DD'
  reason: string;
  created_at: string; // timestamp string
  status_name: string; // e.g., 'На рассмотрении', 'Одобрен', 'Отклонен'
  status_code: string; // e.g., 'in_review', 'approved', 'rejected'
  approver_full_name: string | null;
}

export interface CreateLeaveRequestDto {
  p_start_date: string; // date string 'YYYY-MM-DD'
  p_end_date: string; // date string 'YYYY-MM-DD'
  p_reason: string;
}

// Утилитарные типы для UI
export type LeaveStatus = 'in_review' | 'approved' | 'rejected';

export interface LeaveStatusConfig {
  variant: 'warning' | 'success' | 'destructive' | 'default';
  label: string;
}

// Конфигурация статусов для Badge компонента
export const LEAVE_STATUS_CONFIG: Record<LeaveStatus, LeaveStatusConfig> = {
  in_review: {
    variant: 'warning',
    label: 'На рассмотрении'
  },
  approved: {
    variant: 'success', 
    label: 'Одобрен'
  },
  rejected: {
    variant: 'destructive',
    label: 'Отклонен'
  }
};

// Утилиты для форматирования дат
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate).toLocaleDateString('ru-RU');
  const end = new Date(endDate).toLocaleDateString('ru-RU');
  return `${start} - ${end}`;
};

export const formatCreatedAt = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};