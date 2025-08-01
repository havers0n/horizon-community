# План разработки: Диспетчерский модуль + Общая информационная панель
## Приоритетная задача: Доведение до рабочего состояния

---

## 📋 Текущее состояние анализа

### ✅ Что уже реализовано:
- Базовая структура `DispatchPortal` с вкладками
- `MdtDashboardWidget` с виджетами статуса и статистики
- `DashboardContext` для управления виджетами
- Базовая интеграция с Real-Time системой
- UI-компоненты (Card, Button, Badge, Tabs)

### ⚠️ Что требует доработки:
- Интеграция с бэкендом API
- Обработка вызовов 911
- Управление юнитами
- Карта и геолокация
- Система уведомлений

---

## 🎯 Фаза 1: Базовый функционал диспетчера (Неделя 1-2)

### 1.1 Интеграция с API
**Статус**: 🔄 В процессе
**Приоритет**: КРИТИЧНО

#### Задачи:
- [ ] **Создать API клиенты**
  ```typescript
  // src/shared/api/dispatch.ts
  export class DispatchApi {
    static async getActiveCalls(): Promise<Call911[]>
    static async getActiveUnits(): Promise<Unit[]>
    static async getActiveBolos(): Promise<BOLO[]>
    static async updateUnitStatus(unitId: string, status: UnitStatus): Promise<void>
    static async assignUnitToCall(callId: string, unitId: string): Promise<void>
  }
  ```

- [ ] **Обновить типы в shared/types**
  ```typescript
  // Добавить недостающие типы
  export interface DispatchStats {
    activeUnitsCount: number;
    activeCallsCount: number;
    activeBolosCount: number;
    pendingCallsCount: number;
  }
  
  export interface UnitAssignment {
    callId: string;
    unitId: string;
    assignedAt: string;
    status: 'assigned' | 'en_route' | 'on_scene' | 'cleared';
  }
  ```

#### Файлы для работы:
```
src/shared/api/dispatch.ts
src/shared/types/index.ts
src/features/dispatch-system/api/
```

### 1.2 Обработка вызовов 911
**Статус**: 📋 Планируется
**Приоритет**: ВЫСОКИЙ

#### Задачи:
- [ ] **Создать компонент CallQueue**
  ```typescript
  // src/widgets/call-queue-widget/ui/CallQueue.tsx
  interface CallQueueProps {
    calls: Call911[];
    onCallSelect: (call: Call911) => void;
    onAssignUnit: (callId: string, unitId: string) => void;
  }
  ```

- [ ] **Создать модальное окно обработки звонка**
  ```typescript
  // src/features/call-management/ui/IncomingCallModal.tsx
  interface IncomingCallModalProps {
    call: Call911;
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
  }
  ```

- [ ] **Реализовать логику статусов вызовов**
  - `pending` → `assigned` → `en_route` → `on_scene` → `resolved`

#### Файлы для работы:
```
src/widgets/call-queue-widget/
src/features/call-management/
src/entities/dispatch/
```

### 1.3 Управление юнитами
**Статус**: 🔄 Частично реализовано
**Приоритет**: ВЫСОКИЙ

#### Задачи:
- [ ] **Создать компонент UnitList**
  ```typescript
  // src/widgets/unit-list-widget/ui/UnitList.tsx
  interface UnitListProps {
    units: Unit[];
    onUnitSelect: (unit: Unit) => void;
    onStatusChange: (unitId: string, status: UnitStatus) => void;
  }
  ```

- [ ] **Реализовать фильтрацию юнитов**
  - По департаменту (PD, EMS, FD)
  - По статусу (доступен, занят, на вызове)
  - По квалификации (TU, K-9, etc.)

- [ ] **Добавить детальную информацию о юните**
  - Текущий статус и местоположение
  - История вызовов
  - Квалификации и оборудование

#### Файлы для работы:
```
src/widgets/unit-list-widget/
src/features/unit-management/
src/entities/dispatch/
```

---

## 🗺️ Фаза 2: Карта и геолокация (Неделя 3-4)

### 2.1 Интерактивная карта
**Статус**: 🔄 Частично реализовано
**Приоритет**: ВЫСОКИЙ

#### Задачи:
- [ ] **Интегрировать карту GTA**
  ```typescript
  // src/features/gta-map/ui/GTAMap.tsx
  interface GTAMapProps {
    units: Unit[];
    calls: Call911[];
    onUnitClick: (unit: Unit) => void;
    onCallClick: (call: Call911) => void;
  }
  ```

- [ ] **Отображение юнитов на карте**
  - Метки с иконками по типу департамента
  - Цветовая индикация статуса
  - Анимация при движении

- [ ] **Отображение вызовов на карте**
  - Блипы с приоритетом
  - Возможность перемещения
  - Детальная информация при клике

#### Файлы для работы:
```
src/features/gta-map/
src/widgets/map-widget/
src/shared/ui/atoms/MapMarker/
```

### 2.2 Геолокация и слежение
**Статус**: 📋 Планируется
**Приоритет**: СРЕДНИЙ

