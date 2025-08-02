# 🚀 КРАТКОЕ РУКОВОДСТВО ПО ЗАПУСКУ

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ТРЕБОВАНИЯ

- Node.js 18+ 
- PostgreSQL (через Supabase)
- Настроенные переменные окружения

## ⚡ БЫСТРЫЙ ЗАПУСК

### 1. Установка зависимостей
```bash
# В корневой папке проекта
npm install

# В папке сервера
cd apps/server
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` в папке `apps/server`:

```env
# База данных
DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:[YOUR-PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
DB_PASSWORD=your_password_here

# Supabase
SUPABASE_URL=https://axgtvvcimqoyxbfvdrok.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Клиент
CLIENT_URL=http://localhost:3000

# Порт сервера
PORT=5002
```

### 3. Запуск сервера
```bash
cd apps/server
npm run dev
```

### 4. Запуск клиента
```bash
cd apps/mdtclient
npm start
```

## 🧪 ТЕСТИРОВАНИЕ API

### Проверка здоровья сервера
```bash
curl http://127.0.0.1:5002/api/health
```

### Тестирование базы данных
```bash
# Получение статистики
curl http://127.0.0.1:5002/api/database/stats

# Получение списка департаментов
curl http://127.0.0.1:5002/api/database/departments

# Получение списка граждан (требует аутентификации)
curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:5002/api/database/citizens
```

### Тестирование поиска
```bash
# Поиск граждан
curl "http://127.0.0.1:5002/api/database/search/citizens?query=John&limit=5"

# Поиск транспортных средств
curl "http://127.0.0.1:5002/api/database/search/vehicles?query=ABC123&limit=5"
```

## 🔐 АУТЕНТИФИКАЦИЯ

### Получение токена
1. Зарегистрируйтесь/войдите через Supabase
2. Получите JWT токен
3. Используйте токен в заголовке `Authorization: Bearer YOUR_TOKEN`

### CAD токен для игровой интеграции
```bash
# Генерация CAD токена (требует аутентификации)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:5002/api/auth/cad-token
```

## 📊 МОНИТОРИНГ

### Логи сервера
Сервер выводит подробные логи в консоль:
- Запросы и ответы
- Ошибки аутентификации
- Время выполнения запросов

### Метрики производительности
```bash
# Статистика системы
curl http://127.0.0.1:5002/api/database/stats
```

## 🐛 ОТЛАДКА

### Частые проблемы

1. **Ошибка подключения к БД**
   - Проверьте переменные окружения
   - Убедитесь, что Supabase доступен

2. **Ошибки аутентификации**
   - Проверьте валидность токена
   - Убедитесь, что пользователь активен

3. **CORS ошибки**
   - Проверьте настройки CLIENT_URL
   - Убедитесь, что клиент запущен на правильном порту

### Логи ошибок
Все ошибки логируются в консоль сервера с подробной информацией.

## 📁 СТРУКТУРА ФАЙЛОВ

```
apps/
├── server/
│   ├── services/
│   │   ├── DatabaseService.ts    # Централизованное управление БД
│   │   └── AuthService.ts        # Единая аутентификация
│   ├── routes/
│   │   └── database.ts           # Новые API маршруты
│   ├── middleware/
│   │   └── auth.middleware.ts    # Обновленная аутентификация
│   └── server.ts                 # Обновленный сервер
└── mdtclient/
    └── src/
        └── services/
            └── api.ts            # Обновленный API клиент
```

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Тестирование всех функций**
2. **Интеграция с клиентской частью**
3. **Настройка WebSocket**
4. **Оптимизация FiveM интеграции**

## 📞 ПОДДЕРЖКА

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности переменных окружения
3. Проверьте подключение к базе данных
4. Обратитесь к документации API

---

**Статус**: ✅ Готов к использованию  
**Версия**: 1.0.0  
**Дата**: Декабрь 2024 