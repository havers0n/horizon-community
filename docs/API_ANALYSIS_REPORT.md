# Отчет по анализу API и схем данных

## Задача №2: Анализ API и схем данных

### 1. Сравнение API-маршрутов

#### Наша система (RolePlayIdentity)
**Основные маршруты:**
- `/api/cad/characters` - управление персонажами
- `/api/cad/vehicles` - управление транспортными средствами
- `/api/cad/weapons` - управление оружием
- `/api/cad/onduty` - выход на смену
- `/api/cad/status` - изменение статуса юнита
- `/api/cad/offduty` - завершение смены
- `/api/cad/active` - активные юниты
- `/api/cad/panic` - кнопка паники
- `/api/cad/calls` - управление вызовами 911
- `/api/cad/records` - создание отчетов

#### SnailyCAD система
**Основные маршруты:**
- `/citizen` - управление гражданами
- `/leo` - управление полицейскими офицерами
- `/ems-fd` - управление EMS/FD персоналом
- `/dispatch` - диспетчерские функции
- `/911-calls` - управление вызовами 911
- `/records` - управление записями/отчетами
- `/admin` - административные функции

### 2. Анализ схем данных

#### 2.1 Список всех моделей

**Наша система:**
```json
{
  "users": "Пользователи системы",
  "departments": "Департаменты",
  "ranks": "Звания и должности",
  "divisions": "Подразделения",
  "qualifications": "Квалификации",
  "units": "Юниты",
  "characters": "Персонажи",
  "characterQualifications": "Квалификации персонажей",
  "characterCareerHistory": "История карьеры",
  "vehicles": "Транспортные средства",
  "weapons": "Оружие",
  "pets": "Домашние животные",
  "records": "Записи/отчеты",
  "call911": "Вызовы 911",
  "activeUnits": "Активные юниты",
  "callAttachments": "Привязки юнитов к вызовам",
  "applications": "Заявки",
  "supportTickets": "Тикеты поддержки",
  "complaints": "Жалобы",
  "reports": "Отчеты",
  "reportTemplates": "Шаблоны отчетов",
  "filledReports": "Заполненные отчеты",
  "notifications": "Уведомления",
  "tests": "Тесты",
  "testSessions": "Сессии тестирования",
  "testResults": "Результаты тестов",
  "achievements": "Достижения",
  "userAchievements": "Достижения пользователей",
  "badges": "Значки",
  "userBadges": "Значки пользователей",
  "userStats": "Статистика пользователей",
  "forumCategories": "Категории форума",
  "forumTopics": "Темы форума",
  "forumPosts": "Посты форума",
  "forumReactions": "Реакции на посты",
  "forumSubscriptions": "Подписки на форум",
  "forumViews": "Просмотры форума",
  "forumStats": "Статистика форума"
}
```

