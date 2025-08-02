# API Тесты для RolePlay Identity Server

Этот каталог содержит комплексную систему тестов для API сервера RolePlay Identity.

## Структура тестов

```
tests/
├── api/                    # API тесты
│   ├── auth.test.ts       # Тесты аутентификации
│   ├── applications.test.ts # Тесты заявок
│   ├── reports.test.ts    # Тесты рапортов
│   ├── notifications.test.ts # Тесты уведомлений
│   ├── departments.test.ts # Тесты департаментов
│   ├── health.test.ts     # Тесты health check
│   ├── middleware.test.ts # Тесты middleware
│   ├── integration.test.ts # Интеграционные тесты
│   ├── performance.test.ts # Тесты производительности
│   └── security.test.ts   # Тесты безопасности
├── services/              # Тесты сервисов
├── integration/           # Интеграционные тесты
└── setup.ts              # Настройка тестового окружения
```

## Запуск тестов

### Установка зависимостей

```bash
npm install
```

### Запуск всех тестов

```bash
npm test
```

### Запуск конкретных категорий тестов

```bash
# Только API тесты
npm run test:api

# Только тесты безопасности
npm run test:security

# Только тесты производительности
npm run test:performance

# Только интеграционные тесты
npm run test:e2e

# Тесты с покрытием кода
npm run test:coverage
```

### Запуск тестов в режиме watch

```bash
npm run test:watch
```

## Типы тестов

### 1. Unit тесты (API)
- **auth.test.ts** - Тестирование регистрации, входа, выхода
- **applications.test.ts** - Тестирование CRUD операций с заявками
- **reports.test.ts** - Тестирование работы с рапортами
- **notifications.test.ts** - Тестирование системы уведомлений
- **departments.test.ts** - Тестирование управления департаментами
- **health.test.ts** - Тестирование health check эндпоинтов

### 2. Middleware тесты
- **middleware.test.ts** - Тестирование аутентификации, авторизации, обработки ошибок

### 3. Интеграционные тесты
- **integration.test.ts** - Полные пользовательские сценарии
- Тестирование взаимодействия между компонентами

### 4. Тесты производительности
- **performance.test.ts** - Тестирование времени отклика, нагрузки, памяти

### 5. Тесты безопасности
- **security.test.ts** - Тестирование уязвимостей, валидации, авторизации

## Конфигурация тестов

### Jest конфигурация
Тесты используют Jest с TypeScript поддержкой. Конфигурация находится в `jest.config.ts`:

```typescript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/**/*.ts',
    'services/**/*.ts',
    'middleware/**/*.ts',
    'routes/**/*.ts'
  ]
}
```

### Переменные окружения
Тесты используют отдельный файл `.env.test` для изоляции от продакшн данных.

## Моки и заглушки

### Storage моки
Все тесты используют моки для storage слоя:

```typescript
jest.mock('../../storage', () => ({
  storage: {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    // ... другие методы
  }
}));
```

### Supabase моки
Supabase клиент также мокируется для изоляции тестов:

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: { createUser: jest.fn() },
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));
```

## Примеры тестов

### Тест аутентификации
```typescript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.user.username).toBe('testuser');
  });
});
```

### Тест безопасности
```typescript
describe('Input Validation Security', () => {
  it('should prevent SQL injection', async () => {
    const maliciousData = {
      username: "'; DROP TABLE users; --",
      email: "'; DROP TABLE users; --",
      password: "'; DROP TABLE users; --"
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(maliciousData)
      .expect(400);

    expect(response.body.message).toBe('Invalid request data');
  });
});
```

### Тест производительности
```typescript
describe('Response Time Tests', () => {
  it('should respond to health check within 100ms', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

## Покрытие кода

Для генерации отчета о покрытии кода:

```bash
npm run test:coverage
```

Отчет будет создан в папке `coverage/` и будет включать:
- HTML отчет в `coverage/lcov-report/index.html`
- LCOV файл для CI/CD систем
- Консольный отчет

## CI/CD интеграция

Тесты автоматически запускаются в CI/CD пайплайне:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:all

- name: Generate coverage report
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
```

## Отладка тестов

### Включение подробного логирования
```bash
npm test -- --verbose
```

### Запуск одного теста
```bash
npm test -- --testNamePattern="should register a new user"
```

### Запуск тестов с отладкой
```bash
npm test -- --detectOpenHandles --forceExit
```

## Лучшие практики

### 1. Изоляция тестов
- Каждый тест должен быть независимым
- Используйте `beforeEach` для очистки состояния
- Мокируйте внешние зависимости

### 2. Именование тестов
- Используйте описательные имена
- Группируйте связанные тесты в `describe` блоки
- Следуйте паттерну "should do something when condition"

### 3. Проверки
- Тестируйте как успешные, так и неуспешные сценарии
- Проверяйте граничные случаи
- Тестируйте обработку ошибок

### 4. Производительность
- Тесты должны выполняться быстро
- Избегайте реальных HTTP запросов
- Используйте моки для медленных операций

## Устранение неполадок

### Ошибка "Jest did not exit"
```bash
npm test -- --detectOpenHandles --forceExit
```

### Ошибка "Cannot find module"
Проверьте, что все зависимости установлены:
```bash
npm install
```

### Ошибка "Timeout"
Увеличьте таймаут в `jest.config.ts`:
```typescript
testTimeout: 30000, // 30 секунд
```

### Ошибка "Port already in use"
Используйте разные порты для тестов или добавьте задержку:
```typescript
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  server?.close();
});
```

## Дополнительные ресурсы

- [Jest документация](https://jestjs.io/docs/getting-started)
- [Supertest документация](https://github.com/visionmedia/supertest)
- [Express тестирование](https://expressjs.com/en/advanced/best-practices-performance.html#testing)
- [API тестирование лучшие практики](https://martinfowler.com/articles/microservice-testing/) 