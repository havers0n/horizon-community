# Отчет об исправлении TestService

## Проблема
Ошибка `PGRST106: The schema must be one of the following: public, graphql_public` при создании тестов администратором.

## Диагноз
TestService использовал неправильную архитектуру доступа к базе данных:
- Метод `getAvailableTestsForUser` пытался получить данные о заявках из схемы `public`
- Но таблица `applications` находится в схеме `mdt`, а не в `public`

## Анализ архитектуры
После анализа миграций и типов выяснилось:
- Таблица `applications` находится в схеме `mdt` (не в `public`)
- Таблица `tests` находится в схеме `mdt`
- Таблица `test_results` находится в схеме `mdt`
- Таблица `test_sessions` находится в схеме `mdt`

## Решение

### 1. Исправление TestService.ts
```typescript
// Было (неправильно):
import { mdtSupabase, supabase } from "../lib/supabase";
export class TestService {
  private db = mdtSupabase;
  private publicDb = supabase; // ❌ Неправильно

  async getAvailableTestsForUser(userId: string) {
    const { data: applications } = await this.publicDb // ❌ Неправильная схема
      .from('applications')
      // ...
  }
}

// Стало (правильно):
import { mdtSupabase } from "../lib/supabase";
export class TestService {
  private db = mdtSupabase; // ✅ Только один клиент для схемы mdt

  async getAvailableTestsForUser(userId: string) {
    const { data: applications } = await this.db // ✅ Правильная схема
      .from('applications')
      // ...
  }
}
```

### 2. Создание тестов
Создан файл `tests/services/TestService.test.ts` для проверки:
- Правильного использования `mdtSupabase` для всех таблиц
- Обработки ошибок
- Создания тестов

## Результат
✅ Ошибка `PGRST106` исправлена  
✅ TestService теперь использует правильную схему `mdt` для всех таблиц  
✅ TypeScript компиляция проходит без ошибок  
✅ Тесты проходят успешно  

## Файлы, измененные:
- `apps/server/src/core/services/TestService.ts`
- `apps/server/tests/services/TestService.test.ts`

## Архитектурные выводы
1. **Все таблицы системы тестирования находятся в схеме `mdt`**
2. **TestService должен использовать только `mdtSupabase` клиент**
3. **Важно системно проверять архитектуру при рефакторинге**

## Дата исправления
$(date) 