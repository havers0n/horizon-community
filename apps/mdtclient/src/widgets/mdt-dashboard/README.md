# MDT Dashboard Widget - Интеграция с реальными данными

## Обзор

Виджет оперативного дашборда (`MdtDashboardWidget`) теперь полностью интегрирован с реальными данными через FSD-архитектуру и поддерживает Real-Time обновления.

## Архитектура

### FSD-слои

```
src/widgets/mdt-dashboard/
├── model/
│   ├── dashboardStore.ts    # Zustand стор для управления состоянием
│   └── index.ts            # Экспорты модели
├── ui/
│   ├── MdtDashboardWidget.tsx  # Основной виджет
│   ├── DashboardProvider.tsx   # Провайдер для инициализации
│   ├── DashboardDemo.tsx       # Демо-компонент
│   └── index.ts               # Экспорты UI
└── index.ts                   # Основные экспорты
```

### Интеграция с API

Виджет использует следующие API из `@/entities/dispatch`:

- `DispatchApi.getCalls911()` - получение активных вызовов
- `DispatchApi.getBolos()` - получение активных BOLO
- `DispatchApi.getDispatchStats()` - получение статистики
- `DispatchApi.getUnits()` - получение юнитов
- `DispatchApi.updateUnitStatus()` - обновление статуса юнита

### Real-Time обновления

Поддерживаются следующие WebSocket события:

- `NEW_CALL` - новый вызов
- `CALL_STATUS_UPDATE` - обновление статуса вызова
- `CALL_COMPLETED` - завершение вызова
- `NEW_BOLO` - новое BOLO
- `BOLO_UPDATE` - обновление BOLO
- `BOLO_REMOVED` - удаление BOLO
- `UNIT_STATUS_UPDATE` - обновление статуса юнита

## Использование

### Базовое использование

```tsx
import { MdtDashboardWidget } from '@/widgets/mdt-dashboard';

function App() {
  return (
    <div className="h-screen bg-secondary-900">
      <MdtDashboardWidget />
    </div>
  );
}
```

### С провайдером (рекомендуется)

```tsx
import { DashboardProvider, MdtDashboardWidget } from '@/widgets/mdt-dashboard';

function App() {
  return (
    <DashboardProvider>
      <div className="h-screen bg-secondary-900">
        <MdtDashboardWidget />
      </div>
    </DashboardProvider>
  );
}
```

### Демо-компонент

```tsx
import { DashboardDemo } from '@/widgets/mdt-dashboard';

function App() {
  return <DashboardDemo />;
}
```

## Состояние

### Основные данные

- `currentOfficer: MDTUnit | null` - текущий офицер
- `activeCalls: Call911[]` - активные вызовы
- `activeBolos: Bolo[]` - активные BOLO
- `stats` - статистика диспетчерской

### Состояние загрузки

- `isLoading: boolean` - флаг загрузки
- `error: string | null` - ошибка
- `isInitialized: boolean` - флаг инициализации

## Действия

### Основные действия

- `initializeDashboard()` - инициализация дашборда
- `fetchDashboardData()` - загрузка всех данных
- `changeOfficerStatus(newStatus)` - изменение статуса офицера

### Управление вызовами

- `addCall(call)` - добавление вызова
- `updateCall(callId, updates)` - обновление вызова
- `removeCall(callId)` - удаление вызова

### Управление BOLO

- `addBolo(bolo)` - добавление BOLO
- `updateBolo(boloId, updates)` - обновление BOLO
- `removeBolo(boloId)` - удаление BOLO

## Хуки

### useDashboardSelectors

Оптимизированные селекторы для получения данных:

```tsx
const { currentOfficer, activeCalls, activeBolos, isLoading, error, stats } = useDashboardSelectors();
```

### useDashboardActions

Действия для управления состоянием:

```tsx
const { initializeDashboard, changeOfficerStatus } = useDashboardActions();
```

### useDashboardRealTime

Хук для настройки Real-Time обновлений (используется автоматически в провайдере).

## Особенности реализации

### Обработка ошибок

- Автоматическое отображение ошибок загрузки
- Кнопка "Повторить" для повторной инициализации
- Graceful degradation при недоступности API

### Производительность

- Оптимизированные селекторы Zustand
- Ленивая загрузка данных
- Эффективная обработка Real-Time событий

### Адаптивность

- Responsive дизайн
- Поддержка различных размеров экрана
- Оптимизация для планшетов (FiveM)

## Интеграция с FiveM

Виджет полностью совместим с FiveM и может использоваться в игровом интерфейсе планшета.

### Команды чата

Интеграция с командами чата через API:

- `/set [статус]` - изменение статуса юнита
- `/panic` - активация кнопки паники
- `/911 [текст]` - создание вызова

### HUD интеграция

- Отображение текущей игровой зоны
- Индикация загруженности юнитов
- Глобальные сигналы

## Тестирование

### Локальное тестирование

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для FiveM
npm run build:fivem
```

### Демо-режим

Используйте `DashboardDemo` для тестирования без интеграции с FiveM.

## Будущие улучшения

- [ ] Интеграция с картой в реальном времени
- [ ] Расширенные фильтры для вызовов и BOLO
- [ ] Персонализация интерфейса
- [ ] Экспорт данных
- [ ] Интеграция с системой уведомлений