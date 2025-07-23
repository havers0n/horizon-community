# РУКОВОДСТВО ПО ТЕСТИРОВАНИЮ ДЛЯ ВЫЯВЛЕНИЯ БАГОВ

## Быстрый старт

### 1. Установка зависимостей для тестирования

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  supertest \
  playwright \
  @types/jest \
  @types/supertest
```

### 2. Запуск тестов

#### Все тесты
```bash
npm run test:all
```

#### Отдельные типы тестов
```bash
# API тесты
npm run test:api

# Тесты компонентов
npm run test:components

# Тесты безопасности
npm run test:security

# Тесты производительности
npm run test:performance

# E2E тесты
npm run test:e2e

# Нагрузочные тесты
npm run test:load
```

## Типы тестов

### 1. Модульные тесты (Unit Tests)

**Назначение:** Тестирование отдельных функций и компонентов

**Файлы:** `tests/api/`, `tests/components/`

**Примеры:**
- Валидация форм
- API endpoints
- React компоненты
- Утилиты и хуки

**Запуск:**
```bash
npm run test:api
npm run test:components
```

### 2. Тесты безопасности

**Назначение:** Выявление уязвимостей

**Файлы:** `tests/security/`

**Проверяемые аспекты:**
- SQL инъекции
- XSS атаки
- CSRF защита
- JWT безопасность
- Rate limiting
- Валидация входных данных

**Запуск:**
```bash
npm run test:security
```

### 3. Тесты производительности

**Назначение:** Проверка производительности под нагрузкой

**Файлы:** `tests/performance/`

**Проверяемые аспекты:**
- Время ответа API
- Нагрузочное тестирование
- Использование памяти
- Одновременные запросы
- Оптимизация базы данных

**Запуск:**
```bash
npm run test:performance
npm run test:load
```

### 4. E2E тесты

**Назначение:** Тестирование полных пользовательских сценариев

**Файлы:** `tests/e2e/`

**Проверяемые сценарии:**
- Регистрация и вход
- Создание заявок
- Работа с рапортами
- Навигация по сайту
- Адаптивность

**Запуск:**
```bash
npm run test:e2e
```

## Основные баги, которые выявляют тесты

### 1. API баги
- ❌ Неверные HTTP статусы
- ❌ Отсутствие валидации данных
- ❌ SQL инъекции
- ❌ Отсутствие аутентификации
- ❌ Утечки данных

### 2. UI баги
- ❌ Компоненты не рендерятся
- ❌ Неправильная обработка состояний
- ❌ Проблемы с доступностью
- ❌ Ошибки в формах
- ❌ Проблемы с мобильной версией

### 3. Безопасность
- ❌ XSS уязвимости
- ❌ CSRF атаки
- ❌ Небезопасные JWT токены
- ❌ Отсутствие rate limiting
- ❌ Утечка конфиденциальных данных

### 4. Производительность
- ❌ Медленные запросы
- ❌ Утечки памяти
- ❌ Проблемы с базой данных
- ❌ Неэффективные алгоритмы
- ❌ Большой размер бандла

## Интерпретация результатов

### Успешные тесты ✅
```
✓ should create a new application with valid data
✓ should prevent SQL injection in login
✓ should handle concurrent user registrations
```

### Проваленные тесты ❌
```
✗ should reject application with missing required fields
  Expected: 400
  Received: 201
```

### Критические ошибки 🚨
```
● Security Test: SQL Injection
  Expected: 400 or 401
  Received: 500 (Internal Server Error)
```

## Отладка багов

### 1. Анализ логов
```bash
# Подробные логи тестов
npm run test:api -- --verbose

# Логи с покрытием кода
npm run test:coverage
```

### 2. Отладка конкретного теста
```bash
# Запуск одного теста
npm test -- --testNamePattern="should create application"

# Запуск в режиме отладки
npm test -- --detectOpenHandles --forceExit
```

### 3. Анализ покрытия кода
```bash
npm run test:coverage
```
Откройте `coverage/lcov-report/index.html` в браузере

## CI/CD интеграция

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:all
      - run: npm run test:e2e
```

### Автоматические проверки
- Все тесты должны проходить
- Покрытие кода > 80%
- Время выполнения тестов < 5 минут
- Отсутствие критических уязвимостей

## Мониторинг качества

### Метрики
- **Покрытие кода:** > 80%
- **Время выполнения тестов:** < 5 минут
- **Количество багов:** < 10 критических
- **Время исправления багов:** < 24 часа

### Отчеты
```bash
# Генерация отчета о покрытии
npm run test:coverage

# Отчет о производительности
npm run test:performance

# Отчет о безопасности
npm run test:security
```

## Часто встречающиеся баги

### 1. Проблемы с аутентификацией
```typescript
// ❌ Неправильно
if (user.role === 'admin') {
  // доступ разрешен
}

// ✅ Правильно
if (user.role === 'admin' && user.isActive) {
  // доступ разрешен
}
```

### 2. SQL инъекции
```typescript
// ❌ Небезопасно
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Безопасно
const query = 'SELECT * FROM users WHERE email = $1';
```

### 3. XSS уязвимости
```typescript
// ❌ Небезопасно
element.innerHTML = userInput;

// ✅ Безопасно
element.textContent = userInput;
```

### 4. Проблемы с производительностью
```typescript
// ❌ Неэффективно
for (let i = 0; i < 10000; i++) {
  await db.query('SELECT * FROM users');
}

// ✅ Эффективно
const users = await db.query('SELECT * FROM users LIMIT 10000');
```

## Рекомендации

### 1. Регулярное тестирование
- Запускайте тесты перед каждым коммитом
- Настройте автоматические тесты в CI/CD
- Проводите нагрузочное тестирование еженедельно

### 2. Приоритизация багов
- **Критические:** Безопасность, краши приложения
- **Высокие:** Функциональность, производительность
- **Средние:** UI/UX, доступность
- **Низкие:** Косметические проблемы

### 3. Документирование
- Ведите баг-трекер
- Документируйте найденные проблемы
- Создавайте тесты для регрессий

### 4. Обучение команды
- Изучайте новые техники тестирования
- Анализируйте результаты тестов
- Улучшайте процессы разработки

---

**Примечание:** Регулярное тестирование помогает выявлять баги на ранних стадиях и поддерживать высокое качество кода. 