# Отчет об исправлении ошибки ReferenceError: require is not defined

## Проблема
В проекте возникла ошибка `ReferenceError: require is not defined` при запуске сервера. Эта ошибка является очень распространенной при переходе с CommonJS на ES Modules.

## Диагноз
Проект использует современный стандарт модулей ES Modules (ESM), который использует синтаксис `import/export`. Ошибка возникла потому, что в некоторых файлах был использован старый синтаксис CommonJS — `require()`.

## Найденные проблемы

### 1. Файл: `apps/server/src/api/routes/v1/tests.ts`
**Строка 18:**
```typescript
// НЕПРАВИЛЬНО (CommonJS)
const TestController = require('../../../core/controllers/TestController').TestController;
```

**Исправление:**
```typescript
// ПРАВИЛЬНО (ESM)
import { TestController } from '../../../core/controllers/TestController';
```

### 2. Файл: `apps/server/src/api/routes/realtime.ts`
**Строка 73:**
```typescript
// НЕПРАВИЛЬНО (CommonJS)
const wsServer = require('../websocket.js').getCADWebSocket();
```

**Исправление:**
```typescript
// ПРАВИЛЬНО (ESM)
import { getCADWebSocket } from '../../websocket.js';
const wsServer = getCADWebSocket();
```

## Выполненные изменения

1. **Добавлен импорт TestController** в файл `tests.ts`
2. **Добавлен импорт getCADWebSocket** в файл `realtime.ts`
3. **Заменены все использования require()** на соответствующие импорты

## Результат
- ✅ Ошибка `ReferenceError: require is not defined` полностью устранена
- ✅ Сервер успешно запускается и отвечает на запросы
- ✅ API endpoint `/api/health` возвращает статус 200
- ✅ Все основные файлы приложения теперь используют ESM синтаксис

## Дополнительные замечания
- Использование `require()` в тестовых файлах и конфигурационных файлах (tailwind.config.ts) является нормальным и не требует исправления
- Остальные ошибки в тестах связаны с конфигурацией Jest и отсутствующими модулями, но не с проблемой `require()`

## Рекомендации
1. При добавлении нового кода всегда использовать `import/export` синтаксис
2. Настроить ESLint для автоматического обнаружения использования `require()` в TypeScript файлах
3. Рассмотреть возможность добавления pre-commit хуков для проверки синтаксиса модулей 