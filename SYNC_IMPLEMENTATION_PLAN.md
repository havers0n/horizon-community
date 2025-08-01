# ПЛАН РЕАЛИЗАЦИИ СИНХРОНИЗАЦИИ
## Бэкенд с золотыми типами фронтенда

**Дата создания:** $(date)  
**Приоритет:** КРИТИЧЕСКИЙ  
**Срок выполнения:** 1 неделя

---

## 📋 ОБЗОР ПРОЕКТА

### Цель
Синхронизировать бэкенд и базу данных с новыми "золотыми типами" фронтенда для обеспечения совместимости и корректной работы системы.

### Ключевые изменения
1. Обновление структуры таблицы `characters`
2. Синхронизация API эндпоинтов
3. Обновление сервисов
4. Обеспечение обратной совместимости

---

## 🚀 ЭТАП 1: ПОДГОТОВКА (День 1)

### 1.1 Создание резервной копии
```bash
# Создать резервную копию базы данных
pg_dump -h localhost -U postgres -d roleplay_identity > backup_before_sync_$(date +%Y%m%d_%H%M%S).sql

# Создать резервную копию кода
git checkout -b backup-before-sync
git add .
git commit -m "Backup before golden types sync"
```

### 1.2 Подготовка тестовой среды
```bash
# Создать тестовую базу данных
createdb roleplay_identity_test

# Применить все миграции в тестовой среде
supabase db reset --db-url postgresql://postgres:password@localhost:5432/roleplay_identity_test
```

### 1.3 Проверка зависимостей
```bash
# Убедиться, что все зависимости установлены
npm install
npm run build
```

---

## 🗄️ ЭТАП 2: МИГРАЦИЯ БАЗЫ ДАННЫХ (День 2)

### 2.1 Применение миграции 018
```bash
# Применить миграцию в тестовой среде
supabase db push --db-url postgresql://postgres:password@localhost:5432/roleplay_identity_test

# Проверить результат миграции
psql -h localhost -U postgres -d roleplay_identity_test -c "SELECT * FROM migration_log WHERE migration_name = '018_sync_with_golden_types';"
```

### 2.2 Валидация данных
```sql
-- Проверить, что все новые поля добавлены
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN ('name', 'surname', 'dateOfBirth', 'gender', 'address', 'phoneNumber');

-- Проверить миграцию данных
SELECT COUNT(*) as total_records,
       COUNT(name) as records_with_name,
       COUNT(surname) as records_with_surname,
       COUNT(dateOfBirth) as records_with_dateOfBirth
FROM characters;

-- Проверить валидность данных
SELECT * FROM validate_character_data();
```

### 2.3 Применение в продакшене
```bash
# Применить миграцию в продакшене
supabase db push

# Проверить результат
psql -h localhost -U postgres -d roleplay_identity -c "SELECT * FROM migration_log WHERE migration_name = '018_sync_with_golden_types';"
```

---

## 🔧 ЭТАП 3: ОБНОВЛЕНИЕ СЕРВИСОВ (День 3-4)

### 3.1 Замена CharacterService
```bash
# Создать резервную копию старого сервиса
cp apps/server/services/CharacterService.ts apps/server/services/CharacterService.ts.backup

# Заменить на новый сервис
cp apps/server/services/CharacterServiceUpdated.ts apps/server/services/CharacterService.ts
```

### 3.2 Обновление импортов
```typescript
// Обновить импорты в файлах, использующих CharacterService
// apps/server/routes/cad.ts
import { characterServiceUpdated as characterService } from '../services/CharacterService.js';

// apps/server/routes/mdt.ts (если используется)
import { characterServiceUpdated as characterService } from '../services/CharacterService.js';
```

### 3.3 Обновление типов
```typescript
// Обновить apps/server/types.ts
export interface Character {
  id: number;
  name: string;              // Вместо firstName
  surname: string;           // Вместо lastName
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  occupation?: string;
  photoUrl?: string;
  ssn?: string;
  flags?: string[];
  addressFlags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🌐 ЭТАП 4: ОБНОВЛЕНИЕ API ЭНДПОИНТОВ (День 5)

### 4.1 Замена роутов CAD
```bash
# Создать резервную копию старых роутов
cp apps/server/routes/cad.ts apps/server/routes/cad.ts.backup

# Заменить на новые роуты
cp apps/server/routes/cadUpdated.ts apps/server/routes/cad.ts
```

### 4.2 Обновление MDT роутов
```typescript
// Обновить apps/server/routes/mdt.ts для работы с новыми типами
// Добавить маппинг для Call911

private mapCallFromDb(row: any): Call911 {
  return {
    id: row.id.toString(),
    caller: row.caller_name,
    callerName: row.caller_name,
    callerPhone: row.caller_phone,
    location: row.location,
    description: row.description,
    priority: this.mapPriority(row.priority_type),
    status: this.mapStatus(row.status),
    units: [], // Получить из связанной таблицы
    timestamp: row.created_at,
    createdAt: row.created_at
  };
}

