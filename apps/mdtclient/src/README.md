# FSD Architecture Documentation

## Обзор архитектуры

Проект использует **Feature-Sliced Design (FSD)** архитектуру с элементами **Atomic Design** для UI компонентов.

## Структура папок

```
src/
├── app/                    # Конфигурация приложения
│   ├── providers/          # Провайдеры контекстов
│   ├── styles/             # Глобальные стили
│   └── config/             # Конфигурация приложения
│
├── pages/                  # Страницы (маршрутизация)
│   ├── citizen/            # Страницы для граждан
│   ├── leo/                # Страницы для полиции
│   ├── dispatch/           # Страницы для диспетчеров
│   ├── ems/                # Страницы для EMS
│   ├── fd/                 # Страницы для FD
│   └── admin/              # Административные страницы
│
├── widgets/                # Композитные блоки
│   ├── citizen-portal/     # Порталы для граждан
│   ├── mdt-portal/         # MDT порталы
│   ├── dispatch-portal/    # Диспетчерские порталы
│   ├── ems-portal/         # EMS порталы
│   └── fd-portal/          # FD порталы
│
├── features/               # Бизнес-функции
│   ├── auth/               # Аутентификация
│   ├── citizen-management/ # Управление гражданами
│   ├── vehicle-registration/ # Регистрация ТС
│   ├── company-management/ # Управление компаниями
│   ├── gta-map/            # Карта GTA 5
│   ├── dispatch-system/    # Система диспетчеризации
│   ├── ems-system/         # Система EMS
│   └── fd-system/          # Система FD
│
├── entities/               # Бизнес-сущности
│   ├── citizen/            # Граждане
│   ├── vehicle/            # Транспортные средства
│   ├── company/            # Компании
│   ├── incident/           # Инциденты
│   ├── patient/            # Пациенты
│   └── fire-incident/      # Пожарные инциденты
│
└── shared/                 # Переиспользуемые ресурсы
    ├── ui/                 # UI компоненты (Atomic Design)
    │   ├── atoms/          # Атомарные компоненты
    │   ├── molecules/      # Молекулярные компоненты
    │   ├── organisms/      # Организменные компоненты
    │   └── templates/      # Шаблоны
    ├── api/                # API клиенты
    ├── lib/                # Утилиты и хуки
    ├── config/             # Конфигурация
    └── types/              # Общие типы
```

## Принципы архитектуры

### 1. Слои (Layers)
- **app** - конфигурация приложения
- **pages** - страницы и маршрутизация
- **widgets** - композитные блоки
- **features** - бизнес-функции
- **entities** - бизнес-сущности
- **shared** - переиспользуемые ресурсы

### 2. Зависимости
- Каждый слой может зависеть только от слоев ниже себя
- Запрещены циклические зависимости
- Shared слой не зависит ни от кого

### 3. Структура модуля
Каждый модуль содержит:
```
module/
├── model/          # Бизнес-логика, типы, селекторы
├── api/            # API методы
├── ui/             # UI компоненты
└── index.ts        # Публичный API модуля
```

## Правила именования

### Папки
- Используйте kebab-case для папок: `citizen-management`
- Используйте PascalCase для компонентов: `CitizenCard`

### Файлы
- Компоненты: `CitizenCard.tsx`
- Хуки: `useCitizen.ts`
- Утилиты: `citizen.utils.ts`
- Типы: `citizen.types.ts`

## Миграция

### Этап 1: Shared Layer
1. Выделить общие UI компоненты
2. Создать атомарные компоненты
3. Настроить API клиенты

### Этап 2: Entities
1. Мигрировать типы и модели
2. Создать API методы
3. Выделить UI компоненты

### Этап 3: Features
1. Перенести бизнес-логику
2. Создать feature компоненты
3. Настроить состояние

### Этап 4: Widgets & Pages
1. Создать композитные блоки
2. Настроить маршрутизацию
3. Интегрировать все слои

## Примеры использования

### Импорт компонента
```typescript
import { CitizenCard } from '@/entities/citizen';
import { Button } from '@/shared/ui/atoms';
```

### Создание feature
```typescript
// features/citizen-management/ui/CitizenForm.tsx
import { Citizen } from '@/entities/citizen';
import { Button, Input } from '@/shared/ui/atoms';
```

### Использование в widget
```typescript
// widgets/citizen-portal/ui/CitizenPortal.tsx
import { CitizenForm } from '@/features/citizen-management';
import { CitizenCard } from '@/entities/citizen';
```

### EMS/FD разделение
```typescript
// EMS система
import { EmsPortal } from '@/widgets/ems-portal';
import { PatientManagement } from '@/features/ems-system';

// FD система
import { FdPortal } from '@/widgets/fd-portal';
import { FireIncidentManagement } from '@/features/fd-system';
```

## Контакты

При возникновении вопросов по архитектуре обращайтесь к документации FSD или создавайте issue в репозитории. 