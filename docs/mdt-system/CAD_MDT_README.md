# CAD/MDT System - Документация

## Обзор системы

CAD/MDT (Computer Aided Dispatch / Mobile Data Terminal) - это комплексная система управления ролевой игрой, которая включает:

- **Личный кабинет** - управление заявками, персонажами, документами
- **CAD система** - диспетчерская система для управления юнитами и вызовами
- **MDT интерфейс** - мобильный терминал для игроков
- **WebSocket API** - real-time обновления

## Архитектура системы

### База данных
- **PostgreSQL** с расширенной схемой для CAD/MDT
- **Drizzle ORM** для типизированного доступа к данным
- **Supabase** для аутентификации и хостинга

### Backend
- **Node.js + Express.js** - API сервер
- **WebSocket** - real-time коммуникация
- **JWT** - аутентификация
- **TypeScript** - типизация

### Frontend
- **React + TypeScript** - пользовательский интерфейс
- **Tailwind CSS** - стилизация
- **Radix UI** - компоненты интерфейса
- **React Query** - управление состоянием

## Установка и развертывание

### Предварительные требования
- Node.js 18+
- PostgreSQL 14+
- Supabase аккаунт

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd RolePlayIdentity
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cad_mdt_db

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret

# Server
PORT=5000
NODE_ENV=development
```

### 3. Настройка базы данных

```bash
# Применение миграций
npm run db:migrate

# Или для локальной разработки
npx supabase db push
```

### 4. Запуск системы

```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## Структура базы данных

### Основные таблицы

#### Users (Пользователи)
- Основные данные пользователей
- Роли и права доступа
- CAD токены для игровой интеграции

#### Characters (Персонажи)
- Игровые персонажи пользователей
- Типы: civilian, leo, fire, ems
- Лицензии и медицинская информация

#### Vehicles (Транспортные средства)
- Регистрация ТС
- VIN и номера
- Статус регистрации и страховки

#### Weapons (Оружие)
- Серийные номера
- Регистрация оружия
- Связь с владельцами

#### ActiveUnits (Активные юниты)
- Юниты на смене
- Статусы и местоположение
- Позывные

#### Call911 (Вызовы 911)
- Информация о вызовах
- Приоритеты и статусы
- Привязка к юнитам

## API Endpoints

### Аутентификация
```
POST /api/auth/register - Регистрация
POST /api/auth/login - Вход
GET /api/auth/me - Данные пользователя
```

### CAD API
```
# Персонажи
POST /api/cad/characters - Создать персонажа
GET /api/cad/characters - Список персонажей
GET /api/cad/characters/:id - Детали персонажа
PUT /api/cad/characters/:id - Обновить персонажа
GET /api/cad/characters/search/:query - Поиск персонажей

# Транспортные средства
POST /api/cad/vehicles - Создать ТС
GET /api/cad/vehicles/plate/:plate - Поиск по номеру

# Оружие
POST /api/cad/weapons - Создать оружие
GET /api/cad/weapons/serial/:serial - Поиск по серийному номеру

# Активные юниты
POST /api/cad/onduty - Выйти на смену
PUT /api/cad/status - Изменить статус
POST /api/cad/offduty - Закончить смену
GET /api/cad/active - Список активных юнитов
POST /api/cad/panic - Кнопка паники

# Вызовы 911
POST /api/cad/calls - Создать вызов
GET /api/cad/calls - Список вызовов
PUT /api/cad/calls/:id/attach - Прикрепить юнит
PUT /api/cad/calls/:id/status - Изменить статус

# Отчеты
POST /api/cad/records - Создать отчет

# Игровая интеграция
POST /api/cad/generate-token - Генерация CAD токена
GET /api/cad/me - Данные по CAD токену
```

## WebSocket API

### Подключение
```javascript
const ws = new WebSocket('ws://localhost:5000');
```

### Аутентификация
```javascript
ws.send(JSON.stringify({
  type: 'authenticate',
  data: {
    token: 'your-jwt-token',
    isDispatcher: false
  }
}));
```

