# Архитектура навигации MDT Client

## Обзор

Реализована многоуровневая иерархическая навигация для MDT Client, которая обеспечивает интуитивный пользовательский опыт:

1. **Выбор департамента** - глобальный селектор
2. **Портал департамента** - специализированный интерфейс с модулями

## Структура навигации

### Уровень 1: Глобальный селектор департаментов
- **Компонент**: `DepartmentSelectorGrid`
- **Назначение**: Отображает сетку карточек всех доступных департаментов
- **Состояние**: `activeDepartmentId = null`

### Уровень 2: Портал департамента
- **Компонент**: `MainLayout`
- **Назначение**: Отображает сайдбар с модулями и основной контент
- **Состояние**: `activeDepartmentId = 'department-id'`

### Уровень 3: Модули департамента
- **Компонент**: `ModuleContent`
- **Назначение**: Отображает содержимое выбранного модуля
- **Состояние**: `activeModuleId = 'module-id'`

## Ключевые компоненты

### 1. NavigationStore (Zustand)
```typescript
interface NavigationState {
  activeDepartmentId: string | null;
  activeModuleId: string | null;
  
  selectDepartment: (departmentId: string) => void;
  selectModule: (moduleId: string) => void;
  resetNavigation: () => void;
}
```

### 2. AppRouter
Главный маршрутизатор, который решает что отображать:
- Если `activeDepartmentId = null` → `DepartmentSelectorGrid`
- Если `activeDepartmentId` задан → `MainLayout`

### 3. DepartmentSelectorGrid
Сетка карточек департаментов с:
- Красивым фоном с паттерном
- Иконками департаментов
- Hover-эффектами
- Информацией о количестве модулей

### 4. MainLayout
Основной layout с:
- Сайдбаром с модулями департамента
- Кнопкой возврата к выбору департамента
- Областью для контента модулей

### 5. Sidebar
Обновленный сайдбар с:
- Списком модулей выбранного департамента
- Интеграцией с `useNavigationStore`
- Статистикой

## Поток навигации

1. **Пользователь заходит в приложение**
   - Отображается `DepartmentSelectorGrid`
   - `activeDepartmentId = null`

2. **Пользователь выбирает департамент**
   - Вызывается `selectDepartment('law-enforcement')`
   - `activeDepartmentId = 'law-enforcement'`
   - `AppRouter` переключается на `MainLayout`

3. **Пользователь выбирает модуль**
   - Вызывается `selectModule('person-search')`
   - `activeModuleId = 'person-search'`
   - `ModuleContent` отображает соответствующий контент

4. **Пользователь возвращается к выбору департамента**
   - Вызывается `resetNavigation()`
   - `activeDepartmentId = null`
   - `activeModuleId = null`
   - `AppRouter` возвращается к `DepartmentSelectorGrid`

## Преимущества новой архитектуры

### 1. Интуитивность
- Четкая иерархия: Департамент → Модуль → Контент
- Визуальная навигация через карточки
- Понятные переходы между уровнями

### 2. Масштабируемость
- Легко добавлять новые департаменты
- Модульная структура компонентов
- Централизованное управление состоянием

### 3. Производительность
- Ленивая загрузка модулей
- Оптимизированные ре-рендеры через Zustand
- Минимальные перерисовки

### 4. Поддержка
- Четкое разделение ответственности
- Документированная архитектура
- Легкое тестирование

## Техническая реализация

### Zustand Store
```typescript
export const useNavigationStore = create<NavigationState>((set, get) => ({
  activeDepartmentId: null,
  activeModuleId: null,
  
  selectDepartment: (departmentId: string) => {
    set({ 
      activeDepartmentId: departmentId,
      activeModuleId: null 
    });
  },
  
  selectModule: (moduleId: string) => {
    set({ activeModuleId: moduleId });
  },
  
  resetNavigation: () => {
    set({ 
      activeDepartmentId: null,
      activeModuleId: null 
    });
  }
}));
```

### Типизация
```typescript
export interface MDTModule {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  modules: MDTModule[];
}
```

## Следующие шаги

1. **Добавление анимаций переходов**
2. **Реализация хлебных крошек**
3. **Кэширование состояния навигации**
4. **Адаптивная верстка для мобильных устройств**
5. **Интеграция с системой прав доступа**

## Заключение

Новая архитектура навигации обеспечивает:
- ✅ Логичную иерархию навигации
- ✅ Интуитивный пользовательский интерфейс
- ✅ Масштабируемую структуру кода
- ✅ Централизованное управление состоянием
- ✅ Легкость поддержки и развития

Система готова к дальнейшему развитию и добавлению новых департаментов и модулей. 