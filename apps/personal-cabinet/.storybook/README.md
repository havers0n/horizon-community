# Storybook для Personal Cabinet

Этот Storybook содержит все UI компоненты приложения Personal Cabinet.

## Запуск

### Разработка
```bash
npm run storybook
```

### Продакшн сборка
```bash
npm run build-storybook
```

### CI/CD режим
```bash
npm run storybook:serve
```

## Структура

- `.storybook/main.ts` - Основная конфигурация Storybook
- `.storybook/preview.ts` - Глобальные настройки для всех stories
- `.storybook/manager.ts` - Настройки интерфейса Storybook
- `src/stories/` - Главная страница и документация
- `src/shared/ui/*.stories.tsx` - Stories для каждого UI компонента

## Добавление новых компонентов

1. Создайте компонент в `src/shared/ui/`
2. Создайте файл `*.stories.tsx` рядом с компонентом
3. Добавьте экспорт в `src/shared/ui/index.ts`
4. Обновите главную страницу в `src/stories/Introduction.stories.mdx`

## Пример story файла

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta: Meta<typeof MyComponent> = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default variant',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary variant',
  },
};
```

## Настройки

### Алиасы путей
В `main.ts` настроены алиасы для импортов:
- `@` → `src`
- `@shared` → `src/shared`
- `@shared/ui` → `src/shared/ui`
- `@entities` → `src/entities`
- `@features` → `src/features`
- `@widgets` → `src/widgets`
- `@pages` → `src/pages`
- `@app` → `src/app`

### Аддоны
- `@storybook/addon-essentials` - Основные аддоны
- `@storybook/addon-interactions` - Тестирование взаимодействий
- `@storybook/addon-themes` - Переключение тем
- `@storybook/addon-a11y` - Проверка доступности
- `@storybook/addon-viewport` - Тестирование на разных экранах

### Темы
Поддерживаются светлая и темная темы. Переключение происходит автоматически.

## Тестирование

Storybook можно использовать для:
- Визуального тестирования компонентов
- Проверки различных состояний
- Тестирования доступности
- Документирования компонентов
- Интерактивного тестирования

## Деплой

Собранный Storybook можно развернуть на любом статическом хостинге:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- и др. 