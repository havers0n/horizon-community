# Локализация приложения MDT Client

## Обзор

Приложение MDT Client теперь поддерживает полную локализацию на русский и английский языки. Система локализации построена на основе JSON файлов и React контекста.

## Структура файлов

```
apps/mdtclient/
├── locales/
│   ├── en.json          # Английские переводы
│   └── ru.json          # Русские переводы
├── lib/
│   └── i18n.ts          # Основная логика интернационализации
├── contexts/
│   └── LocaleContext.tsx # React контекст для локализации
└── components/
    └── LanguageSwitcher.tsx # Компонент переключения языка
```

## Использование

### 1. Основной хук useLocale

```tsx
import { useLocale } from '../contexts/LocaleContext';

const MyComponent = () => {
  const { t, locale, setLocale, formatDate, formatNumber } = useLocale();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.welcome', { name: 'John' })}</p>
      <span>{formatDate(new Date())}</span>
    </div>
  );
};
```

### 2. Функция перевода t()

```tsx
// Простой перевод
t('auth.signIn') // "Войти" или "Sign In"

// Перевод с параметрами
t('validation.minLength', { min: 8 }) // "Минимальная длина: 8 символов"

// Вложенные ключи
t('incidents.priority.high') // "Высокий" или "High"
```

### 3. Вспомогательные функции

```tsx
const { 
  getRoleName,        // Перевод ролей пользователей
  getUnitStatus,      // Перевод статусов юнитов
  getDepartmentName,  // Перевод названий департаментов
  getReportType,      // Перевод типов рапортов
  getPriority,        // Перевод приоритетов
  formatDate,         // Форматирование дат
  formatTime,         // Форматирование времени
  formatDateTime,     // Форматирование даты и времени
  formatRelativeTime, // Относительное время
  formatNumber,       // Форматирование чисел
  formatCurrency      // Форматирование валюты
} = useLocale();
```

## Добавление новых переводов

### 1. Добавьте ключи в файлы локализации

**locales/ru.json:**
```json
{
  "newSection": {
    "title": "Новый раздел",
    "description": "Описание нового раздела",
    "items": {
      "item1": "Первый элемент",
      "item2": "Второй элемент"
    }
  }
}
```

**locales/en.json:**
```json
{
  "newSection": {
    "title": "New Section",
    "description": "Description of new section",
    "items": {
      "item1": "First item",
      "item2": "Second item"
    }
  }
}
```

### 2. Используйте в компонентах

```tsx
const { t } = useLocale();

return (
  <div>
    <h1>{t('newSection.title')}</h1>
    <p>{t('newSection.description')}</p>
    <ul>
      <li>{t('newSection.items.item1')}</li>
      <li>{t('newSection.items.item2')}</li>
    </ul>
  </div>
);
```

## Структура переводов

### Основные разделы

- **common** - Общие элементы (кнопки, статусы, сообщения)
- **auth** - Аутентификация (вход, регистрация, ошибки)
- **navigation** - Навигация (меню, ссылки)
- **roles** - Роли пользователей
- **unitStatus** - Статусы юнитов
- **departments** - Департаменты
- **incidents** - Инциденты
- **calls** - Вызовы
- **reports** - Рапорты
- **penalCodes** - Уголовные кодексы
- **citizens** - Граждане
- **vehicles** - Транспортные средства
- **bolos** - BOLO
- **patients** - Пациенты
- **admin** - Администрирование
- **dispatch** - Диспетчерская
- **ui** - Интерфейс (темы, языки, уведомления)
- **errors** - Ошибки
- **validation** - Валидация
- **time** - Время и даты
- **months** - Месяцы
- **weekdays** - Дни недели

## Переключение языка

Компонент `LanguageSwitcher` автоматически добавляется в заголовок приложения. Пользователи могут переключаться между языками, и их выбор сохраняется в localStorage.

## Fallback система

Если перевод не найден в текущей локали, система автоматически ищет его в fallback локали (английский). Если и там не найден, возвращается ключ перевода.

## Форматирование

### Даты и время

```tsx
formatDate(new Date()) // "01.01.2024" или "1/1/2024"
formatTime(new Date()) // "12:00:00" или "12:00:00 PM"
formatDateTime(new Date()) // "01.01.2024, 12:00:00"
formatRelativeTime(new Date()) // "2 часа назад" или "2 hours ago"
```

### Числа и валюта

```tsx
formatNumber(1234567) // "1 234 567" или "1,234,567"
formatCurrency(1234.56) // "1 234,56 ₽" или "$1,234.56"
```

## Лучшие практики

1. **Используйте вложенные ключи** для организации переводов
2. **Добавляйте параметры** для динамического контента
3. **Группируйте связанные переводы** в одном разделе
4. **Используйте вспомогательные функции** для часто используемых переводов
5. **Проверяйте наличие переводов** в обеих локалях
6. **Тестируйте интерфейс** на разных языках

## Добавление нового языка

1. Создайте новый файл `locales/[locale].json`
2. Добавьте локаль в тип `Locale` в `lib/i18n.ts`
3. Добавьте переводы в `translations` объект
4. Добавьте название языка в `ui.language` секцию

```tsx
// lib/i18n.ts
export type Locale = 'en' | 'ru' | 'de'; // Добавить новую локаль

const translations: Record<Locale, Translations> = {
  en,
  ru,
  de, // Добавить новые переводы
};
```

## Отладка

Для отладки переводов включите логирование в консоли. Система выводит предупреждения при отсутствующих ключах:

```
Translation key not found: missing.key
Translation value is not a string: invalid.key
``` 