# Документация системы персонажей

## Обзор

Система персонажей представляет собой двухуровневую архитектуру:

1. **Пользователь (User)** - аккаунт на сайте/форуме
2. **Игровой персонаж (Character)** - персонаж в игровом мире

Один пользователь может иметь несколько игровых персонажей, каждый из которых может работать в разных департаментах.

## Структура базы данных

### Основные таблицы

#### 1. Пользователи (users)
```sql
- id: Уникальный идентификатор
- username: Имя пользователя на сайте
- email: Email для входа
- password_hash: Хэш пароля
- role: Роль в системе (candidate, member, supervisor, admin)
- status: Статус (active, on_leave, banned)
- department_id: Основной департамент (ссылка на departments)
- secondary_department_id: Департамент по совмещению
- rank: Звание (устаревшее поле)
- division: Подразделение (устаревшее поле)
- qualifications: Массив квалификаций (устаревшее поле)
- game_warnings: Игровые предупреждения
- admin_warnings: Административные предупреждения
- cad_token: Токен для авторизации из игры
- discord_id: Discord ID
- created_at: Дата регистрации
- auth_id: UUID для Supabase Auth
```

#### 2. Департаменты (departments)
```sql
- id: Уникальный идентификатор
- name: Краткое название (PD, SAHP, SAMS, SAFR, DD, CD)
- full_name: Полное название
- logo_url: URL логотипа
- description: Описание
- gallery: Массив изображений
```

#### 3. Звания (ranks)
```sql
- id: Уникальный идентификатор
- department_id: Ссылка на департамент
- name: Название звания
- type: Тип (rank - звание, position - должность)
- order_index: Порядок для сортировки
- created_at: Дата создания
```

#### 4. Подразделения (divisions)
```sql
- id: Уникальный идентификатор
- department_id: Ссылка на департамент
- name: Название подразделения
- description: Описание
- created_at: Дата создания
```

#### 5. Квалификации (qualifications)
```sql
- id: Уникальный идентификатор
- name: Название квалификации
- description: Описание
- department_id: Ссылка на департамент (NULL для общих)
- division_id: Ссылка на подразделение (NULL для общих)
- created_at: Дата создания
```

#### 6. Юниты (units)
```sql
- id: Уникальный идентификатор
- name: Название юнита
- department_id: Ссылка на департамент
- description: Описание
- created_at: Дата создания
```

#### 7. Персонажи (characters)
```sql
- id: Уникальный идентификатор
- owner_id: Ссылка на пользователя
- type: Тип персонажа (civilian, leo, fire, ems)
- first_name: Имя
- last_name: Фамилия
- dob: Дата рождения
- address: Адрес
- insurance_number: Номер страховки
- licenses: Лицензии (JSONB)
- medical_info: Медицинская информация (JSONB)
- mugshot_url: URL фото
- is_unit: Является ли юнитом
- unit_info: Информация о юните (JSONB)
- department_id: Ссылка на департамент
- rank_id: Ссылка на звание
- division_id: Ссылка на подразделение
- unit_id: Ссылка на юнит
- badge_number: Номер жетона
- employee_id: ID сотрудника
- hire_date: Дата найма
- termination_date: Дата увольнения
- is_active: Активен ли
- created_at: Дата создания
- updated_at: Дата обновления
```

#### 8. Квалификации персонажей (character_qualifications)
```sql
- id: Уникальный идентификатор
- character_id: Ссылка на персонажа
- qualification_id: Ссылка на квалификацию
- obtained_date: Дата получения
- expires_date: Дата истечения (NULL для бессрочных)
- issued_by: Кто выдал (ссылка на персонажа)
- created_at: Дата создания
```

#### 9. История карьеры (character_career_history)
```sql
- id: Уникальный идентификатор
- character_id: Ссылка на персонажа
- department_id: Ссылка на департамент
- rank_id: Ссылка на звание
- division_id: Ссылка на подразделение
- unit_id: Ссылка на юнит
- action_type: Тип действия (hire, promotion, transfer, demotion, termination)
- effective_date: Дата вступления в силу
- reason: Причина
- approved_by: Кто одобрил (ссылка на персонажа)
- created_at: Дата создания
```

## Иерархия званий по департаментам

### PD (Police Department)
**Звания:**
1. Police Officer I
2. Police Officer II
3. Senior Officer
4. Sergeant

**Должности:**
5. Lieutenant
6. Captain

**Подразделения:**
- Patrol Division
- Investigations Bureau
- High Risk Operations Division (HROD)

**Юниты:**
- BLS (Basic Life Support)
- AR-15 (Специальное оружие)
- K-9 Unit (Кинологическая служба)
- Air Support (Воздушная поддержка)
- Harbor Unit (Портовая служба)
- Bicycle Patrol (Велосипедный патруль)
- Traffic Enforcement (Дорожная полиция)
- Moto Unit (Мотоциклетная служба)
- FTO (Field Training Officer)
- Wildlife Unit (Служба охраны дикой природы)

### SAHP (San Andreas Highway Patrol)
**Звания:**
1. State Trooper
2. Senior Trooper
3. Master Trooper
4. Sergeant

**Должности:**
5. Lieutenant
6. Captain

**Подразделения:**
- Patrol Division
- Highway Investigations Section

**Юниты:**
- BLS (Basic Life Support)
- AR-15 (Специальное оружие)
- Air Support (Воздушная поддержка)
- CVE (Commercial Vehicle Enforcement)
- Moto Unit (Мотоциклетная служба)
- FTO (Field Training Officer)
- K-9 (Кинологическая служба)