**SnailyCAD система:**
```json
{
  "cad": "Основная конфигурация CAD",
  "CadFeature": "Функции CAD",
  "MiscCadSettings": "Дополнительные настройки",
  "LiveMapURL": "URL карт",
  "RawWebhook": "Вебхуки",
  "DiscordWebhook": "Discord вебхуки",
  "AutoSetUserProperties": "Автоматические свойства пользователей",
  "ApiToken": "API токены",
  "ApiTokenLog": "Логи API токенов",
  "DiscordRoles": "Discord роли",
  "DiscordRole": "Discord роль",
  "BlacklistedWord": "Запрещенные слова",
  "AuditLog": "Аудит лог",
  "User": "Пользователи",
  "UserSession": "Сессии пользователей",
  "ToAddDefaultPermissions": "Права по умолчанию",
  "UserSoundSettings": "Настройки звука",
  "User2FA": "Двухфакторная аутентификация",
  "Citizen": "Граждане",
  "CitizenLicensePoints": "Очки лицензий граждан",
  "SuspendedCitizenLicenses": "Приостановленные лицензии",
  "Pet": "Домашние животные",
  "Note": "Заметки",
  "RegisteredVehicle": "Зарегистрированные ТС",
  "Weapon": "Оружие",
  "MedicalRecord": "Медицинские записи",
  "PetMedicalRecord": "Медицинские записи питомцев",
  "DoctorVisit": "Посещения врача",
  "Value": "Значения (справочники)",
  "AddressValue": "Адреса",
  "PenalCode": "Уголовный кодекс",
  "PenalCodeGroup": "Группы уголовного кодекса",
  "WarningApplicable": "Применимые предупреждения",
  "WarningNotApplicable": "Неприменимые предупреждения",
  "Violation": "Нарушения",
  "SeizedItem": "Изъятые предметы",
  "DivisionValue": "Подразделения",
  "DepartmentValue": "Департаменты",
  "DepartmentValueLink": "Связи департаментов",
  "EmergencyVehicleValue": "Экстренные ТС",
  "DriversLicenseCategoryValue": "Категории водительских прав",
  "VehicleValue": "Транспортные средства",
  "WeaponValue": "Оружие",
  "CallTypeValue": "Типы вызовов",
  "Notification": "Уведомления",
  "BleeterProfile": "Профили Bleeter",
  "BleeterProfileFollow": "Подписки Bleeter",
  "BleeterPost": "Посты Bleeter",
  "TowCall": "Вызовы эвакуатора",
  "TaxiCall": "Вызовы такси",
  "Business": "Бизнесы",
  "Employee": "Сотрудники",
  "BusinessPost": "Посты бизнесов",
  "EmployeeValue": "Значения сотрудников",
  "Officer": "Полицейские офицеры",
  "IndividualDivisionCallsign": "Индивидуальные позывные подразделений",
  "UnitQualification": "Квалификации юнитов",
  "QualificationValue": "Значения квалификаций",
  "LeoWhitelistStatus": "Статус белого списка LEO",
  "StatusValue": "Значения статусов",
  "OfficerLog": "Логи офицеров",
  "ImpoundedVehicle": "Конфискованные ТС",
  "LeoIncident": "Инциденты LEO",
  "IncidentEvent": "События инцидентов",
  "CombinedLeoUnit": "Объединенные LEO юниты",
  "CombinedEmsFdUnit": "Объединенные EMS/FD юниты",
  "ActiveDispatchers": "Активные диспетчеры",
  "DispatchChat": "Чат диспетчера",
  "ChatCreator": "Создатели чата",
  "Call911": "Вызовы 911",
  "GTAMapPosition": "Позиции на карте GTA",
  "Position": "Позиции",
  "AssignedUnit": "Назначенные юниты",
  "AssignedWarrantOfficer": "Назначенные офицеры ордеров",
  "IncidentInvolvedUnit": "Юниты, вовлеченные в инциденты",
  "Call911Event": "События вызовов 911",
  "Bolo": "BOLO (Be On Look Out)",
  "Record": "Записи/отчеты",
  "RecordRelease": "Освобождения из записей",
  "Warrant": "Ордера",
  "RecordLog": "Логи записей",
  "ExpungementRequest": "Запросы на удаление записей",
  "NameChangeRequest": "Запросы на смену имени",
  "CourtEntry": "Записи суда",
  "CourtDate": "Даты суда",
  "EmsFdDeputy": "EMS/FD депутаты",
  "EmsFdIncident": "Инциденты EMS/FD",
  "TruckLog": "Логи грузовиков",
  "LicenseExam": "Экзамены на лицензии",
  "CustomField": "Пользовательские поля",
  "CustomFieldValue": "Значения пользовательских полей",
  "CustomRole": "Пользовательские роли",
  "CourthousePost": "Посты суда",
  "ActiveTone": "Активные тоны"
}
```

#### 2.2 Детальный анализ основных моделей

##### Модель Character (наша) vs Citizen (SnailyCAD)

