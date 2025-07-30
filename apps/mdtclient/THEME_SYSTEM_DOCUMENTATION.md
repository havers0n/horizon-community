# 🎨 Система тем MDT - Документация

## Обзор

Система тем MDT предоставляет четыре различных стиля интерфейса, которые автоматически применяются ко всем компонентам системы. Каждая тема полностью изменяет внешний вид интерфейса, сохраняя при этом функциональность и удобство использования.

## 🎯 Доступные темы

### 1. Тактический (Tactical)
- **Описание**: Строгий военный стиль с угловыми скобками
- **Особенности**: 
  - Темный фон с синими акцентами
  - Угловые скобки на карточках
  - Синее свечение текста
  - Военная эстетика

### 2. Неоновый (Neon)
- **Описание**: Яркие неоновые акценты
- **Особенности**:
  - Яркие цветные акценты
  - Неоновое свечение элементов
  - Цветовая дифференциация статусов
  - Современный киберпанк стиль

### 3. Цифровой (Digital)
- **Описание**: Минималистичный цифровой стиль
- **Особенности**:
  - Чистые линии и минимализм
  - Монохромная цветовая схема
  - Фокус на функциональности
  - Современный дизайн

### 4. Многослойное стекло (Glassmorphism)
- **Описание**: Эффект глубины с зелеными точками
- **Особенности**:
  - Эффект размытого стекла
  - Многослойные фоны
  - Зеленые акценты
  - Эффект глубины и объема

## 🏗️ Архитектура системы

### Основные компоненты

#### 1. ThemeContext (`src/contexts/ThemeContext.tsx`)
Центральный контекст для управления темами:

```typescript
interface ThemeContextType {
  currentPreset: ThemePreset;
  setPreset: (preset: ThemePreset) => void;
  getCardVariant: (defaultVariant?: CardVariant) => CardVariant;
  getCardCorners: (defaultCorners?: CardCorners) => CardCorners;
  getButtonVariant: (defaultVariant?: ButtonVariant) => ButtonVariant;
  getInputVariant: (defaultVariant?: InputVariant) => InputVariant;
  getThemeConfig: () => ThemeConfig;
  applyThemeToElement: (element: HTMLElement, layer?: 'card' | 'button' | 'input') => void;
}
```

#### 2. PageThemeWrapper (`src/shared/ui/PageThemeWrapper.tsx`)
Компонент-обертка для автоматического применения тем к страницам:

```typescript
<PageThemeWrapper>
  <YourPageComponent />
</PageThemeWrapper>
```

#### 3. ThemeWrapper (`src/shared/ui/ThemeWrapper.tsx`)
Специализированные обертки для разных типов компонентов:

```typescript
<CardThemeWrapper>
  <Card>Содержимое</Card>
</CardThemeWrapper>

<ButtonThemeWrapper>
  <Button>Кнопка</Button>
</ButtonThemeWrapper>

<InputThemeWrapper>
  <Input placeholder="Введите текст" />
</InputThemeWrapper>
```

## 🔧 Использование

### Базовое применение

1. **Оберните страницу в PageThemeWrapper**:
```typescript
import { PageThemeWrapper } from '@/shared/ui/PageThemeWrapper';

export const YourPage: React.FC = () => {
  return (
    <PageThemeWrapper>
      <div className="p-6">
        {/* Ваш контент */}
      </div>
    </PageThemeWrapper>
  );
};
```

2. **Используйте хук useTheme для получения вариантов**:
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { getCardVariant, getButtonVariant, getInputVariant } = useTheme();

<Card variant={getCardVariant('tactical')}>
  <Button variant={getButtonVariant('primary')}>
    Кнопка
  </Button>
</Card>
```

### Автоматическое применение тем

Все компоненты UI автоматически применяют текущую тему:

- **Card** - автоматически применяет тему через `data-theme-layer="card"`
- **Button** - автоматически применяет тему через `data-theme-layer="button"`
- **Input** - автоматически применяет тему через `data-theme-layer="input"`

### Переключение тем

Используйте компонент ThemePresetSwitcher для переключения тем:

```typescript
import { ThemePresetSwitcher } from '@/features/theme-preset-switcher';

