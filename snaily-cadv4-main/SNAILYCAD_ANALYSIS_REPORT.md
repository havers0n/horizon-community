# Анализ проекта SnailyCAD v4

## 1. Модели базы данных (Prisma Schema)

### Основные модели

#### Пользователи и аутентификация
- **User** - пользователи системы
  - Основные поля: id, username, password, rank, banned, whitelistStatus, permissions[]
  - Связи: citizens[], cads[], vehicles[], weapons[], officers[], emsFdDeputies[]
- **UserSession** - сессии пользователей
- **User2FA** - двухфакторная аутентификация
- **UserSoundSettings** - настройки звука пользователя

#### CAD и настройки
- **cad** - основная модель CAD системы
  - Поля: name, ownerId, areaOfPlay, features[], whitelisted, timeZone
  - Связи: owner (User), features (CadFeature[]), miscCadSettings, apiToken
- **MiscCadSettings** - дополнительные настройки CAD
- **CadFeature** - функции системы
- **ApiToken** - API токены
- **DiscordRoles** - роли Discord

#### Граждане
- **Citizen** - граждане
  - Основные поля: name, surname, dateOfBirth, gender, ethnicity, address, height, weight
  - Лицензии: driversLicense, weaponLicense, pilotLicense, waterLicense, huntingLicense, fishingLicense
  - Связи: user (User), vehicles (RegisteredVehicle[]), weapons (Weapon[]), officers (Officer[])
- **Pet** - домашние животные
- **MedicalRecord** - медицинские записи
- **DoctorVisit** - посещения врача

#### Транспортные средства
- **RegisteredVehicle** - зарегистрированные транспортные средства
  - Поля: vinNumber, plate, model, color, registrationStatus, insuranceStatus
  - Связи: user (User), citizen (Citizen), model (VehicleValue)
- **VehicleValue** - модели транспортных средств
- **ImpoundedVehicle** - конфискованные транспортные средства

#### Оружие
- **Weapon** - оружие
  - Поля: serialNumber, registrationStatus, model
  - Связи: user (User), citizen (Citizen), model (WeaponValue)
- **WeaponValue** - модели оружия

#### Правоохранительные органы
- **Officer** - офицеры полиции
  - Поля: callsign, callsign2, rank, status, department, divisions[]
  - Связи: citizen (Citizen), user (User), department (DepartmentValue)
- **DepartmentValue** - департаменты
- **DivisionValue** - подразделения
- **StatusValue** - статусы
- **CombinedLeoUnit** - объединенные подразделения полиции

#### EMS/FD
- **EmsFdDeputy** - сотрудники EMS/FD
  - Поля: callsign, callsign2, rank, status, department, division
  - Связи: citizen (Citizen), user (User), department (DepartmentValue)
- **CombinedEmsFdUnit** - объединенные подразделения EMS/FD

#### Инциденты и вызовы
- **LeoIncident** - инциденты полиции
  - Поля: caseNumber, description, isActive, firearmsInvolved, injuriesOrFatalities
  - Связи: creator (Officer), officersInvolved (Officer[]), unitsInvolved (IncidentInvolvedUnit[])
- **EmsFdIncident** - инциденты EMS/FD
- **Call911** - вызовы 911
  - Поля: caseNumber, location, description, name, ended, isSignal100
  - Связи: assignedUnits (AssignedUnit[]), incidents (LeoIncident[])
- **IncidentEvent** - события инцидентов
- **Call911Event** - события вызовов

#### Записи и ордера
- **Record** - записи (билеты, аресты, предупреждения)
  - Поля: caseNumber, type, publishStatus, citizenId, officerId
  - Связи: citizen (Citizen), officer (Officer), violations (Violation[])
- **Warrant** - ордера на арест
  - Поля: caseNumber, description, status, citizenId, officerId
  - Связи: citizen (Citizen), officer (Officer), assignedOfficers (AssignedWarrantOfficer[])
