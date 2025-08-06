# 🧪 Тестирование API эндпоинтов

Этот проект содержит полную систему тестирования API эндпоинтов для системы тестирования RolePlay Identity.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd tests
npm run setup
```

### 2. Настройка переменных окружения
Отредактируйте файл `postman-environment.json`:
```json
{
  "base_url": "http://localhost:3000",
  "user_token": "ваш_токен_пользователя",
  "admin_token": "ваш_токен_администратора"
}
```

### 3. Запуск тестов

#### Через Postman (рекомендуется для разработки):
1. Импортируйте `postman-collection.json` в Postman
2. Импортируйте `postman-environment.json` как окружение
3. Выберите окружение в Postman
4. Запустите коллекцию

#### Через командную строку:
```bash
# Запуск всех тестов
npm run test:all

# Только API тесты (Mocha)
npm run test:api

# Только Postman тесты (Newman)
npm run test:postman

# Прямой запуск Newman
npm run test:newman
```

## 📁 Структура файлов

```
tests/
├── api-tests.js              # Тесты API через Mocha/Chai
├── run-api-tests.js          # Скрипт запуска API тестов
├── postman-collection.json   # Коллекция Postman
├── postman-environment.json  # Переменные окружения
├── run-postman-tests.js      # Скрипт запуска Postman тестов
├── POSTMAN_TESTING_GUIDE.md  # Подробное руководство
├── test-results/             # Результаты тестов
└── package.json              # Зависимости и скрипты
```

## 🔧 API эндпоинты

### Публичные API:
- `GET /api/tests` - доступные тесты
- `GET /api/tests/:id` - детали теста
- `POST /api/tests/:id/passing/start` - начало теста
- `POST /api/tests/:id/passing/end` - отправка ответов
- `GET /api/result` - результаты теста

### Административные API:
- `GET /api/tests` (admin) - управление тестами
- `POST /api/tests/new` - создание теста
- `GET /api/dashboard` - аналитика
- `POST /api/admin/accept` - одобрение теста
- `POST /api/admin/decline` - отклонение теста

## 📊 Результаты тестирования

Результаты сохраняются в папке `test-results/`:
- `newman-results.json` - детальные результаты Newman
- `newman-report.html` - HTML отчет
- `api-test-report-*.json` - отчеты с временными метками

## 🐛 Устранение неполадок

### Частые проблемы:

1. **Ошибка 403 Unauthorized**
   - Проверьте правильность токенов в `postman-environment.json`
   - Убедитесь, что токены не истекли

2. **Ошибка 404 Not Found**
   - Проверьте правильность `base_url`
   - Убедитесь, что сервер запущен

3. **Newman не установлен**
   ```bash
   npm install -g newman
   ```

4. **Зависимости не установлены**
   ```bash
   npm install
   ```

## 📖 Дополнительная документация

- [Подробное руководство по Postman](POSTMAN_TESTING_GUIDE.md)
- [Документация Newman](https://learning.postman.com/docs/running-collections/using-newman-cli/)
- [Документация Mocha](https://mochajs.org/)

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что все зависимости установлены
3. Проверьте настройки переменных окружения
4. Обратитесь к подробному руководству

---

**Примечание**: Убедитесь, что ваш сервер API запущен перед началом тестирования!
