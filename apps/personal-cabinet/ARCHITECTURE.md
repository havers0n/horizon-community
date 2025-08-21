# Архитектурный стилгайд Personal Cabinet

## 1. Структура Feature-Sliced Design (FSD)

### Правила импортов
```typescript
// ✅ Правильно - импорт из того же слоя или более низкого
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/features/auth'

// ❌ Неправильно - импорт из более высокого слоя
import { Dashboard } from '@/pages/dashboard' // из features
import { SomeWidget } from '@/widgets/some' // из entities

// ✅ Правильно - импорт через barrel exports
import { UserEntity } from '@/entities/user'

// ❌ Неправильно - прямой импорт внутренних файлов
import { userModel } from '@/entities/user/model/store'
```

### Структура слоев
```
src/
├── app/          # Инициализация приложения, провайдеры, роутинг
├── pages/        # Страницы приложения
├── widgets/      # Композитные UI блоки
├── features/     # Бизнес-фичи
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемый код
```

## 2. Правила компонентов

### Размер компонентов
- ✅ **Максимум 200 строк** на компонент
- ✅ **Один компонент = одна ответственность**
- ✅ **Выносите логику в хуки** при превышении 150 строк

### Структура компонента
```typescript
// 1. Импорты (сгруппированы по источникам)
import React from 'react'
import { useState, useEffect } from 'react'

// 2. Типы и интерфейсы
interface ComponentProps {
  // ...
}

// 3. Константы
const COMPONENT_CONSTANTS = {
  // ...
}

// 4. Основной компонент
export function Component({ prop1, prop2 }: ComponentProps) {
  // 4.1 Хуки состояния
  const [state, setState] = useState()
  
  // 4.2 Хуки эффектов
  useEffect(() => {
    // ...
  }, [])
  
  // 4.3 Обработчики событий
  const handleClick = () => {
    // ...
  }
  
  // 4.4 Рендер
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## 3. Обработка ошибок

### Стандартная обработка
```typescript
// ✅ Используйте централизованную обработку
import { handleError, useErrorHandler } from '@/shared/lib/error-handling'

const handleError = useErrorHandler()

try {
  await apiCall()
} catch (error) {
  handleError(error, {
    fallbackMessage: 'Понятное пользователю сообщение'
  })
}

// ❌ Не используйте только console.error
catch (error) {
  console.error(error) // Недостаточно
}
```

### Типы ошибок
- `NETWORK` - Ошибки сети
- `VALIDATION` - Ошибки валидации
- `AUTHENTICATION` - Проблемы аутентификации
- `AUTHORIZATION` - Недостаток прав
- `NOT_FOUND` - Ресурс не найден
- `SERVER` - Ошибки сервера
- `UNKNOWN` - Неопознанные ошибки

## 4. Паттерны названий

### Компоненты
```typescript
// ✅ PascalCase для компонентов
export function UserProfile() {}
export function AdminPanel() {}

// ✅ Описательные названия
export function UserProfileEditForm() {} // Понятно что делает
export function DocumentationSearchWidget() {}

// ❌ Слишком общие названия
export function Form() {} // Какая форма?
export function Modal() {} // Какое модальное окно?
```

### Файлы и папки
```typescript
// ✅ kebab-case для файлов
user-profile.tsx
admin-panel.tsx
documentation-search.tsx

// ✅ Структура папок по функциональности
features/
├── auth/
│   ├── ui/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── model/
│       └── auth-store.ts
```

### Хуки
```typescript
// ✅ Префикс use
export function useAuth() {}
export function useLocalStorage() {}
export function useDebounce() {}

// ✅ Описательные названия
export function useUserProfile() {}
export function useDocumentSearch() {}
```

## 5. Производительность

### Lazy Loading
```typescript
// ✅ Используйте для страниц
const Dashboard = React.lazy(() => import('@/pages/dashboard'))

// ✅ Используйте для тяжелых компонентов
const HeavyChart = React.lazy(() => import('@/widgets/heavy-chart'))

// ❌ Не используйте для мелких компонентов
const Button = React.lazy(() => import('@/shared/ui/button')) // Избыточно
```

### Мемоизация
```typescript
// ✅ Используйте React.memo для дорогих компонентов
export const ExpensiveComponent = React.memo(({ data }) => {
  // Сложная логика рендеринга
})

// ✅ Используйте useMemo для тяжелых вычислений
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

## 6. Тестирование

### Структура тестов
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Общая настройка
  })

  describe('when user is authenticated', () => {
    it('should render user menu', () => {
      // Тест
    })
  })

  describe('when user is not authenticated', () => {
    it('should render login button', () => {
      // Тест
    })
  })
})
```

### Что тестировать
- ✅ **Критический пользовательский путь**
- ✅ **Обработка ошибок**
- ✅ **Условная логика рендеринга**
- ✅ **Пользовательские хуки**
- ❌ Имплементационные детали
- ❌ Сторонние библиотеки

## 7. Безопасность

### Чувствительные данные
```typescript
// ✅ Используйте переменные окружения
const API_URL = import.meta.env.VITE_API_URL

// ❌ Не храните секреты в коде
const SECRET_KEY = 'hardcoded-secret' // Опасно!
```

### Валидация
```typescript
// ✅ Валидируйте все входящие данные
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Использование
const result = UserSchema.safeParse(userData)
if (!result.success) {
  handleError(result.error)
}
```

## 8. Контрольные вопросы для код-ревью

### Архитектура
- [ ] Соблюдаются ли правила FSD?
- [ ] Компонент не превышает 200 строк?
- [ ] Логика вынесена в хуки при необходимости?

### Качество кода
- [ ] Названия компонентов и функций описательные?
- [ ] Обработка ошибок стандартизирована?
- [ ] Используется ли типизация TypeScript?

### Производительность
- [ ] Применяется ли мемоизация где нужно?
- [ ] Тяжелые компоненты загружаются лениво?
- [ ] Нет ли ненужных ре-рендеров?

### Безопасность
- [ ] Нет ли hardcoded секретов?
- [ ] Валидируются ли пользовательские данные?
- [ ] Обрабатываются ли ошибки безопасно?