- **Violation** - нарушения
- **PenalCode** - уголовные кодексы
- **PenalCodeGroup** - группы уголовных кодексов

#### Бизнес
- **Business** - бизнесы
  - Поля: name, address, whitelisted, status
  - Связи: user (User), employees (Employee[]), vehicles (RegisteredVehicle[])
- **Employee** - сотрудники бизнеса
- **BusinessPost** - посты бизнеса
- **EmployeeValue** - роли сотрудников

#### Дополнительные сервисы
- **TowCall** - вызовы эвакуатора
- **TaxiCall** - вызовы такси
- **Bolo** - BOLO (Be On Look Out)
- **BleeterPost** - посты в социальной сети
- **BleeterProfile** - профили в социальной сети

#### Значения и справочники
- **Value** - справочные значения (лицензии, пол, этническая принадлежность и т.д.)
- **AddressValue** - адреса
- **DriversLicenseCategoryValue** - категории водительских прав
- **QualificationValue** - квалификации

### Перечисления (Enums)
- **Rank**: OWNER, ADMIN, USER
- **WhitelistStatus**: ACCEPTED, PENDING, DECLINED
- **ValueType**: LICENSE, GENDER, ETHNICITY, VEHICLE, WEAPON, DEPARTMENT, OFFICER_RANK и др.
- **RecordType**: ARREST_REPORT, TICKET, WRITTEN_WARNING
- **WarrantStatus**: ACTIVE, INACTIVE
- **Feature**: BLEETER, TOW, TAXI, COURTHOUSE, BUSINESS и др.

## 2. HTTP API Эндпоинты

### Аутентификация (/auth)
- **POST** `/auth/login` - вход в систему
- **POST** `/auth/register` - регистрация пользователя

### Discord аутентификация (/auth/discord)
- **GET** `/auth/discord` - аутентификация через Discord

### Steam аутентификация (/auth/steam)
- **GET** `/auth/steam` - аутентификация через Steam

### 2FA (/2fa)
- **POST** `/2fa/enable` - включить 2FA
- **POST** `/2fa/disable` - отключить 2FA
- **POST** `/2fa/verify` - проверить 2FA код

### Пользователь (/user)
- **GET** `/user` - получить данные пользователя
- **PUT** `/user` - обновить данные пользователя
- **DELETE** `/user` - удалить пользователя

### API токены пользователя (/user/api-token)
- **GET** `/user/api-token` - получить API токен
- **POST** `/user/api-token` - создать API токен
- **DELETE** `/user/api-token` - удалить API токен

### Уведомления (/notifications)
- **GET** `/notifications/officer` - уведомления для офицеров
- **GET** `/notifications/admin` - уведомления для администраторов

### Граждане (/citizen)
- **GET** `/citizen` - получить список граждан
- **POST** `/citizen` - создать гражданина
- **GET** `/citizen/:id` - получить гражданина по ID
- **PUT** `/citizen/:id` - обновить гражданина
- **DELETE** `/citizen/:id` - удалить гражданина

### Транспортные средства (/vehicles)
- **GET** `/vehicles` - получить список транспортных средств
- **POST** `/vehicles` - создать транспортное средство
- **GET** `/vehicles/:id` - получить транспортное средство по ID
- **PUT** `/vehicles/:id` - обновить транспортное средство
- **DELETE** `/vehicles/:id` - удалить транспортное средство

### Оружие (/weapons)
- **GET** `/weapons` - получить список оружия
- **POST** `/weapons` - создать оружие
- **GET** `/weapons/:id` - получить оружие по ID
- **PUT** `/weapons/:id` - обновить оружие
- **DELETE** `/weapons/:id` - удалить оружие

### Лицензии (/licenses)
- **GET** `/licenses` - получить лицензии
- **POST** `/licenses` - создать лицензию
- **PUT** `/licenses/:id` - обновить лицензию