**Наша система - Character:**
```json
{
  "id": "serial primary key",
  "ownerId": "integer (FK to users.id)",
  "type": "text (civilian, leo, fire, ems)",
  "firstName": "text NOT NULL",
  "lastName": "text NOT NULL",
  "dob": "date NOT NULL",
  "address": "text NOT NULL",
  "insuranceNumber": "text NOT NULL UNIQUE",
  "licenses": "jsonb DEFAULT {}",
  "medicalInfo": "jsonb DEFAULT {}",
  "mugshotUrl": "text",
  "isUnit": "boolean DEFAULT false",
  "unitInfo": "jsonb",
  "departmentId": "integer (FK to departments.id)",
  "rankId": "integer (FK to ranks.id)",
  "divisionId": "integer (FK to divisions.id)",
  "unitId": "integer (FK to units.id)",
  "badgeNumber": "text",
  "employeeId": "text",
  "hireDate": "date",
  "terminationDate": "date",
  "isActive": "boolean DEFAULT true",
  "createdAt": "timestamp DEFAULT now()",
  "updatedAt": "timestamp DEFAULT now()"
}
```

**SnailyCAD - Citizen:**
```json
{
  "id": "string @id @default(cuid())",
  "socialSecurityNumber": "string",
  "userId": "string (FK to User.id)",
  "name": "string @db.VarChar(255)",
  "surname": "string @db.VarChar(255)",
  "dateOfBirth": "DateTime",
  "gender": "Value? (FK)",
  "ethnicity": "Value? (FK)",
  "hairColor": "string @db.VarChar(255)",
  "eyeColor": "string @db.VarChar(255)",
  "address": "string @db.VarChar(255)",
  "postal": "string @db.VarChar(255)",
  "height": "string @db.VarChar(255)",
  "weight": "string @db.VarChar(255)",
  "driversLicense": "Value? (FK)",
  "driversLicenseNumber": "string",
  "weaponLicense": "Value? (FK)",
  "weaponLicenseNumber": "string",
  "pilotLicense": "Value? (FK)",
  "pilotLicenseNumber": "string",
  "waterLicense": "Value? (FK)",
  "waterLicenseNumber": "string",
  "huntingLicense": "Value? (FK)",
  "huntingLicenseNumber": "string",
  "fishingLicense": "Value? (FK)",
  "fishingLicenseNumber": "string",
  "ccw": "Value? (FK)",
  "imageId": "string @db.Text",
  "imageBlurData": "string @db.Text",
  "note": "string @db.Text",
  "dead": "boolean DEFAULT false",
  "dateOfDead": "DateTime",
  "missing": "boolean DEFAULT false",
  "dateOfMissing": "DateTime",
  "arrested": "boolean DEFAULT false",
  "phoneNumber": "string",
  "occupation": "string @db.Text",
  "additionalInfo": "string @db.Text",
  "appearance": "string",
  "createdAt": "DateTime DEFAULT now()",
  "updatedAt": "DateTime DEFAULT now() @updatedAt"
}
```

**Сравнение полей:**

| Поле | Наша система | SnailyCAD | Совпадение | Рекомендация |
|------|-------------|-----------|------------|--------------|
| id | serial | string(cuid) | ❌ | Адаптировать к string |
| firstName/lastName | text | name/surname | ✅ | Прямое соответствие |
| dob | date | dateOfBirth | ✅ | Прямое соответствие |
| address | text | address | ✅ | Прямое соответствие |
| insuranceNumber | text | socialSecurityNumber | ✅ | Аналогичное назначение |
| licenses | jsonb | Отдельные поля | ❌ | Добавить отдельные поля лицензий |
| medicalInfo | jsonb | MedicalRecord[] | ❌ | Создать таблицу MedicalRecord |
| mugshotUrl | text | imageId | ✅ | Аналогичное назначение |
| departmentId | integer | - | ❌ | Добавить в SnailyCAD |
| rankId | integer | - | ❌ | Добавить в SnailyCAD |
| divisionId | integer | - | ❌ | Добавить в SnailyCAD |
| badgeNumber | text | badgeNumber (в Officer) | ✅ | Прямое соответствие |
| isActive | boolean | - | ❌ | Добавить в SnailyCAD |
| dead | - | boolean | ❌ | Добавить в нашу систему |
| missing | - | boolean | ❌ | Добавить в нашу систему |
| phoneNumber | - | string | ❌ | Добавить в нашу систему |
| occupation | - | string | ❌ | Добавить в нашу систему |