### Подписка на каналы
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  data: {
    channels: ['units', 'calls', 'alerts']
  }
}));
```

### События
- `unit_status_update` - обновление статуса юнита
- `unit_location_update` - обновление местоположения
- `new_call` - новый вызов 911
- `call_status_update` - обновление статуса вызова
- `panic_alert` - сигнал паники
- `bolo_alert` - BOLO уведомление

## Использование системы

### 1. Регистрация и вход
1. Перейдите на `/register` для создания аккаунта
2. Войдите в систему через `/login`
3. Получите доступ к личному кабинету

### 2. Создание персонажа
1. Перейдите в CAD/MDT (`/cad`)
2. Нажмите "Создать персонажа"
3. Заполните форму с данными персонажа
4. Выберите тип персонажа (civilian, leo, fire, ems)

### 3. Управление юнитами
1. Создайте персонажа типа leo/fire/ems
2. Отметьте его как юнит
3. Выйдите на смену через "Выйти на смену"
4. Получите позывной и управляйте статусом

### 4. Поиск по базе данных
1. Используйте вкладку "Поиск" в CAD
2. Выберите тип поиска (персонажи, ТС, оружие)
3. Введите поисковый запрос
4. Просмотрите результаты

### 5. Создание вызовов 911
1. Нажмите "Новый вызов 911"
2. Заполните информацию о вызове
3. Укажите приоритет и тип
4. Прикрепите юниты к вызову

## Интеграция с FiveM

### 1. Установка ресурса
Создайте папку `cad_mdt` в папке `resources` вашего сервера.

### 2. Основные файлы
```
cad_mdt/
├── fxmanifest.lua
├── client/
│   ├── main.lua
│   └── ui.lua
├── server/
│   └── main.lua
└── ui/
    ├── index.html
    ├── style.css
    └── script.js
```

### 3. Команды
```lua
-- Аутентификация
/sn-auth <token> - Аутентификация в CAD

-- Управление статусом
/set status <status> - Изменить статус юнита
/panic - Активировать кнопку паники

-- Создание отчетов
/tstop <plate> - Создать отчет о траффик-стопе
/arrest <id> - Создать отчет об аресте

-- Вызовы 911
/911 <location> <description> - Создать вызов 911
```

### 4. ALPR (Automatic License Plate Recognition)
```lua
-- В client/main.lua
RegisterNetEvent('cad:checkPlate')
AddEventHandler('cad:checkPlate', function(plate)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle ~= 0 then
        local plateText = GetVehicleNumberPlateText(vehicle)
        if plateText == plate then
            -- Отправить запрос на сервер CAD
            TriggerServerEvent('cad:plateCheck', plate)
        end
    end
end)
```

## Безопасность

### 1. Аутентификация
- JWT токены для API
- CAD токены для игровой интеграции
- Проверка ролей и прав доступа

### 2. Валидация данных
- Zod схемы для валидации
- Проверка типов данных
- Санитизация входных данных

### 3. RLS (Row Level Security)
- Политики доступа к данным
- Изоляция данных пользователей
- Проверка прав на уровне БД

## Мониторинг и логирование

### 1. Логи
- API запросы и ответы
- WebSocket соединения
- Ошибки и исключения

### 2. Метрики
- Количество активных юнитов
- Статистика вызовов
- Производительность системы

### 3. Алерты
- Сигналы паники
- Критические ошибки
- Превышение лимитов

## Разработка

### 1. Структура проекта
```
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Общие типы и схемы
├── supabase/        # Миграции и конфигурация
└── docs/           # Документация
```

### 2. Команды разработки
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшна
npm run db:push      # Применение миграций
npm run test         # Запуск тестов
```

### 3. Добавление новых функций
1. Создайте миграцию для новых таблиц
2. Добавьте схемы в `shared/schema.ts`
3. Создайте API endpoints в `server/routes/`
4. Добавьте UI компоненты в `client/src/`
5. Обновите документацию

## Поддержка

### 1. Известные проблемы
- WebSocket соединения могут прерываться при длительном бездействии
- Большие объемы данных могут замедлить поиск

### 2. Часто задаваемые вопросы
**Q: Как изменить позывной юнита?**
A: Позывные генерируются автоматически на основе департамента.

**Q: Можно ли иметь несколько персонажей?**
A: Да, один пользователь может создать несколько персонажей разных типов.

**Q: Как интегрировать с другими системами?**
A: Используйте REST API или WebSocket для интеграции.

### 3. Контакты
- GitHub Issues для багов
- Discord для поддержки
- Email для коммерческих запросов

## Лицензия

MIT License - см. файл LICENSE для деталей.

---

**Версия документации:** 1.0.0  
**Последнее обновление:** 2024  
**Автор:** CAD/MDT Development Team 