### Медицинские записи (/medical-records)
- **GET** `/medical-records` - получить медицинские записи
- **POST** `/medical-records` - создать медицинскую запись
- **PUT** `/medical-records/:id` - обновить медицинскую запись
- **DELETE** `/medical-records/:id` - удалить медицинскую запись

### Домашние животные (/pets)
- **GET** `/pets` - получить список домашних животных
- **POST** `/pets` - создать домашнее животное
- **GET** `/pets/:id` - получить домашнее животное по ID
- **PUT** `/pets/:id` - обновить домашнее животное
- **DELETE** `/pets/:id` - удалить домашнее животное

### Логи грузовиков (/truck-logs)
- **GET** `/truck-logs` - получить логи грузовиков
- **POST** `/truck-logs` - создать лог грузовика
- **PUT** `/truck-logs/:id` - обновить лог грузовика
- **DELETE** `/truck-logs/:id` - удалить лог грузовика

### Полиция (/leo)
- **GET** `/leo` - получить офицеров
- **POST** `/leo` - создать офицера
- **GET** `/leo/:id` - получить офицера по ID
- **PUT** `/leo/:id` - обновить офицера
- **DELETE** `/leo/:id` - удалить офицера

### Бюро огнестрельного оружия (/leo/bureau-of-firearms)
- **GET** `/leo/bureau-of-firearms` - получить ожидающие оружия
- **POST** `/leo/bureau-of-firearms/:weaponId` - принять/отклонить оружие

### DMV (/leo/dmv)
- **GET** `/leo/dmv` - получить ожидающие транспортные средства
- **POST** `/leo/dmv/:vehicleId` - принять/отклонить транспортное средство

### Тюрьма (/leo/jail)
- **POST** `/leo/jail` - отправить в тюрьму
- **PUT** `/leo/jail/:id` - обновить тюремное заключение

### Экзамены на лицензии (/leo/license-exams)
- **GET** `/leo/license-exams` - получить экзамены
- **POST** `/leo/license-exams` - создать экзамен
- **PUT** `/leo/license-exams/:id` - обновить экзамен

### Инциденты (/incidents)
- **GET** `/incidents` - получить инциденты
- **POST** `/incidents` - создать инцидент
- **GET** `/incidents/:id` - получить инцидент по ID
- **PUT** `/incidents/:id` - обновить инцидент
- **DELETE** `/incidents/:id` - удалить инцидент

### События инцидентов (/incidents/events)
- **POST** `/incidents/events/:incidentId` - создать событие инцидента

### EMS/FD (/ems-fd)
- **GET** `/ems-fd` - получить сотрудников EMS/FD
- **POST** `/ems-fd` - создать сотрудника EMS/FD
- **GET** `/ems-fd/:id` - получить сотрудника EMS/FD по ID
- **PUT** `/ems-fd/:id` - обновить сотрудника EMS/FD
- **DELETE** `/ems-fd/:id` - удалить сотрудника EMS/FD
- **POST** `/ems-fd/declare/:citizenId` - объявить гражданина мертвым/живым

### Инциденты EMS/FD (/ems-fd/incidents)
- **GET** `/ems-fd/incidents` - получить инциденты EMS/FD
- **POST** `/ems-fd/incidents` - создать инцидент EMS/FD
- **GET** `/ems-fd/incidents/:id` - получить инцидент EMS/FD по ID
- **PUT** `/ems-fd/incidents/:id` - обновить инцидент EMS/FD
- **DELETE** `/ems-fd/incidents/:id` - удалить инцидент EMS/FD

### Диспетчеризация (/dispatch)
- **GET** `/dispatch` - получить данные диспетчеризации
- **POST** `/dispatch` - создать вызов
- **PUT** `/dispatch/:id` - обновить вызов
- **DELETE** `/dispatch/:id` - удалить вызов

