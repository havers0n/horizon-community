# Storybook Guide - Руководство по разработке UI-компонентов

## Обзор

Storybook - это инструмент для разработки и тестирования UI-компонентов в изоляции. В нашем проекте мы используем Storybook для создания качественной и тестируемой UI-библиотеки.

## Структура историй

### 1. Атомы (Atoms) - Базовые компоненты
Расположение: `src/shared/ui/atoms/`

**Компоненты с историями:**
- ✅ Button - Кнопки с различными вариантами и состояниями
- ✅ Input - Поля ввода с валидацией и иконками
- ✅ Card - Карточки с различными макетами
- ✅ Select - Выпадающие списки
- ✅ Badge - Бейджи для статусов и меток
- ✅ Checkbox - Чекбоксы с различными вариантами

### 2. Сущности (Entities) - UI-представления бизнес-сущностей
Расположение: `src/entities/*/ui/`

**Компоненты с историями:**
- ✅ CitizenCard - Карточки граждан с полной информацией
- ✅ VehicleCard - Карточки транспортных средств

### 3. Виджеты (Widgets) - Сложные составные компоненты
Расположение: `src/widgets/*/ui/`

**Компоненты с историями:**
- ✅ OfficerDashboardWidget - Дашборд офицера

## Запуск Storybook

```bash
# Запуск в режиме разработки
npm run storybook

# Сборка для продакшена
npm run build-storybook
```

Storybook будет доступен по адресу: http://localhost:6006

## Создание новых историй

### Шаг 1: Создание файла .stories.tsx

Создайте файл рядом с компонентом:
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx  ← Новый файл
└── index.ts
```

### Шаг 2: Базовая структура истории

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'UI/Atoms/ComponentName', // Иерархия в Storybook
  component: ComponentName,
  parameters: {
    layout: 'centered', // или 'fullscreen' для виджетов
  },
  tags: ['autodocs'], // Автоматическая генерация документации
  argTypes: {
    // Контролы для изменения пропсов
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Простая история
export const Default: Story = {
  args: {
    children: 'Текст кнопки',
  },
};

// История с кастомным рендером
export const CustomRender: Story = {
  render: () => (
    <div className="space-y-4">
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
    </div>
  ),
};
```

### Шаг 3: Добавление в экспорт

Добавьте экспорт в `src/stories.ts`:

```typescript
export * from './shared/ui/atoms/ComponentName/ComponentName.stories';
```

## Лучшие практики

### 1. Именование историй
- Используйте понятные имена: `Default`, `WithIcon`, `Disabled`, `Large`
- Группируйте связанные истории: `AllVariants`, `AllSizes`

### 2. Моковые данные
- Создавайте реалистичные моковые данные
- Используйте типизированные интерфейсы
- Включайте различные состояния данных

### 3. Интерактивность
- Добавляйте обработчики событий для демонстрации
- Используйте `console.log` для отладки
- Показывайте различные состояния компонентов

### 4. Документация
- Используйте тег `autodocs` для автоматической документации
- Добавляйте описания в `argTypes`
- Комментируйте сложные истории

## Примеры использования

### Атомы - Button
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
```

### Сущности - CitizenCard
```typescript
const mockCitizen: Citizen = {
  id: '1',
  name: 'Иван',
  surname: 'Петров',
  // ... полные данные
};

export const Default: Story = {
  args: {
    citizen: mockCitizen,
  },
};
```

### Виджеты - OfficerDashboardWidget
```typescript
export const FullLayout: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 flex">
        <div className="w-64 bg-slate-800 p-4">
          {/* Sidebar */}
        </div>
        <div className="flex-1 p-4">
          <Story />
        </div>
      </div>
    ),
  ],
};
```

## Отладка и тестирование

### 1. Проверка компонентов
- Откройте Storybook
- Найдите нужный компонент в левой панели
- Проверьте все варианты и состояния
- Убедитесь, что компонент выглядит корректно

### 2. Интерактивное тестирование
- Используйте контролы для изменения пропсов
- Проверьте обработчики событий
- Тестируйте различные размеры экрана

### 3. Исправление ошибок
- Если компонент не отображается, проверьте импорты
- Убедитесь, что все зависимости установлены
- Проверьте консоль браузера на ошибки

## Следующие шаги

### Планируемые компоненты для историй:

**Атомы:**
- [ ] Modal - Модальные окна
- [ ] Tabs - Вкладки
- [ ] Table - Таблицы
- [ ] Dialog - Диалоги
- [ ] Notification - Уведомления

**Сущности:**
- [ ] UnitCard - Карточки подразделений
- [ ] IncidentCard - Карточки инцидентов
- [ ] CallCard - Карточки вызовов
- [ ] WeaponCard - Карточки оружия

**Виджеты:**
- [ ] DispatchPortalWidget - Портал диспетчера
- [ ] CitizenPortalWidget - Портал гражданина
- [ ] ReportsPortalWidget - Портал отчетов

## Полезные ссылки

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Storybook Addons](https://storybook.js.org/addons)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf) 