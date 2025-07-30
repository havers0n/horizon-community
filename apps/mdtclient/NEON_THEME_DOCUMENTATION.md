# Неоновая тема MDT - Документация

## Обзор

Неоновая тема для MDT (Mobile Data Terminal) представляет собой современный UI-кит с эффектами Glassmorphism и неоновым свечением. Тема создает футуристический интерфейс, напоминающий научно-фантастические фильмы.

## Особенности

### 🎨 Визуальные эффекты
- **Glassmorphism**: Полупрозрачные элементы с размытием фона
- **Неоновое свечение**: Пульсирующие эффекты свечения для акцентов
- **Параллакс**: Анимированный фон с эффектом глубины
- **Плавающие элементы**: Карточки с эффектом левитации

### 🌈 Цветовая палитра
- **Cyan (Голубой)**: Основной неоновый цвет
- **Pink (Розовый)**: Акцентный цвет для важных элементов
- **Purple (Фиолетовый)**: Цвет для специальных функций
- **Green (Зеленый)**: Цвет для успешных операций
- **Orange (Оранжевый)**: Цвет для предупреждений

## Компоненты

### Кнопки (Button)

#### Варианты неоновых кнопок:
```tsx
<Button variant="neon">Cyan Neon</Button>
<Button variant="neonPink">Pink Neon</Button>
<Button variant="neonPurple">Purple Neon</Button>
<Button variant="neonGreen">Green Neon</Button>
<Button variant="neonOrange">Orange Neon</Button>
<Button variant="glass">Glass Effect</Button>
```

#### Особенности:
- Автоматическое неоновое свечение
- Пульсирующая анимация при наведении
- Градиентные фоны
- Полупрозрачные границы

### Карточки (Card)

#### Варианты карточек:
```tsx
<Card variant="glass">Glass Effect</Card>
<Card variant="neonGlass">Neon Glass</Card>
<Card variant="neon">Neon Border</Card>
```

#### Эффект Glassmorphism:
- `background: rgba(30, 41, 59, 0.7)`
- `backdrop-filter: blur(12px)`
- `border: 1px solid rgba(255, 255, 255, 0.1)`
- `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)`

### Поля ввода (Input)

#### Неоновые варианты:
```tsx
<Input variant="neon" placeholder="Cyan input" />
<Input variant="neonPink" placeholder="Pink input" />
<Input variant="neonPurple" placeholder="Purple input" />
<Input variant="neonGreen" placeholder="Green input" />
<Input variant="neonOrange" placeholder="Orange input" />
```

#### Особенности:
- Неоновое свечение при фокусе
- Полупрозрачные границы
- Анимированные переходы

## Управление темой

### Хук useTheme

```tsx
import { useTheme } from '@/features/theme-switcher';

const { theme, toggleTheme, setTheme, isNeon } = useTheme();
```

#### Доступные методы:
- `toggleTheme()`: Переключение между темами (dark → light → neon → dark)
- `setTheme('neon')`: Установка конкретной темы
- `isNeon`: Булево значение для проверки активной неоновой темы

### Компонент ThemeToggle

```tsx
import { ThemeToggle } from '@/features/theme-switcher';

<ThemeToggle showLabels />
```

#### Пропсы:
- `showLabels`: Показывать ли текстовые метки (по умолчанию false)
- `className`: Дополнительные CSS классы

## CSS Классы

### Неоновое свечение
```css
.neon-glow-cyan    /* Голубое свечение */
.neon-glow-pink    /* Розовое свечение */
.neon-glow-purple  /* Фиолетовое свечение */
.neon-glow-green   /* Зеленое свечение */
.neon-glow-orange  /* Оранжевое свечение */
```

### Эффект стекла
```css
.glass-effect          /* Базовый эффект стекла */
.glass-effect-hover    /* Эффект при наведении */
```

### Анимации
```css
.floating-card         /* Плавающие карточки */
.digital-flicker       /* Цифровое мерцание */
.pulse-glow           /* Пульсирующее свечение */
```

## Применение в проекте

### 1. Активация неоновой темы

```tsx
// В корневом компоненте
import { useTheme } from '@/features/theme-switcher';

const App = () => {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    setTheme('neon');
  }, []);
  
  return <YourApp />;
};
```

### 2. Условное применение стилей

```tsx
const MyComponent = () => {
  const { isNeon } = useTheme();
  
  return (
    <Card variant={isNeon ? "glass" : "default"}>
      <Button variant={isNeon ? "neon" : "primary"}>
        Действие
      </Button>
    </Card>
  );
};
```

### 3. Демонстрационная страница

```tsx
import { NeonThemeDemo } from '@/pages/NeonThemeDemo';

// В роутере
<Route path="/neon-demo" component={NeonThemeDemo} />
```

## CSS Переменные

### Неоновые цвета
```css
:root {
  --neon-cyan: 187 100% 50%;
  --neon-pink: 330 100% 50%;
  --neon-purple: 280 100% 50%;
  --neon-green: 142 100% 50%;
  --neon-orange: 30 100% 50%;
  --neon-yellow: 60 100% 50%;
}
```

### Glassmorphism
```css
:root {
  --glass-bg: 240 10% 3.9%;
  --glass-border: 0 0% 100%;
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

## Анимации

### Пульсация неонового свечения
```css
@keyframes neonPulseCyan {
  0%, 100% {
    box-shadow: 
      0 0 5px rgba(0, 255, 255, 0.5),
      0 0 10px rgba(0, 255, 255, 0.3),
      0 0 15px rgba(0, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 20px rgba(0, 255, 255, 0.5),
      0 0 30px rgba(0, 255, 255, 0.3);
  }
}
```

### Параллакс фона
```css
@keyframes neonParallax {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-15px, -10px); }
  50% { transform: translate(-10px, -15px); }
  75% { transform: translate(-20px, -5px); }
}
```

## Производительность

### Оптимизации
- Использование `transform` вместо `top/left` для анимаций
- `will-change: transform` для элементов с анимацией
- `backdrop-filter` с fallback для старых браузеров
- CSS переменные для динамического изменения цветов

### Поддержка браузеров
- Chrome 76+ (полная поддержка)
- Firefox 70+ (полная поддержка)
- Safari 9+ (частичная поддержка backdrop-filter)
- Edge 79+ (полная поддержка)

## Примеры использования

### Дашборд с неоновыми элементами
```tsx
const Dashboard = () => {
  const { isNeon } = useTheme();
  
  return (
    <div className="space-y-6">
      <Card variant={isNeon ? "neonGlass" : "default"}>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button variant={isNeon ? "neon" : "primary"}>
              Активные юниты
            </Button>
            <Button variant={isNeon ? "neonGreen" : "success"}>
              Открытые вызовы
            </Button>
            <Button variant={isNeon ? "neonPink" : "danger"}>
              Критические
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Форма с неоновыми полями
```tsx
const SearchForm = () => {
  return (
    <Card variant="glass">
      <CardContent>
        <div className="space-y-4">
          <Input
            variant="neon"
            placeholder="Поиск по базе данных..."
            leftIcon={<Search />}
          />
          <Input
            variant="neonPurple"
            placeholder="Координаты..."
            leftIcon={<MapPin />}
          />
          <Button variant="neon" className="w-full">
            Начать поиск
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Заключение

Неоновая тема MDT предоставляет современный и привлекательный интерфейс с уникальными визуальными эффектами. Все компоненты полностью совместимы с существующей архитектурой и могут быть легко интегрированы в любой раздел приложения.

Для получения полного эффекта рекомендуется использовать тему в сочетании с темным фоном и минимальным количеством отвлекающих элементов.