### Статусы диспетчеризации (/dispatch/status)
- **PUT** `/dispatch/status/:unitId` - обновить статус подразделения

### Объединенные подразделения (/dispatch/status)
- **GET** `/dispatch/status` - получить объединенные подразделения
- **POST** `/dispatch/status` - создать объединенное подразделение
- **PUT** `/dispatch/status/:id` - обновить объединенное подразделение
- **DELETE** `/dispatch/status/:id` - удалить объединенное подразделение

### Временные подразделения (/temporary-units)
- **GET** `/temporary-units` - получить временные подразделения
- **POST** `/temporary-units` - создать временное подразделение
- **PUT** `/temporary-units/:id` - обновить временное подразделение
- **DELETE** `/temporary-units/:id` - удалить временное подразделение

### Вызовы 911 (/911-calls)
- **GET** `/911-calls` - получить вызовы 911
- **POST** `/911-calls` - создать вызов 911
- **GET** `/911-calls/:id` - получить вызов 911 по ID
- **PUT** `/911-calls/:id` - обновить вызов 911
- **DELETE** `/911-calls/:id` - удалить вызов 911

### События вызовов 911 (/911-calls/events)
- **POST** `/911-calls/events/:callId` - создать событие вызова

### BOLO (/bolos)
- **GET** `/bolos` - получить BOLO
- **POST** `/bolos` - создать BOLO
- **GET** `/bolos/:id` - получить BOLO по ID
- **PUT** `/bolos/:id` - обновить BOLO
- **DELETE** `/bolos/:id` - удалить BOLO

### Приватные сообщения (/dispatch/private-message)
- **GET** `/dispatch/private-message` - получить приватные сообщения
- **POST** `/dispatch/private-message` - отправить приватное сообщение

### Поиск (/search)
- **GET** `/search` - поиск граждан, транспортных средств, оружия

### Действия поиска (/search/actions)
- **POST** `/search/actions` - выполнить действия поиска

### Заметки (/notes)
- **GET** `/notes` - получить заметки
- **POST** `/notes` - создать заметку
- **PUT** `/notes/:id` - обновить заметку
- **DELETE** `/notes/:id` - удалить заметку

### Записи (/records)
- **GET** `/records` - получить записи
- **POST** `/records` - создать запись
- **GET** `/records/:id` - получить запись по ID
- **PUT** `/records/record/:id` - обновить запись
- **DELETE** `/records/:id` - удалить запись

### Ордера на арест (/records)
- **POST** `/records/warrant` - создать ордер на арест
- **PUT** `/records/warrant/:id` - обновить ордер на арест
- **DELETE** `/records/warrant/:id` - удалить ордер на арест

### Бизнесы (/businesses)
- **GET** `/businesses` - получить бизнесы
- **POST** `/businesses` - создать бизнес
- **GET** `/businesses/:id` - получить бизнес по ID
- **PUT** `/businesses/:id` - обновить бизнес
- **DELETE** `/businesses/:id` - удалить бизнес

### Сотрудники бизнеса (/businesses/employees)
- **GET** `/businesses/employees` - получить сотрудников
- **POST** `/businesses/employees` - создать сотрудника
- **PUT** `/businesses/employees/:id` - обновить сотрудника
- **DELETE** `/businesses/employees/:id` - удалить сотрудника

### Роли бизнеса (/businesses/roles)
- **GET** `/businesses/roles` - получить роли бизнеса
- **POST** `/businesses/roles` - создать роль бизнеса
- **PUT** `/businesses/roles/:id` - обновить роль бизнеса
- **DELETE** `/businesses/roles/:id` - удалить роль бизнеса

### Посты бизнеса (/businesses/posts)
- **GET** `/businesses/posts` - получить посты бизнеса
- **POST** `/businesses/posts` - создать пост бизнеса
- **PUT** `/businesses/posts/:id` - обновить пост бизнеса
- **DELETE** `/businesses/posts/:id` - удалить пост бизнеса