### SAMS (San Andreas Medical Services)
**Звания:**
1. Probationary Paramedic
2. Paramedic
3. Senior Paramedic

**Должности:**
4. Chief of SAMS
5. Deputy Chief of SAMS

**Подразделения:** Нет

**Юниты:**
- Coroner (Коронер)
- CSI (Crime Scene Investigation)

### SAFR (San Andreas Fire & Rescue)
**Звания:**
1. Probationary Firefighter
2. Firefighter
3. Senior Firefighter
4. Lieutenant

**Должности:**
5. Captain
6. Battalion Chief

**Подразделения:** Нет

**Юниты:**
- SADOT (San Andreas Department of Transportation)
- Animal Control (Контроль животных)

### DD (Dispatch Department)
**Звания:**
1. Probationary Dispatcher
2. Dispatcher

**Должности:**
3. Deputy Head of DD
4. Head of DD

**Подразделения:** Нет

**Юниты:**
- Operator (Оператор)
- Traffic-Dispatcher (Дорожный диспетчер)

### CD (Civilian Department)
**Звания:**
1. Probationary Civilian
2. Civilian

**Должности:**
3. Deputy Head of CD
4. Head of CD

**Подразделения:** Нет

**Юниты:** Нет

## Квалификации HROD

Специальные квалификации для подразделения High Risk Operations Division (HROD):

- Sniper (Снайпер)
- Tactical Paramedic (Тактический парамедик)
- Dive Unit (Водолазное подразделение)
- Crisis Unit (Кризисное подразделение)
- Drone Operator (Оператор дронов)
- Bomb Squad (Взрывотехническая служба)
- Bomb Squad K-9 (Кинологическая служба)
- Air Operator (Воздушный оператор)

## Функции базы данных

### Генерация номеров

#### generate_badge_number(department_name)
Генерирует уникальный номер жетона в формате `PREFIX-XXXX`
- PD-1234
- SAHP-5678
- SAMS-9012
- SAFR-3456
- DD-7890
- CD-1234

#### generate_employee_id(department_name)
Генерирует уникальный ID сотрудника в формате `PREFIX-YYYY-XXXXX`
- PD-2025-12345
- SAHP-2025-67890
- SAMS-2025-11111
- SAFR-2025-22222
- DD-2025-33333
- CD-2025-44444

### Триггеры

#### update_career_history()
Автоматически создает записи в истории карьеры при изменении:
- Департамента
- Звания
- Подразделения
- Юнита

Типы действий:
- `hire` - найм
- `promotion` - повышение
- `transfer` - перевод
- `demotion` - понижение
- `termination` - увольнение

## API эндпоинты

### Персонажи
- `GET /api/characters` - список персонажей пользователя
- `POST /api/characters` - создание персонажа
- `GET /api/characters/:id` - информация о персонаже
- `PUT /api/characters/:id` - обновление персонажа
- `DELETE /api/characters/:id` - удаление персонажа

### Карьера
- `GET /api/characters/:id/career` - история карьеры
- `POST /api/characters/:id/promote` - повышение
- `POST /api/characters/:id/transfer` - перевод
- `POST /api/characters/:id/terminate` - увольнение

### Квалификации
- `GET /api/characters/:id/qualifications` - квалификации персонажа
- `POST /api/characters/:id/qualifications` - добавление квалификации
- `DELETE /api/characters/:id/qualifications/:qualId` - удаление квалификации

### Справочники
- `GET /api/departments` - список департаментов
- `GET /api/departments/:id/ranks` - звания департамента
- `GET /api/departments/:id/divisions` - подразделения департамента
- `GET /api/departments/:id/units` - юниты департамента
- `GET /api/qualifications` - список квалификаций

## Безопасность

### Row Level Security (RLS)

Все таблицы защищены RLS политиками:

- **Пользователи** могут читать только свои данные
- **Администраторы** могут читать все данные
- **Супервайзеры** могут управлять данными в своих департаментах

### Авторизация

- JWT токены для API
- CAD токены для игровой интеграции
- Discord интеграция для дополнительной аутентификации

## Миграции

### 008_complete_character_system.sql
Полная миграция системы персонажей включает:
- Создание новых таблиц
- Вставку данных о званиях, подразделениях, юнитах
- Создание функций и триггеров
- Настройку RLS политик

## Использование

### Создание персонажа
```typescript
const character = await createCharacter({
  type: 'leo',
  firstName: 'John',
  lastName: 'Doe',
  dob: '1990-01-01',
  address: '123 Main St',
  departmentId: 1, // PD
  rankId: 1, // Police Officer I
  divisionId: 1, // Patrol Division
});
```

### Повышение персонажа
```typescript
await promoteCharacter(characterId, {
  newRankId: 2, // Police Officer II
  reason: 'Отличная работа',
  approvedBy: supervisorId
});
```

### Добавление квалификации
```typescript
await addQualification(characterId, {
  qualificationId: 1, // Sniper
  obtainedDate: '2025-01-08',
  issuedBy: instructorId
});
```

## Мониторинг и логирование

- Все изменения карьеры логируются в `character_career_history`
- Квалификации имеют даты получения и истечения
- Автоматическое создание записей через триггеры
- Аудит изменений через RLS политики

---

**Версия документации**: 1.0
**Дата обновления**: 2025-01-08
**Статус**: Актуально 