##### Модель Vehicle (наша) vs RegisteredVehicle (SnailyCAD)

**Наша система - Vehicle:**
```json
{
  "id": "serial primary key",
  "ownerId": "integer (FK to characters.id)",
  "plate": "text NOT NULL UNIQUE",
  "vin": "text NOT NULL UNIQUE",
  "model": "text NOT NULL",
  "color": "text NOT NULL",
  "registration": "text DEFAULT 'valid'",
  "insurance": "text DEFAULT 'valid'",
  "createdAt": "timestamp DEFAULT now()"
}
```

**SnailyCAD - RegisteredVehicle:**
```json
{
  "id": "string @id @default(cuid())",
  "userId": "string (FK to User.id)",
  "citizenId": "string (FK to Citizen.id)",
  "vinNumber": "string UNIQUE @db.VarChar(255)",
  "plate": "string UNIQUE @db.VarChar(255)",
  "model": "VehicleValue (FK)",
  "color": "string @db.VarChar(255)",
  "registrationStatus": "Value (FK)",
  "insuranceStatus": "Value? (FK)",
  "inspectionStatus": "VehicleInspectionStatus?",
  "taxStatus": "VehicleTaxStatus?",
  "reportedStolen": "boolean DEFAULT false",
  "impounded": "boolean DEFAULT false",
  "dmvStatus": "WhitelistStatus?",
  "appearance": "string",
  "imageId": "string",
  "createdAt": "DateTime DEFAULT now()",
  "updatedAt": "DateTime DEFAULT now() @updatedAt"
}
```

**Сравнение полей:**

| Поле | Наша система | SnailyCAD | Совпадение | Рекомендация |
|------|-------------|-----------|------------|--------------|
| id | serial | string(cuid) | ❌ | Адаптировать к string |
| ownerId | integer | citizenId | ✅ | Прямое соответствие |
| plate | text | plate | ✅ | Прямое соответствие |
| vin | text | vinNumber | ✅ | Прямое соответствие |
| model | text | model (FK) | ❌ | Создать справочник VehicleValue |
| color | text | color | ✅ | Прямое соответствие |
| registration | text | registrationStatus (FK) | ❌ | Создать справочник Value |
| insurance | text | insuranceStatus (FK) | ❌ | Создать справочник Value |
| reportedStolen | - | boolean | ❌ | Добавить в нашу систему |
| impounded | - | boolean | ❌ | Добавить в нашу систему |
| inspectionStatus | - | VehicleInspectionStatus | ❌ | Добавить в нашу систему |
| taxStatus | - | VehicleTaxStatus | ❌ | Добавить в нашу систему |

##### Модель Weapon (наша) vs Weapon (SnailyCAD)

**Наша система - Weapon:**
```json
{
  "id": "serial primary key",
  "ownerId": "integer (FK to characters.id)",
  "serialNumber": "text NOT NULL UNIQUE",
  "model": "text NOT NULL",
  "registration": "text DEFAULT 'valid'",
  "createdAt": "timestamp DEFAULT now()"
}
```

**SnailyCAD - Weapon:**
```json
{
  "id": "string @id @default(cuid())",
  "userId": "string (FK to User.id)",
  "citizenId": "string (FK to Citizen.id)",
  "serialNumber": "string UNIQUE @db.VarChar(255)",
  "registrationStatus": "Value (FK)",
  "bofStatus": "WhitelistStatus?",
  "model": "WeaponValue (FK)",
  "createdAt": "DateTime DEFAULT now()",
  "updatedAt": "DateTime DEFAULT now() @updatedAt"
}
```