#### Задачи:
- [ ] **Real-time обновление позиций**
  ```typescript
  // src/hooks/useRealTimeLocation.ts
  export const useRealTimeLocation = (unitId: string) => {
    // Подписка на обновления позиции юнита
  }
  ```

- [ ] **Слежение за юнитом**
  - Автоматическое центрирование карты
  - Плавное перемещение камеры
  - Индикация направления движения

- [ ] **Геофенсинг**
  - Определение зоны ответственности
  - Уведомления о выходе из зоны
  - Автоматическое назначение ближайших юнитов

#### Файлы для работы:
```
src/hooks/useRealTimeLocation.ts
src/features/gta-map/
src/shared/utils/geolocation.ts
```

---

## 📊 Фаза 3: Общая информационная панель (Неделя 5-6)

### 3.1 Настраиваемые виджеты
**Статус**: 🔄 Частично реализовано
**Приоритет**: ВЫСОКИЙ

#### Задачи:
- [ ] **Создать виджет "Активные юниты"**
  ```typescript
  // src/shared/ui/widgets/ActiveUnitsWidget.tsx
  interface ActiveUnitsWidgetProps {
    units: Unit[];
    department?: string;
    onUnitClick: (unit: Unit) => void;
  }
  ```

- [ ] **Создать виджет "Вызовы 911"**
  ```typescript
  // src/shared/ui/widgets/Calls911Widget.tsx
  interface Calls911WidgetProps {
    calls: Call911[];
    onCallClick: (call: Call911) => void;
  }
  ```

- [ ] **Создать виджет "BOLO"**
  ```typescript
  // src/shared/ui/widgets/BoloWidget.tsx
  interface BoloWidgetProps {
    bolos: BOLO[];
    onBoloClick: (bolo: BOLO) => void;
  }
  ```

#### Файлы для работы:
```
src/shared/ui/widgets/
src/widgets/mdt-dashboard/
src/contexts/DashboardContext.tsx
```

### 3.2 Drag-and-drop интерфейс
**Статус**: 📋 Планируется
**Приоритет**: СРЕДНИЙ

#### Задачи:
- [ ] **Интегрировать react-grid-layout**
  ```bash
  npm install react-grid-layout
  ```

- [ ] **Создать компонент DashboardGrid**
  ```typescript
  // src/widgets/mdt-dashboard/ui/DashboardGrid.tsx
  interface DashboardGridProps {
    widgets: DashboardWidget[];
    onWidgetMove: (widgetId: string, position: Position) => void;
    onWidgetResize: (widgetId: string, size: Size) => void;
  }
  ```

- [ ] **Реализовать сохранение конфигурации**
  - Автоматическое сохранение в localStorage
  - Экспорт/импорт настроек
  - Сброс к настройкам по умолчанию

#### Файлы для работы:
```
src/widgets/mdt-dashboard/
src/contexts/DashboardContext.tsx
src/shared/ui/molecules/DraggableWidget/
```

### 3.3 Статистика и аналитика
**Статус**: 📋 Планируется
**Приоритет**: НИЗКИЙ

#### Задачи:
- [ ] **Создать виджет "Статистика"**
  ```typescript
  // src/shared/ui/widgets/StatsWidget.tsx
  interface StatsWidgetProps {
    stats: DispatchStats;
    timeRange: 'hour' | 'day' | 'week';
  }
  ```

- [ ] **Добавить графики и диаграммы**
  - График активности по времени
  - Распределение вызовов по типам
  - Загруженность юнитов

#### Файлы для работы:
```
src/shared/ui/widgets/StatsWidget.tsx
src/shared/ui/atoms/Chart/
src/features/analytics/
```

---

## 🔔 Фаза 4: Система уведомлений (Неделя 7-8)

### 4.1 Real-time уведомления
**Статус**: 🔄 Частично реализовано
**Приоритет**: ВЫСОКИЙ

#### Задачи:
- [ ] **Создать NotificationCenter**
  ```typescript
  // src/features/notifications/ui/NotificationCenter.tsx
  interface NotificationCenterProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onDismiss: (notificationId: string) => void;
  }
  ```

- [ ] **Типы уведомлений**
  - Новый вызов 911
  - Изменение статуса юнита
  - Активация BOLO
  - Кнопка паники
  - Сигнал 100

- [ ] **Звуковые уведомления**
  ```typescript
  // src/shared/utils/sound.ts
  export const playNotificationSound = (type: NotificationType) => {
    // Воспроизведение звука в зависимости от типа
  }
  ```

#### Файлы для работы:
```
src/features/notifications/
src/shared/ui/molecules/Notification/
src/shared/utils/sound.ts
```

### 4.2 Система сигналов
**Статус**: 🔄 Частично реализовано
**Приоритет**: СРЕДНИЙ

#### Задачи:
- [ ] **Создать SignalsManager**
  ```typescript
  // src/features/dispatch-system/ui/SignalsManager.tsx
  interface SignalsManagerProps {
    onSignalSend: (signal: Signal) => void;
  }
  ```

