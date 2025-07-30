# Таблица маппинга моделей данных: RolePlayIdentity ↔ SnailyCAD

## Краткое резюме

| Наша система | SnailyCAD | Соответствие | Статус | Приоритет |
|-------------|-----------|--------------|--------|-----------|
| `users` | `User` | ✅ Полное | Готово | - |
| `characters` | `Citizen` | ✅ Частичное | Требует расширения | Высокий |
| `characters` (type: 'leo') | `Officer` | ✅ Частичное | Требует расширения | Высокий |
| `departments` | `DepartmentValue` | ✅ Частичное | Готово | - |
| `ranks` | `Value` (rank) | ✅ Частичное | Готово | - |
| `divisions` | `DivisionValue` | ✅ Частичное | Готово | - |
| `vehicles` | `RegisteredVehicle` | ✅ Частичное | Требует расширения | Средний |
| `weapons` | `Weapon` | ✅ Частичное | Требует расширения | Низкий |
| `pets` | `Pet` | ✅ Полное | Готово | - |
| `records` | `Record` | ✅ Частичное | Требует расширения | Средний |
| `call911` | `Call911` | ✅ Частичное | Требует расширения | Высокий |
| `applications` | ❌ Отсутствует | ❌ Нет соответствия | Уникальная функция | - |
| ❌ Отсутствует | `Business` | ❌ Нет соответствия | Требует создания | Критично |
| ❌ Отсутствует | `MedicalRecord` | ❌ Нет соответствия | Требует создания | Высокий |

## Детальная таблица соответствий

### 1. Основные сущности

#### 1.1 Пользователи
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `users.id` | `User.id` | String | ✅ | Готово |
| `users.email` | `User.email` | String | ✅ | Готово |
| `users.passwordHash` | `User.password` | String | ✅ | Готово |
| `users.siteRole` | `User.role` | String | ✅ | Готово |
| `users.discordId` | `User.discordId` | String | ✅ | Готово |
| `users.apiToken` | `User.apiToken` | String | ✅ | Готово |
| ❌ Отсутствует | `User.username` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `User.isDarkTheme` | Boolean | ❌ | Требует добавления |
| ❌ Отсутствует | `User.soundSettings` | Json | ❌ | Требует добавления |
| ❌ Отсутствует | `User.2FA` | Boolean | ❌ | Требует добавления |

#### 1.2 Персонажи (Граждане)
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `characters.id` | `Citizen.id` | String | ✅ | Готово |
| `characters.ownerId` | `Citizen.userId` | String | ✅ | Готово |
| `characters.firstName` | `Citizen.name` | String | ✅ | Готово |
| `characters.lastName` | `Citizen.surname` | String | ✅ | Готово |
| `characters.dob` | `Citizen.dateOfBirth` | Date | ✅ | Готово |
| `characters.address` | `Citizen.address` | String | ✅ | Готово |
| `characters.insuranceNumber` | `Citizen.socialSecurityNumber` | String | ✅ | Готово |
| `characters.licenses` | `Citizen.driversLicense`, etc. | Json | ✅ | Готово |
| `characters.medicalInfo` | `Citizen.medicalRecords` | Json | ✅ | Готово |
| `characters.mugshotUrl` | `Citizen.imageId` | String | ✅ | Готово |
| ❌ Отсутствует | `Citizen.gender` | Value | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.ethnicity` | Value | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.hairColor` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.eyeColor` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.height` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.weight` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.phoneNumber` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.postal` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.occupation` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.dead` | Boolean | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.missing` | Boolean | ❌ | Требует добавления |
| ❌ Отсутствует | `Citizen.arrested` | Boolean | ❌ | Требует добавления |

#### 1.3 Офицеры (специализация персонажей)
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `characters.departmentId` | `Officer.departmentId` | String | ✅ | Готово |
| `characters.rankId` | `Officer.rankId` | String | ✅ | Готово |
| `characters.badgeNumber` | `Officer.badgeNumber` | String | ✅ | Готово |
| `characters.status` | `Officer.statusId` | String | ✅ | Готово |
| ❌ Отсутствует | `Officer.callsign` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Officer.callsign2` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Officer.suspended` | Boolean | ❌ | Требует добавления |
| ❌ Отсутствует | `Officer.whitelistStatus` | LeoWhitelistStatus | ❌ | Требует добавления |
| ❌ Отсутствует | `Officer.radioChannelId` | String | ❌ | Требует добавления |

### 2. Организационные сущности

