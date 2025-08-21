# Backlog: Admin Cleanup, Analytics, Docs Protection

Краткий бэклог согласованных задач по админке (/admin), аналитике и защите документации.

## 1) База данных и агрегации

- [ ] Создать таблицу `system.analytics_events`
  - Поля: `id uuid pk`, `created_at timestamptz default now()`, `user_id uuid`, `ip inet`, `user_agent text`,
    `event_type text`, `route_key text`, `resource_kind text`, `resource_id uuid`, `metadata jsonb`
  - Индексы: `(created_at desc)`, `(event_type)`, `(user_id, created_at)`, `(resource_kind, resource_id, created_at)`
  - RLS: insert — только аутентифицированные; select — только с `analytics.read`
- [ ] Представления/агрегации
  - [ ] `system.v_analytics_daily(date, event_type, route_key, count, users_count)`
  - [ ] `system.v_docs_events(doc_id, event_type, count, last_seen)`

## 2) Сервер: сбор и защита событий

- [ ] POST `/api/v1/analytics/events` — батчевый приём событий
  - Zod-схема: массив до N=50, валидация размеров `metadata`
  - Обогащение: ip/ua из запроса; user_id из токена
  - Возврат: `{ success: true }`
- [ ] Rate-limit (мягкий)
  - По `user_id` и/или IP, окно 60–120 сек для «шумных» событий (например, `admin.visit`)

## 3) Клиент: дешёвая телеметрия

- [ ] /admin — лог визита разделов
  - Отправка `admin.visit` при смене маршрута (`route_key`), debounce 60–120 сек
- [ ] /docs — лог и блокировки
  - [ ] Событие `docs.view` при открытии документа
  - [ ] Блок `copy/print/contextmenu/drag` в области просмотра + лог `docs.copy_attempt_blocked`/`docs.print_attempt_blocked`
  - [ ] Водяной знак (имя/дата) поверх контента; `user-select: none` на viewer
- [ ] /tests — расширенная телеметрия
  - [ ] Доп. лог `test.focus_lost` в `analytics_events` при фиксации потери фокуса

## 4) Админка: структура и «мертвый» функционал

- [ ] Реестр фич (/admin)
  - Единый список: `code`, `title`, `permission[]`, `path`, `component`, `enabled`
  - Источник флагов: локальный конфиг + override с бэкенда (опционально)
- [ ] Меню и роуты из реестра
  - Генерация бокового меню/маршрутов из реестра (группы, сортировка, бейджи `New/Deprecated`)
- [ ] Чистка мертвого кода
  - На базе телеметрии за 1–2 недели: экраны без трафика — `deprecated` → удалить
  - Удалить демо-блоки и статические заглушки
- [ ] Code-splitting
  - Lazy-load страниц /admin; prefetch по наведению

## 5) Единый контракт тестов

- [ ] Везде использовать ID опций (не текст) при выборе и отправке
  - Привести фронт к `{ optionId }`/`{ selectedOptionIds: [] }`
  - Сервер уже поддерживает нормализацию и множественные ответы

## 6) Качество, CI и доступ

- [ ] Ввести permission `analytics.read`, закрыть доступ к отчетам
- [ ] Подключить `ts-prune` в CI и `eslint-plugin-import` (`no-unused-modules`)
- [ ] Минимальные e2e smoke-тесты для ключевых сценариев /admin
  - Список → Создание → Редактирование → Удаление; проверка 403/404 по правам

## 7) Документация (ADR)

- [ ] ADR: Архитектура админки и аналитики
  - Фичефлаги, реестр, навигация, сбор событий, приватность, доступ

---

Примечания
- «Дешёвая аналитика» = минимальная инфраструктура, без внешних SDK, легко отключается.
- Наша цель — не «идеальная блокировка копирования», а фиксация попыток и усложнение несанкционированного копирования.