- [ ] **Реализовать сигналы**
  - Сигнал 100 (глобальный)
  - Сигналы для департаментов
  - Персональные сигналы

#### Файлы для работы:
```
src/features/dispatch-system/
src/shared/types/index.ts (добавить Signal)
```

---

## 🔧 Фаза 5: Исправление технического долга (Параллельно)

### 5.1 TypeScript ошибки
**Статус**: 🚨 Критично
**Приоритет**: КРИТИЧНО

#### Задачи:
- [ ] **Исправить @ts-nocheck в диспетчерских файлах**
  - `DispatchPortal.tsx`
  - `MdtDashboardWidget.tsx`
  - `CallQueueWidget.tsx`
  - `UnitListWidget.tsx`

- [ ] **Добавить типы для API ответов**
  - Типизировать все API методы
  - Создать интерфейсы для ошибок
  - Добавить валидацию данных

#### Файлы для работы:
```
src/widgets/dispatch-portal/
src/widgets/mdt-dashboard/
src/shared/api/
```

### 5.2 Оптимизация производительности
**Статус**: 📋 Планируется
**Приоритет**: СРЕДНИЙ

#### Задачи:
- [ ] **Мемоизация компонентов**
  ```typescript
  // Использовать React.memo для тяжелых компонентов
  export const UnitList = React.memo<UnitListProps>(({ units, onUnitSelect }) => {
    // Компонент
  });
  ```

- [ ] **Оптимизация Real-time обновлений**
  - Дебаунсинг обновлений
  - Селективная подписка на изменения
  - Кэширование данных

#### Файлы для работы:
```
src/hooks/useRealTime.ts
src/contexts/DashboardContext.tsx
```

---

## 📅 Детальный график разработки

### Неделя 1: API и базовый функционал
**День 1-2**: Создание API клиентов и типов
**День 3-4**: Интеграция с DispatchPortal
**День 5**: Тестирование базового функционала

### Неделя 2: Обработка вызовов и юниты
**День 1-2**: CallQueue и IncomingCallModal
**День 3-4**: UnitList и управление статусами
**День 5**: Интеграция и тестирование

### Неделя 3: Карта (часть 1)
**День 1-2**: Интеграция карты GTA
**День 3-4**: Отображение юнитов и вызовов
**День 5**: Интерактивность карты

### Неделя 4: Карта (часть 2)
**День 1-2**: Геолокация и слежение
**День 3-4**: Геофенсинг
**День 5**: Оптимизация карты

### Неделя 5: Общая панель (часть 1)
**День 1-2**: Создание виджетов
**День 3-4**: Интеграция с DashboardContext
**День 5**: Настройка отображения

### Неделя 6: Общая панель (часть 2)
**День 1-2**: Drag-and-drop интерфейс
**День 3-4**: Сохранение конфигурации
**День 5**: Статистика и аналитика

### Неделя 7: Уведомления (часть 1)
**День 1-2**: NotificationCenter
**День 3-4**: Типы уведомлений
**День 5**: Звуковые уведомления

### Неделя 8: Уведомления (часть 2)
**День 1-2**: Система сигналов
**День 3-4**: Интеграция с диспетчером
**День 5**: Финальное тестирование

---

## 🎯 Критерии готовности

### MVP (Конец недели 2)
- ✅ API интеграция работает
- ✅ Обработка вызовов 911
- ✅ Управление юнитами
- ✅ Базовая карта

### Beta (Конец недели 6)
- ✅ Полная функциональность диспетчера
- ✅ Настраиваемая общая панель
- ✅ Интерактивная карта
- ✅ Real-time обновления

### Production (Конец недели 8)
- ✅ Система уведомлений
- ✅ Оптимизация производительности
- ✅ Исправлен технический долг
- ✅ Полное тестирование

---

## 📋 Чек-лист для разработчиков

### Перед началом работы:
- [ ] Изучить существующий код DispatchPortal
- [ ] Понять структуру DashboardContext
- [ ] Настроить API endpoints на бэкенде
- [ ] Ознакомиться с Real-time системой

### При разработке:
- [ ] Следовать архитектуре FSD
- [ ] Использовать типы из shared/types
- [ ] Создавать истории в Storybook
- [ ] Тестировать Real-time обновления

### При интеграции:
- [ ] Проверять совместимость API
- [ ] Тестировать производительность
- [ ] Убедиться в работе уведомлений
- [ ] Проверить сохранение настроек

---

## 🔗 Связи с другими модулями

### Зависимости:
- **Auth**: Для авторизации диспетчеров
- **Real-time**: Для live обновлений
- **API**: Для работы с данными

### Влияние на другие модули:
- **LAW**: Использует диспетчерские данные
- **EMS/FD**: Получают назначения через диспетчера
- **Citizen**: Создают вызовы 911

---

*Документ обновлен: [Дата]*
*Версия: 1.0*
*Статус: Актуально* 