#### 2.1 Департаменты
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `departments.id` | `DepartmentValue.id` | String | ✅ | Готово |
| `departments.name` | `DepartmentValue.value.value` | String | ✅ | Готово |
| `departments.type` | `DepartmentValue.type` | DepartmentType | ✅ | Готово |
| ❌ Отсутствует | `DepartmentValue.callsign` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `DepartmentValue.whitelisted` | Boolean | ❌ | Требует добавления |
| ❌ Отсутствует | `DepartmentValue.isDefaultDepartment` | Boolean | ❌ | Требует добавления |

#### 2.2 Звания
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `ranks.id` | `Value.id` (rank) | String | ✅ | Готово |
| `ranks.name` | `Value.value` | String | ✅ | Готово |
| `ranks.departmentId` | `Value.departments` | String | ✅ | Готово |
| `ranks.orderIndex` | ❌ Отсутствует | Integer | ❌ | Уникальная функция |

#### 2.3 Подразделения
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `divisions.id` | `DivisionValue.id` | String | ✅ | Готово |
| `divisions.name` | `DivisionValue.value.value` | String | ✅ | Готово |
| `divisions.departmentId` | `DivisionValue.departmentId` | String | ✅ | Готово |
| `divisions.description` | ❌ Отсутствует | String | ❌ | Уникальная функция |

### 3. Имущество и активы

#### 3.1 Транспортные средства
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `vehicles.id` | `RegisteredVehicle.id` | String | ✅ | Готово |
| `vehicles.ownerId` | `RegisteredVehicle.citizenId` | String | ✅ | Готово |
| `vehicles.plate` | `RegisteredVehicle.plate` | String | ✅ | Готово |
| `vehicles.vin` | `RegisteredVehicle.vin` | String | ✅ | Готово |
| `vehicles.model` | `RegisteredVehicle.modelId` | String | ✅ | Готово |
| `vehicles.color` | `RegisteredVehicle.color` | String | ✅ | Готово |
| `vehicles.registration` | `RegisteredVehicle.registrationStatus` | String | ✅ | Готово |
| ❌ Отсутствует | `RegisteredVehicle.insuranceStatus` | VehicleInspectionStatus | ❌ | Требует добавления |
| ❌ Отсутствует | `RegisteredVehicle.taxStatus` | VehicleTaxStatus | ❌ | Требует добавления |
| ❌ Отсутствует | `RegisteredVehicle.inspectionStatus` | VehicleInspectionStatus | ❌ | Требует добавления |

#### 3.2 Оружие
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `weapons.id` | `Weapon.id` | String | ✅ | Готово |
| `weapons.ownerId` | `Weapon.citizenId` | String | ✅ | Готово |
| `weapons.serialNumber` | `Weapon.serialNumber` | String | ✅ | Готово |
| `weapons.model` | `Weapon.modelId` | String | ✅ | Готово |
| `weapons.registration` | `Weapon.registrationStatus` | String | ✅ | Готово |
| ❌ Отсутствует | `Weapon.imageId` | String | ❌ | Требует добавления |
| ❌ Отсутствует | `Weapon.notes` | String | ❌ | Требует добавления |

#### 3.3 Питомцы
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `pets.id` | `Pet.id` | String | ✅ | Готово |
| `pets.ownerId` | `Pet.citizenId` | String | ✅ | Готово |
| `pets.name` | `Pet.name` | String | ✅ | Готово |
| `pets.breed` | `Pet.breed` | String | ✅ | Готово |
| `pets.color` | `Pet.color` | String | ✅ | Готово |
| `pets.medicalNotes` | `Pet.medicalRecords` | String | ✅ | Готово |

### 4. Операционные сущности

#### 4.1 Вызовы экстренных служб
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `call911.id` | `Call911.id` | String | ✅ | Готово |
| `call911.location` | `Call911.location` | String | ✅ | Готово |
| `call911.description` | `Call911.description` | String | ✅ | Готово |
| `call911.status` | `Call911.status` | String | ✅ | Готово |
| `call911.type` | `Call911.type` | String | ✅ | Готово |
| `call911.priority` | `Call911.priority` | Integer | ✅ | Готово |
| ❌ Отсутствует | `Call911.assignedUnits` | AssignedUnit[] | ❌ | Требует добавления |
| ❌ Отсутствует | `Call911.events` | Call911Event[] | ❌ | Требует добавления |