### Эвакуатор (/tow)
- **GET** `/tow` - получить вызовы эвакуатора
- **POST** `/tow` - создать вызов эвакуатора
- **GET** `/tow/:id` - получить вызов эвакуатора по ID
- **PUT** `/tow/:id` - обновить вызов эвакуатора
- **DELETE** `/tow/:id` - удалить вызов эвакуатора

### Такси (/taxi)
- **GET** `/taxi` - получить вызовы такси
- **POST** `/taxi` - создать вызов такси
- **GET** `/taxi/:id` - получить вызов такси по ID
- **PUT** `/taxi/:id` - обновить вызов такси
- **DELETE** `/taxi/:id` - удалить вызов такси

### Bleeter (/bleeter)
- **GET** `/bleeter` - получить посты Bleeter
- **POST** `/bleeter` - создать пост Bleeter
- **GET** `/bleeter/:id` - получить пост Bleeter по ID
- **PUT** `/bleeter/:id` - обновить пост Bleeter
- **DELETE** `/bleeter/:id` - удалить пост Bleeter

### Профили Bleeter (/bleeter/profiles)
- **GET** `/bleeter/profiles/:handle` - получить профиль Bleeter

### Суд (/court-entries)
- **GET** `/court-entries` - получить судебные записи
- **POST** `/court-entries` - создать судебную запись
- **GET** `/court-entries/:id` - получить судебную запись по ID
- **PUT** `/court-entries/:id` - обновить судебную запись
- **DELETE** `/court-entries/:id` - удалить судебную запись

### Посты суда (/courthouse-posts)
- **GET** `/courthouse-posts` - получить посты суда
- **POST** `/courthouse-posts` - создать пост суда
- **PUT** `/courthouse-posts/:id` - обновить пост суда
- **DELETE** `/courthouse-posts/:id` - удалить пост суда

### Запросы на удаление записей (/expungement-requests)
- **GET** `/expungement-requests` - получить запросы на удаление записей
- **POST** `/expungement-requests` - создать запрос на удаление записей
- **PUT** `/expungement-requests/:id` - обновить запрос на удаление записей

### Запросы на смену имени (/name-change)
- **GET** `/name-change` - получить запросы на смену имени
- **POST** `/name-change` - создать запрос на смену имени
- **PUT** `/name-change/:id` - обновить запрос на смену имени

### Администрация (/admin)
- **GET** `/admin` - получить данные административной панели

### Управление пользователями (/admin/manage/users)
- **GET** `/admin/manage/users` - получить пользователей
- **POST** `/admin/manage/users` - создать пользователя
- **PUT** `/admin/manage/users/:id` - обновить пользователя
- **DELETE** `/admin/manage/users/:id` - удалить пользователя

### Управление гражданами (/admin/manage/citizens)
- **GET** `/admin/manage/citizens` - получить граждан
- **POST** `/admin/manage/citizens` - создать гражданина
- **PUT** `/admin/manage/citizens/:id` - обновить гражданина
- **DELETE** `/admin/manage/citizens/:id` - удалить гражданина

### Управление бизнесами (/admin/manage/businesses)
- **GET** `/admin/manage/businesses` - получить бизнесы
- **POST** `/admin/manage/businesses` - создать бизнес
- **PUT** `/admin/manage/businesses/:id` - обновить бизнес
- **DELETE** `/admin/manage/businesses/:id` - удалить бизнес

### Управление подразделениями (/admin/manage/units)
- **GET** `/admin/manage/units` - получить подразделения
- **POST** `/admin/manage/units` - создать подразделение
- **PUT** `/admin/manage/units/:id` - обновить подразделение
- **DELETE** `/admin/manage/units/:id` - удалить подразделение

### Управление настройками CAD (/admin/manage/cad-settings)
- **GET** `/admin/manage/cad-settings` - получить настройки CAD
- **PUT** `/admin/manage/cad-settings` - обновить настройки CAD

