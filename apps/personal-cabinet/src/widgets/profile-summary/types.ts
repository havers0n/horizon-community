// Типы для RPC функции get_my_dashboard_profile()
export interface DashboardProfileData {
  // Основная информация пользователя
  user: {
    id: string;
    username: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
  
  // Членства в департаментах/подразделениях
  memberships: Array<{
    department_name: string;
    division_name?: string | null;
    rank_name: string;
    is_primary: boolean;
  }>;
  
  // Квалификации
  qualifications: Array<{
    id: string;
    name: string;
    code?: string;
  }>;
  
  // Предупреждения
  warnings: {
    community: number;
    game: number;
  };
  
  // Статус отпуска
  leave_status: {
    is_on_leave: boolean;
    end_date?: string | null;
  } | null;
}

// Пропсы для компонента ProfileSummaryWidget
export interface ProfileSummaryWidgetProps {
  className?: string;
}

// Интерфейсы для внутренней работы компонента
export interface MembershipDisplay {
  departmentName: string;
  divisionName?: string | null;
  rankName: string;
  isPrimary: boolean;
  displayText: string;
}

export interface QualificationDisplay {
  id: string;
  name: string;
  code?: string;
}