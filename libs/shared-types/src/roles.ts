// ===========================================
// ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ ДЛЯ РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
// ===========================================

/**
 * Все возможные роли пользователей в системе
 * Этот файл является единственным источником истины для ролей
 * 
 * ПРИ ИЗМЕНЕНИИ РОЛЕЙ:
 * 1. Обновите этот файл
 * 2. Запустите миграцию БД: npm run db:migrate
 * 3. Сгенерируйте типы: npm run db:sync
 * 4. Обновите документацию
 */

// Основные роли пользователей (Personal Cabinet)
export const USER_ROLES = {
  'CITIZEN': 'citizen',
  'CANDIDATE': 'candidate',
  'STAFF': 'staff',
  'ADMIN': 'admin'
} as const;

// MDT-специфичные роли (для экстренных служб)
export const MDT_ROLES = {
  'CITIZEN': 'citizen',
  'LEO': 'leo',
  'EMS': 'ems',
  'FD': 'fd',
  'DISPATCH': 'dispatch',
  'ADMIN': 'admin'
} as const;

// Типы для TypeScript
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type MDTRole = typeof MDT_ROLES[keyof typeof MDT_ROLES];

// Union тип для всех возможных ролей
export type AllRoles = UserRole | MDTRole;

// Функции для проверки ролей
export const isUserRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLES).includes(role as UserRole);
};

export const isMDTRole = (role: string): role is MDTRole => {
  return Object.values(MDT_ROLES).includes(role as MDTRole);
};

export const isAllRoles = (role: string): role is AllRoles => {
  return isUserRole(role) || isMDTRole(role);
};

// Функции для определения типа пользователя
export const isCandidate = (role: string): boolean => {
  return role === USER_ROLES.CANDIDATE;
};

export const isMember = (role: string): boolean => {
  return role === USER_ROLES.STAFF || role === USER_ROLES.ADMIN;
};

export const isCitizen = (role: string): boolean => {
  return role === USER_ROLES.CITIZEN;
};

export const isAdmin = (role: string): boolean => {
  return role === USER_ROLES.ADMIN || role === MDT_ROLES.ADMIN;
};

export const isEmergencyService = (role: string): boolean => {
  return [
    MDT_ROLES.LEO,
    MDT_ROLES.EMS, 
    MDT_ROLES.FD,
    MDT_ROLES.DISPATCH,
    MDT_ROLES.ADMIN
  ].includes(role as any);
};

// Маппинг ролей для отображения
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.CITIZEN]: 'Гражданский',
  [USER_ROLES.CANDIDATE]: 'Кандидат',
  [USER_ROLES.STAFF]: 'Участник сообщества',
  [USER_ROLES.ADMIN]: 'Администратор',
  [MDT_ROLES.LEO]: 'Полиция',
  [MDT_ROLES.EMS]: 'Скорая помощь',
  [MDT_ROLES.FD]: 'Пожарная служба',
  [MDT_ROLES.DISPATCH]: 'Диспетчер'
} as const;

// Получить отображаемое имя роли
export const getRoleDisplayName = (role: string): string => {
  if (role === USER_ROLES.ADMIN || role === MDT_ROLES.ADMIN) {
    return 'Администратор';
  }
  return ROLE_DISPLAY_NAMES[role as keyof typeof ROLE_DISPLAY_NAMES] || 'Неизвестная роль';
};

// Цвета для ролей (для UI)
export const ROLE_COLORS = {
  [USER_ROLES.CITIZEN]: 'blue',
  [USER_ROLES.CANDIDATE]: 'yellow',
  [USER_ROLES.STAFF]: 'green',
  [USER_ROLES.ADMIN]: 'red',
  [MDT_ROLES.LEO]: 'blue',
  [MDT_ROLES.EMS]: 'red',
  [MDT_ROLES.FD]: 'orange',
  [MDT_ROLES.DISPATCH]: 'purple'
} as const;

// Получить цвет роли
export const getRoleColor = (role: string): string => {
  if (role === USER_ROLES.ADMIN || role === MDT_ROLES.ADMIN) {
    return 'red';
  }
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'gray';
};

// Экспорт для обратной совместимости
export { USER_ROLES as UserRoles, MDT_ROLES as MDTRoles };