private mapPriority(priority: string): CallPriority {
  switch (priority) {
    case 'low': return 'low';
    case 'medium': return 'medium';
    case 'high': return 'high';
    case 'critical': return 'critical';
    default: return 'medium';
  }
}

private mapStatus(status: string): CallStatus {
  switch (status) {
    case 'pending': return 'pending';
    case 'active': return 'active';
    case 'closed': return 'closed';
    default: return 'pending';
  }
}
```

### 4.3 Обновление главного файла роутов
```typescript
// Обновить apps/server/index.ts или app.ts
import cadRoutes from './routes/cad.js';
import mdtRoutes from './routes/mdt.js';

app.use('/api/cad', cadRoutes);
app.use('/api/mdt', mdtRoutes);
```

---

## 🧪 ЭТАП 5: ТЕСТИРОВАНИЕ (День 6)

### 5.1 Модульные тесты
```bash
# Запустить тесты для новых сервисов
npm test -- --testPathPattern=CharacterService
npm test -- --testPathPattern=cadRoutes
```

### 5.2 Интеграционные тесты
```bash
# Тестирование API эндпоинтов
curl -X GET http://localhost:3000/api/cad/citizens \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:3000/api/cad/citizens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "address": "123 Main St",
    "phoneNumber": "555-1234"
  }'
```

### 5.3 Тестирование обратной совместимости
```bash
# Проверить legacy эндпоинты
curl -X GET http://localhost:3000/api/cad/citizens/1/legacy \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.4 Тестирование фронтенда
```bash
# Запустить фронтенд и проверить интеграцию
cd apps/mdtclient
npm run dev

# Проверить, что все компоненты работают с новыми типами
```

---

## 🚀 ЭТАП 6: РАЗВЕРТЫВАНИЕ (День 7)

### 6.1 Подготовка к развертыванию
```bash
# Создать финальную ветку
git checkout -b feature/golden-types-sync
git add .
git commit -m "Sync backend with golden types - complete implementation"

# Создать pull request
git push origin feature/golden-types-sync
```

### 6.2 Развертывание в staging
```bash
# Развернуть в staging среде
npm run deploy:staging

# Провести финальное тестирование в staging
```

### 6.3 Развертывание в продакшене
```bash
# Развернуть в продакшене
npm run deploy:production

# Проверить работоспособность
curl -X GET https://your-domain.com/api/cad/citizens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 КОНТРОЛЬНЫЕ ТОЧКИ

### ✅ Критерии успеха

1. **База данных:**
   - [ ] Миграция 018 успешно применена
   - [ ] Все новые поля добавлены в таблицу characters
   - [ ] Данные корректно перенесены
   - [ ] Индексы созданы

2. **API эндпоинты:**
   - [ ] GET /api/cad/citizens возвращает данные в формате золотых типов
   - [ ] POST /api/cad/citizens принимает данные в формате золотых типов
   - [ ] PUT /api/cad/citizens/:id работает с новыми полями
   - [ ] Legacy эндпоинты работают для обратной совместимости

3. **Сервисы:**
   - [ ] CharacterService обновлен и работает
   - [ ] MDTService обновлен для работы с новыми типами
   - [ ] Валидация данных работает корректно

4. **Тестирование:**
   - [ ] Все модульные тесты проходят
   - [ ] Интеграционные тесты проходят
   - [ ] Фронтенд работает с новыми API
   - [ ] Обратная совместимость обеспечена

---

## 🚨 ПЛАН ОТКАТА

### Если что-то пойдет не так:

1. **Откат базы данных:**
   ```bash
   # Восстановить из резервной копии
   psql -h localhost -U postgres -d roleplay_identity < backup_before_sync_YYYYMMDD_HHMMSS.sql
   ```

2. **Откат кода:**
   ```bash
   # Вернуться к резервной ветке
   git checkout backup-before-sync
   git checkout -b rollback-golden-types-sync
   git push origin rollback-golden-types-sync
   ```

3. **Откат сервисов:**
   ```bash
   # Восстановить старые сервисы
   cp apps/server/services/CharacterService.ts.backup apps/server/services/CharacterService.ts
   cp apps/server/routes/cad.ts.backup apps/server/routes/cad.ts
   ```

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

### Команда
- **Backend Lead:** [Имя] - [email]
- **DBA:** [Имя] - [email]
- **Frontend Lead:** [Имя] - [email]

### Документация
- [BACKEND_AUDIT_REPORT.md](./BACKEND_AUDIT_REPORT.md)
- [Миграция 018](./supabase/migrations/018_sync_with_golden_types.sql)
- [Обновленный CharacterService](./apps/server/services/CharacterServiceUpdated.ts)
- [Обновленные роуты CAD](./apps/server/routes/cadUpdated.ts)

---

## 🎯 ЗАКЛЮЧЕНИЕ

Этот план обеспечивает безопасную и контролируемую синхронизацию бэкенда с золотыми типами фронтенда. Каждый этап включает проверки и возможность отката, что минимизирует риски для продакшена.

**Готовность к выполнению:** ✅  
**Приоритет:** КРИТИЧЕСКИЙ  
**Ожидаемый результат:** Полная синхронизация бэкенда с новым фронтендом 