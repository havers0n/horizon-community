# Управление ролями пользователей

## 🎯 Обзор

Система ролей в RolePlay Identity построена на принципе **"Единый источник истины"**. Все роли определяются в одном месте и автоматически синхронизируются между всеми компонентами системы.

## 📁 Структура ролей

### Основные роли (Personal Cabinet)
- `citizen` - Гражданский пользователь
- `candidate` - Кандидат на вступление
- `staff` - Участник сообщества
- `admin` - Администратор

### MDT роли (Экстренные службы)
- `citizen` - Гражданский
- `leo` - Полиция (Law Enforcement Officer)
- `ems` - Скорая помощь (Emergency Medical Services)
- `fd` - Пожарная служба (Fire Department)
- `dispatch` - Диспетчер
- `admin` - Администратор MDT

## 🔧 Добавление новой роли

### Автоматический способ (Рекомендуется)

```bash
# Добавить новую роль
npm run sync:roles -- --add-role=moderator

# Синхронизировать существующие роли
npm run sync:roles
```

### Ручной способ

1. **Обновите файл ролей:**
   ```typescript
   // libs/shared-types/src/roles.ts
   export const USER_ROLES = {
     CITIZEN: 'citizen',
     CANDIDATE: 'candidate',
     STAFF: 'staff',
     ADMIN: 'admin',
     MODERATOR: 'moderator' // ← Добавьте новую роль
   } as const;
   ```

2. **Создайте миграцию БД:**
   ```sql
   -- supabase/migrations/YYYYMMDDHHMMSS_add_role_moderator.sql
   ALTER TYPE "public"."user_role" ADD VALUE 'moderator';
   ```

3. **Запустите синхронизацию:**
   ```bash
   npm run sync:roles
   npm run db:migrate
   ```

## 📋 Процесс синхронизации

При запуске `npm run sync:roles` автоматически обновляются:

1. **Основной файл ролей** (`libs/shared-types/src/roles.ts`)
2. **Серверные enum'ы** (`apps/server/src/core/services/UserService.ts`)
3. **MDT типы** (`apps/mdtclient/types.ts`)
4. **Типы базы данных** (`packages/db-types/src/index.ts`)

## 🎨 Использование ролей в коде

### Импорт функций

```typescript
import { 
  isCandidate, 
  isMember, 
  isCitizen, 
  isAdmin,
  getRoleDisplayName,
  getRoleColor 
} from '@roleplay-identity/shared-types';
```

### Проверка ролей

```typescript
// Проверка конкретных ролей
if (isCandidate(user.role)) {
  // Логика для кандидатов
}

if (isMember(user.role)) {
  // Логика для участников (staff, admin)
}

if (isCitizen(user.role)) {
  // Логика для граждан
}

if (isAdmin(user.role)) {
  // Логика для администраторов
}
```

### Отображение ролей

```typescript
// Получить отображаемое имя
const displayName = getRoleDisplayName(user.role); // "Гражданский"

// Получить цвет для UI
const color = getRoleColor(user.role); // "blue"
```

## 🔒 Безопасность

### Валидация ролей

```typescript
import { isUserRole, isMDTRole, isAllRoles } from '@roleplay-identity/shared-types';

// Проверка, что роль является валидной
if (!isUserRole(user.role)) {
  throw new Error(`Неизвестная роль: ${user.role}`);
}

// Проверка MDT ролей
if (isMDTRole(user.role)) {
  // Логика для экстренных служб
}
```

### Проверка прав доступа

```typescript
// Функция для проверки доступа к функциям
const hasAccess = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Использование
if (hasAccess(user.role, ['admin', 'staff'])) {
  // Разрешить доступ
}
```

## 🚨 Важные правила

### ✅ Что делать

1. **Всегда используйте централизованные функции** из `@roleplay-identity/shared-types`
2. **Запускайте синхронизацию** после изменения ролей
3. **Создавайте миграции** для изменений в БД
4. **Тестируйте новые роли** в разных частях системы

### ❌ Что НЕ делать

1. **Не создавайте локальные enum'ы** ролей в приложениях
2. **Не хардкодите роли** в строках
3. **Не забывайте обновлять типы** после изменения ролей
4. **Не игнорируйте миграции** БД

## 🔄 Workflow для новых ролей

### 1. Планирование
- Определите назначение роли
- Выберите подходящее имя
- Определите права доступа

### 2. Реализация
```bash
# Добавить роль
npm run sync:roles -- --add-role=moderator

# Применить миграцию
npm run db:migrate

# Проверить типы
npm run check
```

### 3. Тестирование
- Проверьте работу в Personal Cabinet
- Проверьте работу в MDT
- Проверьте API endpoints
- Проверьте права доступа

### 4. Документация
- Обновите этот файл
- Обновите API документацию
- Обновите пользовательскую документацию

## 🛠️ Устранение неполадок

### Проблема: Роль не синхронизируется

```bash
# Проверьте статус
npm run sync:roles

# Принудительная пересборка
npm run force-rebuild
```

### Проблема: Ошибки типизации

```bash
# Проверьте типы
npm run check

# Пересоберите типы БД
npm run db:sync
```

### Проблема: Роль не работает в UI

1. Проверьте, что роль добавлена в `ROLE_DISPLAY_NAMES`
2. Проверьте, что роль добавлена в `ROLE_COLORS`
3. Убедитесь, что функция `getRoleDisplayName` обновлена

## 📊 Мониторинг

### Проверка использования ролей

```bash
# Найти все использования ролей в коде
grep -r "isCandidate\|isMember\|isCitizen" apps/
grep -r "USER_ROLES\|MDT_ROLES" libs/
```

### Аудит ролей

Регулярно проверяйте:
- Какие роли используются в коде
- Какие роли есть в БД
- Какие роли определены в типах
- Соответствие между всеми источниками

## 🔮 Будущие улучшения

1. **Автоматическая валидация** - проверка соответствия ролей между компонентами
2. **Визуальный редактор ролей** - веб-интерфейс для управления ролями
3. **Аудит изменений** - отслеживание истории изменений ролей
4. **Тесты ролей** - автоматические тесты для проверки работы ролей 