**Сравнение полей:**

| Поле | Наша система | SnailyCAD | Совпадение | Рекомендация |
|------|-------------|-----------|------------|--------------|
| id | serial | string(cuid) | ❌ | Адаптировать к string |
| ownerId | integer | citizenId | ✅ | Прямое соответствие |
| serialNumber | text | serialNumber | ✅ | Прямое соответствие |
| model | text | model (FK) | ❌ | Создать справочник WeaponValue |
| registration | text | registrationStatus (FK) | ❌ | Создать справочник Value |
| bofStatus | - | WhitelistStatus | ❌ | Добавить в нашу систему |

##### Модель Call911 (наша) vs Call911 (SnailyCAD)

**Наша система - Call911:**
```json
{
  "id": "serial primary key",
  "location": "text NOT NULL",
  "description": "text NOT NULL",
  "status": "text DEFAULT 'pending'",
  "type": "text NOT NULL",
  "priority": "integer DEFAULT 1",
  "callerInfo": "jsonb",
  "createdAt": "timestamp DEFAULT now()",
  "updatedAt": "timestamp DEFAULT now()"
}
```

**SnailyCAD - Call911:**
```json
{
  "id": "string @id @default(cuid())",
  "caseNumber": "int DEFAULT autoincrement()",
  "position": "Position? (FK)",
  "userId": "string",
  "assignedUnits": "AssignedUnit[]",
  "location": "string @db.Text",
  "postal": "string @db.Text",
  "description": "string @db.Text",
  "descriptionData": "Json?",
  "name": "string @db.VarChar(255)",
  "ended": "boolean DEFAULT false",
  "situationCode": "StatusValue? (FK)",
  "dispositionCode": "CallTypeValue? (FK)",
  "viaDispatch": "boolean DEFAULT false",
  "divisions": "DivisionValue[]",
  "departments": "DepartmentValue[]",
  "events": "Call911Event[]",
  "incidents": "LeoIncident[]",
  "type": "CallTypeValue? (FK)",
  "gtaMapPosition": "GTAMapPosition? (FK)",
  "isSignal100": "boolean DEFAULT false",
  "extraFields": "Json?",
  "status": "WhitelistStatus?",
  "createdAt": "DateTime DEFAULT now()",
  "updatedAt": "DateTime DEFAULT now() @updatedAt"
}
```

**Сравнение полей:**

| Поле | Наша система | SnailyCAD | Совпадение | Рекомендация |
|------|-------------|-----------|------------|--------------|
| id | serial | string(cuid) | ❌ | Адаптировать к string |
| location | text | location | ✅ | Прямое соответствие |
| description | text | description | ✅ | Прямое соответствие |
| status | text | status (FK) | ❌ | Создать справочник StatusValue |
| type | text | type (FK) | ❌ | Создать справочник CallTypeValue |
| priority | integer | - | ❌ | Добавить в SnailyCAD |
| callerInfo | jsonb | - | ❌ | Добавить в SnailyCAD |
| caseNumber | - | int | ❌ | Добавить в нашу систему |
| name | - | string | ❌ | Добавить в нашу систему |
| ended | - | boolean | ❌ | Добавить в нашу систему |
| postal | - | string | ❌ | Добавить в нашу систему |
| isSignal100 | - | boolean | ❌ | Добавить в нашу систему |

### 3. Сущности SnailyCAD, отсутствующие в нашей системе