### Управление значениями (/admin/values/:path)
- **GET** `/admin/values/:path` - получить значения по типу
- **POST** `/admin/values/:path` - создать значение
- **PUT** `/admin/values/:path/:id` - обновить значение
- **DELETE** `/admin/values/:path/:id` - удалить значение
- **PATCH** `/admin/values/:path/:id` - частично обновить значение

### Импорт данных (/admin/import)
- **POST** `/admin/import/citizens` - импорт граждан
- **POST** `/admin/import/vehicles` - импорт транспортных средств
- **POST** `/admin/import/weapons` - импорт оружия

## 3. Socket.IO События

### Основные события
- **CreateTowCall** - создание вызова эвакуатора
- **UpdateTowCall** - обновление вызова эвакуатора
- **EndTowCall** - завершение вызова эвакуатора

- **CreateTaxiCall** - создание вызова такси
- **UpdateTaxiCall** - обновление вызова такси
- **EndTaxiCall** - завершение вызова такси

- **Create911Call** - создание вызова 911
- **Update911Call** - обновление вызова 911
- **End911Call** - завершение вызова 911

- **CreateBolo** - создание BOLO
- **UpdateBolo** - обновление BOLO
- **DeleteBolo** - удаление BOLO

### Статусы и состояния
- **UpdateAreaOfPlay** - обновление области игры
- **UpdateOfficerStatus** - обновление статуса офицеров
- **UpdateEmsFdStatus** - обновление статуса EMS/FD
- **UpdateDispatchersState** - обновление состояния диспетчеров
- **SetUnitOffDuty** - установка подразделения вне дежурства
- **UpdateUnitStatus** - обновление статуса подразделения

### Пользователи
- **UserBanned** - пользователь заблокирован
- **UserDeleted** - пользователь удален

### Сигналы и тревоги
- **Signal100** - сигнал 100
- **PANIC_BUTTON_ON** - кнопка паники включена
- **PANIC_BUTTON_OFF** - кнопка паники выключена

### Инциденты и ордера
- **CreateActiveIncident** - создание активного инцидента
- **UpdateActiveIncident** - обновление активного инцидента
- **CreateActiveWarrant** - создание активного ордера
- **UpdateActiveWarrant** - обновление активного ордера

### Дополнительные события
- **RoleplayStopped** - ролевая игра остановлена
- **Tones** - тона
- **PrivateMessage** - приватное сообщение

## 4. Архитектурные особенности

### Многоуровневая архитектура
- **Контроллеры** - обработка HTTP запросов
- **Сервисы** - бизнес-логика
- **Модели** - работа с базой данных
- **Middleware** - промежуточная обработка

### Система разрешений
- Гранулярные разрешения для разных ролей
- Поддержка кастомных ролей
- Интеграция с Discord ролями

### Webhook система
- Discord webhooks для уведомлений
- Raw webhooks для внешних интеграций
- Поддержка различных типов событий

### Реальное время
- Socket.IO для обновлений в реальном времени
- Автоматические обновления статусов
- Уведомления о событиях

### Мультитенантность
- Поддержка множественных CAD систем
- Изоляция данных между системами
- Настройки на уровне CAD

### Расширяемость
- Система функций (Features)
- Кастомные поля
- API токены для интеграций

## 5. Заключение

SnailyCAD v4 представляет собой комплексную систему управления CAD с богатым функционалом для правоохранительных органов, EMS/FD и диспетчерских служб. Система построена на современном стеке технологий с использованием TypeScript, Prisma ORM и Socket.IO для работы в реальном времени.

Основные преимущества архитектуры:
- Модульная структура с четким разделением ответственности
- Гибкая система разрешений и ролей
- Поддержка множественных CAD систем
- Интеграция с внешними сервисами (Discord, Steam)
- Реальное время обновления данных
- Расширяемая система функций и настроек 