import { 
  Shield, 
  Phone, 
  AlertTriangle, 
  User, 
  Car, 
  FileText, 
  Users, 
  Stethoscope, 
  Flame,
  Building,
  Briefcase,
  MapPin,
  Search,
  Database,
  ClipboardList,
  Settings,
  BookOpen
} from 'lucide-react';
import { MDTModule, Department } from '@/shared/types';

// Определяем модули для каждого департамента
const dispatchModules: MDTModule[] = [
  {
    id: 'dispatch-portal',
    name: 'Портал диспетчера',
    icon: Phone,
    description: 'Основной портал для управления вызовами и юнитами'
  },
  {
    id: 'signals-manager',
    name: 'Управление сигналами',
    icon: Phone,
    description: 'Управление сигналами и вызовами'
  },
  {
    id: 'notifications',
    name: 'Уведомления',
    icon: AlertTriangle,
    description: 'Система уведомлений'
  },
  {
    id: 'unit-management',
    name: 'Управление юнитами',
    icon: Users,
    description: 'Управление активными юнитами'
  },
  {
    id: 'call-history',
    name: 'История вызовов',
    icon: Database,
    description: 'Архив всех вызовов'
  }
];

const lawEnforcementModules: MDTModule[] = [
  {
    id: 'mdt-portal',
    name: 'MDT портал',
    icon: Shield,
    description: 'Основной портал для правоохранительных органов'
  },
  {
    id: 'person-search',
    name: 'Поиск граждан',
    icon: User,
    description: 'Поиск и управление данными граждан'
  },
  {
    id: 'vehicle-search',
    name: 'Поиск ТС',
    icon: Car,
    description: 'Поиск транспортных средств'
  },
  {
    id: 'weapon-search',
    name: 'Поиск оружия',
    icon: Shield,
    description: 'Поиск зарегистрированного оружия'
  },
  {
    id: 'address-search',
    name: 'Поиск адресов',
    icon: MapPin,
    description: 'Поиск по адресам'
  },
  {
    id: 'create-report',
    name: 'Составить отчет',
    icon: FileText,
    description: 'Создание отчетов о правонарушениях'
  },
  {
    id: 'reports-list',
    name: 'Отчеты',
    icon: ClipboardList,
    description: 'Просмотр всех отчетов'
  },
  {
    id: 'penal-code',
    name: 'Уголовный кодекс',
    icon: BookOpen,
    description: 'Справочник статей'
  }
];

const emsModules: MDTModule[] = [
  {
    id: 'patient-management',
    name: 'Управление пациентами',
    icon: Stethoscope,
    description: 'Управление медицинскими картами'
  },
  {
    id: 'emergency-calls',
    name: 'Экстренные вызовы',
    icon: AlertTriangle,
    description: 'Обработка экстренных вызовов'
  },
  {
    id: 'medical-reports',
    name: 'Медицинские отчеты',
    icon: FileText,
    description: 'Создание медицинских отчетов'
  },
  {
    id: 'ambulance-tracking',
    name: 'Отслеживание скорой',
    icon: Car,
    description: 'Отслеживание машин скорой помощи'
  }
];

const fireModules: MDTModule[] = [
  {
    id: 'incident-management',
    name: 'Управление инцидентами',
    icon: Flame,
    description: 'Управление пожарными инцидентами'
  },
  {
    id: 'fire-reports',
    name: 'Отчеты о пожарах',
    icon: FileText,
    description: 'Создание отчетов о пожарах'
  },
  {
    id: 'equipment-tracking',
    name: 'Отслеживание оборудования',
    icon: Settings,
    description: 'Управление пожарным оборудованием'
  },
  {
    id: 'fire-truck-tracking',
    name: 'Отслеживание машин',
    icon: Car,
    description: 'Отслеживание пожарных машин'
  }
];

const civilModules: MDTModule[] = [
  {
    id: 'citizen-registration',
    name: 'Регистрация граждан',
    icon: User,
    description: 'Регистрация новых граждан'
  },
  {
    id: 'vehicle-registration',
    name: 'Регистрация ТС',
    icon: Car,
    description: 'Регистрация транспортных средств'
  },
  {
    id: 'weapon-registration',
    name: 'Регистрация оружия',
    icon: Shield,
    description: 'Регистрация оружия'
  },
  {
    id: 'document-requests',
    name: 'Запросы документов',
    icon: FileText,
    description: 'Обработка запросов документов'
  }
];

const adminModules: MDTModule[] = [
  {
    id: 'user-management',
    name: 'Управление пользователями',
    icon: Users,
    description: 'Управление аккаунтами пользователей'
  },
  {
    id: 'system-settings',
    name: 'Настройки системы',
    icon: Settings,
    description: 'Системные настройки MDT'
  },
  {
    id: 'audit-logs',
    name: 'Журнал аудита',
    icon: Database,
    description: 'Просмотр журнала действий'
  },
  {
    id: 'department-management',
    name: 'Управление департаментами',
    icon: Building,
    description: 'Управление департаментами'
  }
];

// Экспортируем конфигурацию департаментов
export const departments: Department[] = [
  {
    id: 'law-enforcement',
    name: 'Правоохранительные органы',
    modules: lawEnforcementModules
  },
  {
    id: 'dispatch',
    name: 'Диспетчерская служба',
    modules: dispatchModules
  },
  {
    id: 'ems',
    name: 'Скорая помощь',
    modules: emsModules
  },
  {
    id: 'fire',
    name: 'Пожарная служба',
    modules: fireModules
  },
  {
    id: 'civil',
    name: 'Гражданские службы',
    modules: civilModules
  },
  {
    id: 'admin',
    name: 'Администрация',
    modules: adminModules
  }
];

// Функция для получения модулей департамента
export const getDepartmentModules = (departmentId: string): MDTModule[] => {
  const department = departments.find(dept => dept.id === departmentId);
  return department?.modules || [];
};

// Функция для получения департамента по ID
export const getDepartment = (departmentId: string): Department | undefined => {
  return departments.find(dept => dept.id === departmentId);
};