// --- НОВЫЙ КОД для src/entities/user/model.ts ---
import type { Database } from '@roleplay-identity/db-types';

// 1. Определяем базовые типы прямо из сгенерированной схемы
type ProfileDbRow = Database['public']['Tables']['profiles']['Row'];
type CharacterDbRow = Database['common']['Tables']['characters']['Row'];

// 2. Определяем наш чистый, удобный интерфейс для UI
export interface User {
  id: string;
  email: string | null;
  username: string | null;
  role: string; // В актуальной схеме роль в profiles отсутствует; используем строку
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  // Дополнительные поля для расширенной функциональности
  department?: string;
  division?: string;
  isActive?: boolean;
  gameWarnings?: number;
  adminWarnings?: number;
  attemptsLeft?: number; // Количество попыток для кандидатов
  profileImageUrl?: string;
}

// 3. Создаем функцию-маппер, которая "собирает" наш UI-объект User
// из сырых данных, полученных с бэкенда.
// 'Partial' используется, чтобы character мог быть необязательным.
export function normalizeUser(profile: ProfileDbRow, character?: Partial<CharacterDbRow>): User {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    role: 'citizen',
    // На бэкенде avatar_url может быть, а может и нет в таблице profiles,
    // поэтому проверяем его наличие.
    avatarUrl: 'avatar_url' in profile ? (profile as any).avatar_url : null,
    firstName: character?.first_name || null,
    lastName: character?.last_name || null,
    // Дополнительные поля с значениями по умолчанию
    department: undefined, // Будет заполнено из других источников
    division: undefined, // Будет заполнено из других источников
    isActive: true, // По умолчанию пользователь активен
    gameWarnings: 0,
    adminWarnings: 0,
    attemptsLeft: 3, // По умолчанию 3 попытки для кандидатов
    profileImageUrl: character?.mugshot_url || undefined,
  };
}

// 4. Утилиты для работы с пользователем (остаются без изменений)
export function getUserDisplayName(user: Partial<User>): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email?.split('@')[0] || 'Пользователь';
}

export function getUserInitials(user: Partial<User>): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  return 'П';
}

// 5. Добавляем недостающие типы для дашборда
// (Временные заглушки, чтобы код компилировался. Позже можно вынести в свои entities)
export interface Activity {
  id: string;
  type: string;
  status: string;
  title: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  priority: string;
}