<ThemePresetSwitcher />
```

## 🎨 Конфигурация тем

### Структура конфигурации

```typescript
interface ThemeConfig {
  name: string;           // Название темы
  description: string;    // Описание
  icon: string;          // Иконка
  color: string;         // Основной цвет
  backgroundClass: string; // CSS класс фона
  textGlowClass: string;   // CSS класс свечения текста
  cardLayerClass: string;  // CSS класс для карточек
  buttonLayerClass: string; // CSS класс для кнопок
  inputLayerClass: string;  // CSS класс для полей ввода
}
```

### Добавление новой темы

1. **Добавьте тип в ThemePreset**:
```typescript
export type ThemePreset = 'tactical' | 'neon' | 'digital' | 'glassmorphism' | 'yourNewTheme';
```

2. **Добавьте конфигурацию в themeConfigs**:
```typescript
const themeConfigs: Record<ThemePreset, ThemeConfig> = {
  // ... существующие темы
  yourNewTheme: {
    name: 'Ваша новая тема',
    description: 'Описание новой темы',
    icon: 'YourIcon',
    color: 'text-your-color-400',
    backgroundClass: 'theme-yourNewTheme',
    textGlowClass: 'text-glow-your-theme',
    cardLayerClass: 'bg-your-theme-card',
    buttonLayerClass: 'bg-your-theme-button',
    inputLayerClass: 'bg-your-theme-input'
  }
};
```

3. **Добавьте CSS стили в index.css**:
```css
body.theme-yourNewTheme {
  /* Ваши CSS переменные */
}

body.theme-yourNewTheme {
  /* Ваши фоновые стили */
}
```

## 🔄 Автоматическое применение

### Как это работает

1. **При изменении темы**:
   - Обновляется `currentPreset` в ThemeContext
   - Применяется CSS класс к `body`
   - Вызывается `applyThemeToAllElements()`

2. **При загрузке компонентов**:
   - Компоненты автоматически получают `data-theme-layer` атрибут
   - Применяется соответствующая тема через `applyThemeToElement()`

3. **При динамическом обновлении**:
   - `PageThemeWrapper` отслеживает изменения темы
   - Автоматически применяет новую тему ко всем элементам

### Data-атрибуты

Система использует data-атрибуты для автоматического применения тем:

- `data-theme-layer="card"` - для карточек
- `data-theme-layer="button"` - для кнопок  
- `data-theme-layer="input"` - для полей ввода

## 💾 Сохранение настроек

- Тема автоматически сохраняется в `localStorage` под ключом `mdt-theme-preset`
- При следующем входе в систему тема восстанавливается
- Изменения применяются мгновенно без перезагрузки страницы

## 🎯 Лучшие практики

### 1. Всегда используйте PageThemeWrapper
```typescript
// ✅ Правильно
export const YourPage: React.FC = () => (
  <PageThemeWrapper>
    <YourContent />
  </PageThemeWrapper>
);

// ❌ Неправильно
export const YourPage: React.FC = () => (
  <YourContent />
);
```

### 2. Используйте функции получения вариантов
```typescript
// ✅ Правильно
const { getCardVariant, getButtonVariant } = useTheme();
<Card variant={getCardVariant('tactical')}>
  <Button variant={getButtonVariant('primary')}>Кнопка</Button>
</Card>

// ❌ Неправильно
<Card variant="tactical">
  <Button variant="primary">Кнопка</Button>
</Card>
```

### 3. Не дублируйте логику применения тем
```typescript
// ✅ Правильно - используйте встроенные компоненты
<Card variant={getCardVariant('tactical')} />

// ❌ Неправильно - не дублируйте CSS классы
<div className="bg-slate-900/80 corner-brackets">
  <Card variant="tactical" />
</div>
```

## 🐛 Отладка

### Проверка текущей темы
```typescript
const { currentPreset, getThemeConfig } = useTheme();
console.log('Текущая тема:', currentPreset);
console.log('Конфигурация:', getThemeConfig());
```

### Проверка применения темы
```javascript
// В консоли браузера
document.querySelectorAll('[data-theme-layer]').forEach(el => {
  console.log(el.getAttribute('data-theme-layer'), el.className);
});
```

### Принудительное применение темы
```typescript
const { applyThemeToElement } = useTheme();
const element = document.querySelector('.your-element');
if (element) {
  applyThemeToElement(element, 'card');
}
```

## 📱 Совместимость

- ✅ Все современные браузеры
- ✅ Мобильные устройства
- ✅ Планшеты
- ✅ Высокое разрешение (Retina)
- ✅ Темный режим системы

## 🔮 Будущие улучшения

- [ ] Анимации перехода между темами
- [ ] Пользовательские темы
- [ ] Экспорт/импорт настроек тем
- [ ] Автоматическое определение темы по времени суток
- [ ] Интеграция с системными настройками темы

---

**Автор**: MDT Development Team  
**Версия**: 1.0  
**Дата**: Январь 2025