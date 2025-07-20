# Исправление проблемы с темной темой в FAQ

## Проблема
В разделе FAQ при включенной темной теме отображалась белая тема вместо темной, что делало интерфейс нечитаемым и неконсистентным с остальными страницами.

## Причина проблемы
Компонент FAQ использовал жестко заданные цвета вместо семантических CSS классов, которые адаптируются к текущей теме:
- `bg-gray-50` вместо `bg-background`
- `bg-white` вместо `bg-card`
- `text-gray-900` вместо `text-foreground`
- `text-gray-600` вместо `text-muted-foreground`
- И другие жестко заданные цвета

## Выполненные исправления

### 1. Основной контейнер
```tsx
// Было
<div className="min-h-screen bg-gray-50">

// Стало
<div className="min-h-screen bg-background">
```

### 2. Заголовок страницы
```tsx
// Было
<div className="bg-white shadow-sm border-b">
  <h1 className="text-4xl font-bold text-gray-900 mb-4">
  <p className="text-lg text-gray-600 max-w-2xl mx-auto">

// Стало
<div className="bg-card shadow-sm border-b border-border">
  <h1 className="text-4xl font-bold text-foreground mb-4">
  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
```

### 3. Поиск и фильтры
```tsx
// Было
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
<Input className="pl-10" />

// Стало
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
<Input className="pl-10 input-gold" />
```

### 4. Карточки FAQ
```tsx
// Было
<Card className="hover:shadow-md transition-shadow">
  <CardTitle className="text-lg flex items-center gap-2">
    <HelpCircle className="h-5 w-5 text-blue-600" />
  <ChevronUp className="h-5 w-5 text-gray-400" />
  <ChevronDown className="h-5 w-5 text-gray-400" />

// Стало
<Card className="card-hover card-gold">
  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
    <HelpCircle className="h-5 w-5 text-primary" />
  <ChevronUp className="h-5 w-5 text-muted-foreground" />
  <ChevronDown className="h-5 w-5 text-muted-foreground" />
```

### 5. Контент ответов
```tsx
// Было
<div className="bg-gray-50 rounded-lg p-4">
  <p className="text-gray-700 leading-relaxed">

// Стало
<div className="bg-muted rounded-lg p-4">
  <p className="text-foreground leading-relaxed">
```

### 6. Секция "Вопрос не найден"
```tsx
// Было
<Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
<h3 className="text-lg font-semibold mb-2">Вопрос не найден</h3>
<p className="text-gray-500 mb-6">

// Стало
<Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
<h3 className="text-lg font-semibold mb-2 text-foreground">Вопрос не найден</h3>
<p className="text-muted-foreground mb-6">
```

### 7. Контактная секция
```tsx
// Было
<Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
  <h3 className="text-xl font-semibold mb-4">
  <p className="text-gray-600 mb-6">

// Стало
<Card className="card-gold bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
  <h3 className="text-xl font-semibold mb-4 text-foreground">
  <p className="text-muted-foreground mb-6">
```

### 8. Кнопки
```tsx
// Было
<Button className="bg-[#5865F2] hover:bg-[#4752C4]">
<Button className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">

// Стало
<Button className="btn-gold">
<Button className="btn-gold-outline">
```

### 9. Секция быстрых ссылок
```tsx
// Было
<Card>
  <h3 className="text-lg font-semibold mb-4">
  <p className="text-gray-600 mb-4">

// Стало
<Card className="card-gold">
  <h3 className="text-lg font-semibold mb-4 text-foreground">
  <p className="text-muted-foreground mb-4">
```

## Добавленные улучшения

### 1. Золотые акценты
- Добавлены классы `btn-gold` и `btn-gold-outline` для кнопок
- Добавлен класс `input-gold` для поля поиска
- Добавлен класс `card-gold` для карточек

### 2. Семантические цвета
- `text-foreground` - основной цвет текста
- `text-muted-foreground` - вторичный цвет текста
- `bg-background` - основной фон
- `bg-card` - фон карточек
- `bg-muted` - фон для выделенных областей
- `border-border` - цвет границ

### 3. Консистентность дизайна
- Все элементы теперь используют единую систему цветов
- Поддержка переключения между светлой и темной темами
- Сохранение золотых акцентов в обеих темах

## Результат

### ✅ Исправленные проблемы
- FAQ теперь корректно отображается в темной теме
- Все тексты читаемы в обеих темах
- Консистентный дизайн с остальными страницами
- Правильные цвета фона и границ

### ✅ Улучшения UX
- Плавные переходы между темами
- Золотые акценты для выделения важных элементов
- Улучшенная читаемость в темной теме
- Профессиональный внешний вид

### ✅ Технические преимущества
- Использование семантических CSS классов
- Легкое поддержание консистентности дизайна
- Возможность добавления новых тем в будущем
- Оптимизированная структура стилей

## Заключение

Проблема с отображением белой темы в FAQ при темной теме полностью решена. Теперь компонент корректно адаптируется к текущей теме и обеспечивает отличную читаемость и пользовательский опыт в обеих темах. 