#### 4.2 Записи о правонарушениях
| Поле RolePlayIdentity | Поле SnailyCAD | Тип | Соответствие | Статус |
|----------------------|----------------|-----|--------------|--------|
| `records.id` | `Record.id` | String | ✅ | Готово |
| `records.characterId` | `Record.citizenId` | String | ✅ | Готово |
| `records.officerId` | `Record.officerId` | String | ✅ | Готово |
| `records.type` | `Record.type` | RecordType | ✅ | Готово |
| `records.description` | `Record.description` | String | ✅ | Готово |
| `records.date` | `Record.createdAt` | DateTime | ✅ | Готово |
| ❌ Отсутствует | `Record.charges` | PenalCode[] | ❌ | Требует добавления |
| ❌ Отсутствует | `Record.warrants` | Warrant[] | ❌ | Требует добавления |

### 5. Отсутствующие сущности в RolePlayIdentity

#### 5.1 Бизнесы (критично)
| Сущность SnailyCAD | Описание | Статус | Приоритет |
|-------------------|----------|--------|-----------|
| `Business` | Основная сущность бизнеса | ❌ Отсутствует | Критично |
| `Employee` | Сотрудники бизнеса | ❌ Отсутствует | Критично |
| `BusinessPost` | Посты от бизнеса | ❌ Отсутствует | Критично |
| `EmployeeValue` | Роли сотрудников | ❌ Отсутствует | Критично |

#### 5.2 Медицинские записи (высокий приоритет)
| Сущность SnailyCAD | Описание | Статус | Приоритет |
|-------------------|----------|--------|-----------|
| `MedicalRecord` | Медицинские записи | ❌ Отсутствует | Высокий |
| `DoctorVisit` | Посещения врача | ❌ Отсутствует | Высокий |

#### 5.3 Система инцидентов (средний приоритет)
| Сущность SnailyCAD | Описание | Статус | Приоритет |
|-------------------|----------|--------|-----------|
| `LeoIncident` | Инциденты полиции | ❌ Отсутствует | Средний |
| `IncidentEvent` | События инцидентов | ❌ Отсутствует | Средний |
| `CombinedLeoUnit` | Объединенные юниты | ❌ Отсутствует | Средний |

#### 5.4 Дополнительные системы (низкий приоритет)
| Сущность SnailyCAD | Описание | Статус | Приоритет |
|-------------------|----------|--------|-----------|
| `Warrant` | Ордера на арест | ❌ Отсутствует | Низкий |
| `Bolo` | Бюллетени о розыске | ❌ Отсутствует | Низкий |
| `TowCall` | Вызовы эвакуатора | ❌ Отсутствует | Низкий |
| `TaxiCall` | Вызовы такси | ❌ Отсутствует | Низкий |

### 6. Уникальные функции RolePlayIdentity

#### 6.1 Система заявок
| Функция RolePlayIdentity | Описание | Статус |
|-------------------------|----------|--------|
| `applications` | Система заявок на вступление/повышение | ✅ Уникальная |
| `supportTickets` | Система тикетов поддержки | ✅ Уникальная |
| `complaints` | Система жалоб | ✅ Уникальная |

#### 6.2 Система тестирования
| Функция RolePlayIdentity | Описание | Статус |
|-------------------------|----------|--------|
| `tests` | Система тестов | ✅ Уникальная |
| `testSessions` | Сессии тестирования | ✅ Уникальная |
| `testResults` | Результаты тестов | ✅ Уникальная |

#### 6.3 Система достижений
| Функция RolePlayIdentity | Описание | Статус |
|-------------------------|----------|--------|
| `achievements` | Система достижений | ✅ Уникальная |
| `badges` | Система значков | ✅ Уникальная |
| `userStats` | Статистика пользователей | ✅ Уникальная |

## Итоговая оценка совместимости

### Уровень совместимости: 65%

**Готовые к интеграции (35%):**
- Пользователи
- Питомцы
- Базовая структура персонажей
- Базовая структура департаментов
- Базовая структура званий и подразделений

**Требуют расширения (30%):**
- Персонажи (демографические данные, статусы)
- Офицеры (позывные, служебная информация)
- Транспортные средства (статусы страховки, налогов)
- Оружие (изображения, заметки)
- Вызовы (назначенные юниты, события)
- Записи (обвинения, ордера)

**Требуют создания (35%):**
- Система бизнесов
- Медицинские записи
- Система инцидентов
- Дополнительные операционные системы

### Рекомендации по интеграции

1. **Начать с расширения characters** - добавить демографические поля и статусы
2. **Создать систему бизнесов** - критично для полноценной интеграции
3. **Расширить officer-specific поля** - позывные, служебная информация
4. **Добавить медицинские записи** - высокий приоритет
5. **Расширить операционные системы** - вызовы, инциденты, записи 