#### 3.1 Основные сущности
1. **Business** - система бизнесов
2. **Employee** - сотрудники бизнесов
3. **MedicalRecord** - медицинские записи
4. **PetMedicalRecord** - медицинские записи питомцев
5. **DoctorVisit** - посещения врача
6. **TowCall** - вызовы эвакуатора
7. **TaxiCall** - вызовы такси
8. **Bolo** - BOLO (Be On Look Out)
9. **Warrant** - ордера
10. **LeoIncident** - инциденты LEO
11. **EmsFdIncident** - инциденты EMS/FD
12. **CombinedLeoUnit** - объединенные LEO юниты
13. **CombinedEmsFdUnit** - объединенные EMS/FD юниты
14. **ActiveDispatchers** - активные диспетчеры
15. **DispatchChat** - чат диспетчера
16. **ImpoundedVehicle** - конфискованные ТС
17. **ExpungementRequest** - запросы на удаление записей
18. **NameChangeRequest** - запросы на смену имени
19. **CourtEntry** - записи суда
20. **LicenseExam** - экзамены на лицензии

#### 3.2 Справочные системы
1. **Value** - универсальная система справочников
2. **PenalCode** - уголовный кодекс
3. **PenalCodeGroup** - группы уголовного кодекса
4. **Violation** - нарушения
5. **SeizedItem** - изъятые предметы
6. **CustomField** - пользовательские поля
7. **CustomFieldValue** - значения пользовательских полей

#### 3.3 Социальные функции
1. **BleeterProfile** - профили социальной сети
2. **BleeterPost** - посты в социальной сети
3. **BleeterProfileFollow** - подписки

### 4. Рекомендации по интеграции

#### 4.1 Приоритет 1 - Критические сущности
1. **Создать систему справочников (Value)** - основа для всех остальных справочников
2. **Добавить MedicalRecord** - критично для EMS/FD функционала
3. **Создать Business систему** - важная часть экономики
4. **Добавить Warrant систему** - критично для LEO функционала
5. **Создать Incident систему** - для управления инцидентами

#### 4.2 Приоритет 2 - Важные сущности
1. **Добавить Bolo систему** - для поиска
2. **Создать CombinedUnit систему** - для объединенных юнитов
3. **Добавить Dispatch систему** - для диспетчеров
4. **Создать Court систему** - для судебных процессов
5. **Добавить LicenseExam систему** - для экзаменов

#### 4.3 Приоритет 3 - Дополнительные функции
1. **Добавить TowCall/TaxiCall** - для сервисных вызовов
2. **Создать Bleeter систему** - социальная сеть
3. **Добавить CustomField систему** - гибкость
4. **Создать Expungement систему** - удаление записей

#### 4.4 Технические изменения
1. **Изменить ID с serial на string(cuid)** - для совместимости
2. **Добавить updatedAt поля** - для отслеживания изменений
3. **Создать систему миграций** - для плавного перехода
4. **Адаптировать API маршруты** - для соответствия SnailyCAD

### 5. План миграции

#### 5.1 Этап 1 - Подготовка
1. Создать систему справочников Value
2. Добавить недостающие поля в существующие таблицы
3. Создать миграции для изменения типов ID

#### 5.2 Этап 2 - Основные сущности
1. Создать MedicalRecord таблицу
2. Создать Business и Employee таблицы
3. Создать Warrant таблицу
4. Создать Incident таблицы

#### 5.3 Этап 3 - Расширенный функционал
1. Создать CombinedUnit таблицы
2. Создать Dispatch систему
3. Создать Court систему
4. Добавить Bolo систему

#### 5.4 Этап 4 - Дополнительные функции
1. Создать TowCall/TaxiCall таблицы
2. Создать Bleeter систему
3. Добавить CustomField систему
4. Создать Expungement систему

### 6. Заключение

Интеграция потребует значительных усилий, но обеспечит полноценную совместимость с экосистемой SnailyCAD. Основные сложности:

1. **Изменение типов ID** - потребует миграции данных
2. **Создание справочной системы** - основа для всех остальных изменений
3. **Добавление множества новых сущностей** - расширит функционал
4. **Адаптация API** - для соответствия стандартам SnailyCAD

Рекомендуется поэтапная миграция с приоритизацией критически важных функций. 