#!/usr/bin/env node

/**
 * Скрипт для синхронизации ролей пользователей
 * 
 * Этот скрипт автоматически обновляет все места, где используются роли:
 * 1. База данных (миграции)
 * 2. TypeScript типы
 * 3. Серверные enum'ы
 * 4. Клиентские типы
 * 
 * Использование:
 * npm run sync:roles
 * npm run sync:roles -- --add-role=moderator
 * npm run sync:roles -- --remove-role=guest
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Конфигурация
const CONFIG = {
  rolesFile: 'libs/shared-types/src/roles.ts',
  serverRolesFile: 'apps/server/src/core/services/UserService.ts',
  mdtRolesFile: 'apps/mdtclient/types.ts',
  dbTypesFile: 'packages/db-types/src/index.ts',
  migrationsDir: 'supabase/migrations'
};

// Основные роли (из roles.ts)
const MAIN_ROLES = {
  CITIZEN: 'citizen',
  CANDIDATE: 'candidate',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// MDT роли
const MDT_ROLES = {
  CITIZEN: 'citizen',
  LEO: 'leo',
  EMS: 'ems',
  FD: 'fd',
  DISPATCH: 'dispatch',
  ADMIN: 'admin'
};

/**
 * Генерирует содержимое файла ролей
 */
function generateRolesFileContent() {
  return `// ===========================================
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
export const USER_ROLES = ${JSON.stringify(MAIN_ROLES, null, 2).replace(/"/g, "'")} as const;

// MDT-специфичные роли (для экстренных служб)
export const MDT_ROLES = ${JSON.stringify(MDT_ROLES, null, 2).replace(/"/g, "'")} as const;

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
  ].includes(role as MDTRole);
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
  [MDT_ROLES.DISPATCH]: 'Диспетчер',
  [MDT_ROLES.ADMIN]: 'Администратор MDT'
} as const;

// Получить отображаемое имя роли
export const getRoleDisplayName = (role: string): string => {
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
  [MDT_ROLES.DISPATCH]: 'purple',
  [MDT_ROLES.ADMIN]: 'red'
} as const;

// Получить цвет роли
export const getRoleColor = (role: string): string => {
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'gray';
};

// Экспорт для обратной совместимости
export { USER_ROLES as UserRoles, MDT_ROLES as MDTRoles };
`;
}

/**
 * Генерирует содержимое серверного файла ролей
 */
function generateServerRolesFileContent() {
  const roles = Object.values(MAIN_ROLES);
  const enumContent = roles.map(role => `  ${role.toUpperCase()} = '${role}'`).join(',\n');
  
  return `import { USER_ROLES } from '@roleplay-identity/shared-types';

export enum UserRole {
${enumContent}
}

// Функции для проверки ролей (используют централизованные функции)
export { 
  isCandidate, 
  isMember, 
  isCitizen, 
  isAdmin,
  isEmergencyService,
  getRoleDisplayName,
  getRoleColor 
} from '@roleplay-identity/shared-types';

export class UserService {
  // ... остальной код сервиса
}`;
}

/**
 * Генерирует содержимое MDT файла ролей
 */
function generateMDTRolesFileContent() {
  const roles = Object.values(MDT_ROLES);
  const enumContent = roles.map(role => `  ${role.toUpperCase()} = '${role}'`).join(',\n');
  
  return `// MDT Client Types
import { MDT_ROLES } from '@roleplay-identity/shared-types';

export enum UserRole {
${enumContent}
}

// Экспортируем функции из централизованного файла
export { 
  isMDTRole,
  isEmergencyService,
  getRoleDisplayName,
  getRoleColor 
} from '@roleplay-identity/shared-types';
`;
}

/**
 * Создает миграцию для добавления новой роли
 */
function createMigrationForNewRole(roleName) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationName = `${timestamp}_add_role_${roleName}.sql`;
  const migrationPath = path.join(CONFIG.migrationsDir, migrationName);
  
  const migrationContent = `-- Добавление новой роли: ${roleName}
-- Миграция создана автоматически скриптом sync-roles.mjs

-- Добавляем новую роль в enum
ALTER TYPE "public"."user_role" ADD VALUE '${roleName}';

-- Обновляем комментарий к типу
COMMENT ON TYPE "public"."user_role" IS 'Роли пользователей: ${Object.values(MAIN_ROLES).join(', ')}, ${roleName}';
`;

  return { path: migrationPath, content: migrationContent };
}

/**
 * Основная функция синхронизации
 */
async function syncRoles() {
  console.log('🔄 Начинаем синхронизацию ролей...');
  
  try {
    // 1. Обновляем основной файл ролей
    console.log('📝 Обновляем основной файл ролей...');
    await fs.writeFile(CONFIG.rolesFile, generateRolesFileContent());
    
    // 2. Обновляем серверный файл
    console.log('🖥️ Обновляем серверные роли...');
    await fs.writeFile(CONFIG.serverRolesFile, generateServerRolesFileContent());
    
    // 3. Обновляем MDT файл
    console.log('📱 Обновляем MDT роли...');
    await fs.writeFile(CONFIG.mdtRolesFile, generateMDTRolesFileContent());
    
    // 4. Генерируем типы БД
    console.log('🗄️ Генерируем типы базы данных...');
    execSync('npm run db:sync', { stdio: 'inherit' });
    
    console.log('✅ Синхронизация ролей завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при синхронизации ролей:', error);
    process.exit(1);
  }
}

/**
 * Добавляет новую роль
 */
async function addRole(roleName) {
  console.log(`➕ Добавляем новую роль: ${roleName}`);
  
  // Добавляем роль в константы
  MAIN_ROLES[roleName.toUpperCase()] = roleName;
  
  // Создаем миграцию
  const migration = createMigrationForNewRole(roleName);
  await fs.writeFile(migration.path, migration.content);
  
  console.log(`📄 Создана миграция: ${migration.path}`);
  
  // Запускаем синхронизацию
  await syncRoles();
  
  console.log(`✅ Роль ${roleName} успешно добавлена!`);
  console.log('📋 Следующие шаги:');
  console.log('1. Проверьте созданную миграцию');
  console.log('2. Запустите: npm run db:migrate');
  console.log('3. Протестируйте новую роль');
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const addRoleArg = args.find(arg => arg.startsWith('--add-role='));

if (addRoleArg) {
  const roleName = addRoleArg.split('=')[1];
  addRole(roleName);
} else {
  syncRoles();
} 