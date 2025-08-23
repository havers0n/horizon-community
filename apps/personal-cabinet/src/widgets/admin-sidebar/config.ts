import React from 'react';
import {
  Home,
  Users,
  Shield,
  Building2,
  FileText,
  Image,
  BookOpen,
  TestTube,
  Settings,
  BarChart3,
  Database,
  CalendarDays,
  UserX
} from 'lucide-react';

type IconComponent = React.ComponentType<{ className?: string }>;

// Описываем один пункт меню
export interface NavItem {
  label: string; // "Пользователи"
  href: string; // "/admin/users"
  icon: IconComponent;
  // Список пермишенов, наличие ХОТЯ БЫ ОДНОГО из которых открывает доступ
  requiredPermissions: string[];
}

// Описываем группу пунктов меню
export interface NavGroup {
  title: string; // "УПРАВЛЕНИЕ"
  items: NavItem[];
}

// Конфигурация всего меню
export const ADMIN_SIDEBAR_CONFIG: NavGroup[] = [
  {
    title: 'ДАШБОРД',
    items: [
      {
        label: 'Главная',
        href: '/admin',
        icon: Home,
        requiredPermissions: ['admin.panel.access'],
      },
    ],
  },
  {
    title: 'УПРАВЛЕНИЕ',
    items: [
      {
        label: 'Пользователи',
        href: '/admin/users',
        icon: Users,
        requiredPermissions: ['admin.users.read', 'admin.users.manage'],
      },
      {
        label: 'Роли и Доступы',
        href: '/admin/roles',
        icon: Shield,
        requiredPermissions: ['admin.roles.read', 'admin.roles.manage'],
      },
      {
        label: 'Отделы',
        href: '/admin/departments',
        icon: Building2,
        requiredPermissions: ['admin.departments.read', 'admin.departments.manage'],
      },
      {
        label: 'Управление отпусками',
        href: '/admin/leave-management',
        icon: CalendarDays,
        requiredPermissions: ['admin.leave.manage', 'admin.leave.approve'],
      },
      {
        label: 'Управление совмещениями',
        href: '/admin/joint-positions',
        icon: UserX,
        requiredPermissions: ['admin.joint_positions.manage'],
      },
    ],
  },
  {
    title: 'КОНТЕНТ',
    items: [
      {
        label: 'Заявки кандидатов',
        href: '/admin/applications',
        icon: FileText,
        requiredPermissions: ['applications.manage', 'applications.approve'],
      },
      {
        label: 'Модерация Галереи',
        href: '/admin/gallery',
        icon: Image,
        requiredPermissions: ['gallery.moderate'],
      },
      {
        label: 'Документы',
        href: '/admin/documents',
        icon: BookOpen,
        requiredPermissions: ['documents.manage'],
      },
      {
        label: 'Тесты и Экзамены',
        href: '/admin/tests',
        icon: TestTube,
        requiredPermissions: ['tests.manage', 'tests.view', 'tests.create', 'tests.edit', 'tests.delete'],
      },
    ],
  },
  {
    title: 'СИСТЕМА',
    items: [
      {
        label: 'Общие настройки',
        href: '/admin/settings',
        icon: Settings,
        requiredPermissions: ['admin.settings.manage'],
      },
      {
        label: 'Аналитика',
        href: '/admin/analytics',
        icon: BarChart3,
        requiredPermissions: ['admin.analytics.view'],
      },
      {
        label: 'Резервное копирование',
        href: '/admin/backup',
        icon: Database,
        requiredPermissions: ['admin.backup.manage'],
      },
    ],
  },
];