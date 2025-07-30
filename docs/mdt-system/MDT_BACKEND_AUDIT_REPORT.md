# 🔍 АУДИТ MDT СИСТЕМЫ - ОТЧЕТ

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

### ✅ Реализованные компоненты

#### Клиентская часть (@mdtclient/)
- ✅ Система ролей (Citizen, LEO, EMS/FD, Dispatch, Admin)
- ✅ Портал граждан (управление персонажами, транспорт, компании)
- ✅ Портал правоохранительных органов (поиск, отчеты, сигналы)
- ✅ Портал EMS/FD (медицинские/пожарные вызовы, отчеты)
- ✅ Система диспетчеризации
- ✅ Административная панель
- ✅ Система уведомлений и сигналов
- ✅ Мультиязычность (EN/RU)

#### Серверная часть (@server/)
- ✅ Аутентификация и авторизация
- ✅ Управление пользователями и персонажами
- ✅ Система заявок и отчетов
- ✅ Тестирование
- ✅ Форум
- ✅ Discord интеграция
- ✅ Планировщик задач

## 🚨 КРИТИЧЕСКИЕ НЕДОСТАТКИ

### 1. ОТСУТСТВУЮЩИЕ ТАБЛИЦЫ В БАЗЕ ДАННЫХ

#### 1.1 Система MDT (Mobile Data Terminal)
```sql
-- Таблица для MDT юнитов
CREATE TABLE mdt_units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER REFERENCES characters(id),
  unit_number VARCHAR(10) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  status VARCHAR(20) DEFAULT 'available',
  location JSONB,
  current_call_id INTEGER,
  partner_id INTEGER REFERENCES mdt_units(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  is_panic BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для MDT вызовов 911
CREATE TABLE mdt_calls_911 (
  id SERIAL PRIMARY KEY,
  caller_name VARCHAR(100),
  caller_phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- police, fire, ems
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_units INTEGER[],
  patient_info JSONB,
  fire_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для привязки юнитов к вызовам
CREATE TABLE mdt_call_attachments (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES mdt_calls_911(id),
  unit_id INTEGER REFERENCES mdt_units(id),
  status VARCHAR(20) DEFAULT 'en_route',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Система сигналов и уведомлений
```sql
-- Таблица для сигналов
CREATE TABLE mdt_signals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- LEO, EMS_FD
  author_id INTEGER REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  location VARCHAR(255),
  coordinates JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для уведомлений о сигналах
CREATE TABLE mdt_signal_notifications (
  id SERIAL PRIMARY KEY,
  signal_id INTEGER REFERENCES mdt_signals(id),
  recipient_id INTEGER REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Система отчетов правоохранительных органов
```sql
-- Таблица для отчетов LEO
CREATE TABLE law_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  citizen_name VARCHAR(255) NOT NULL,
  incident_address VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  penal_code VARCHAR(50) NOT NULL,
  sanction_type VARCHAR(20) NOT NULL, -- warning, arrest, fine
  description TEXT NOT NULL,
  suspect_vehicle JSONB,
  seized_items TEXT[],
  suspect_weapon JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.4 Система EMS/FD отчетов
```sql
-- Таблица для EMS/FD отчетов
CREATE TABLE ems_fd_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  call_id INTEGER REFERENCES mdt_calls_911(id),
  type VARCHAR(20) NOT NULL, -- medical, fire, rescue
  patient_name VARCHAR(255),
  incident_location VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  treatment_provided TEXT,
  medications TEXT[],
  vital_signs JSONB,
  fire_details JSONB,
  outcome VARCHAR(255) NOT NULL,
  disposition VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.5 Система конфискации и штрафстоянки
```sql
-- Таблица для штрафстоянок
CREATE TABLE impound_lots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  capacity INTEGER NOT NULL,
  current_vehicles INTEGER DEFAULT 0,
  manager VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для конфискованных транспортных средств
CREATE TABLE impounded_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  impound_lot_id INTEGER REFERENCES impound_lots(id),
  impound_date TIMESTAMP NOT NULL,
  impound_reason TEXT NOT NULL,
  impounding_officer_id INTEGER REFERENCES users(id),
  release_date TIMESTAMP,
  release_officer_id INTEGER REFERENCES users(id),
  release_reason TEXT,
  fees DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'impounded',
  notes TEXT,
  evidence BOOLEAN DEFAULT FALSE,
  stolen BOOLEAN DEFAULT FALSE,
  damage TEXT,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.6 Система блокнотов и заметок
```sql
-- Таблица для заметок офицеров
CREATE TABLE notebook_notes (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- investigation, surveillance, arrest, warning, incident, other
  priority VARCHAR(20) DEFAULT 'medium',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.7 Система компаний и грузоперевозок
```sql
-- Таблица для компаний
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- corporation, llc, partnership
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для сотрудников компаний
CREATE TABLE company_employees (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  character_id INTEGER REFERENCES characters(id),
  position VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для грузоперевозок
CREATE TABLE cargo_shipments (
  id SERIAL PRIMARY KEY,
  cargo_type VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  weight_unit VARCHAR(10) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  driver_id INTEGER REFERENCES characters(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  status VARCHAR(20) DEFAULT 'pending',
  estimated_delivery TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. ОТСУТСТВУЮЩИЕ API ЭНДПОИНТЫ

#### 2.1 MDT API
```typescript
// MDT Units
GET    /api/mdt/units                    // Получить все активные юниты
POST   /api/mdt/units                    // Создать новый юнит
PUT    /api/mdt/units/:id/status         // Обновить статус юнита
PUT    /api/mdt/units/:id/location       // Обновить местоположение юнита
POST   /api/mdt/units/:id/panic          // Активировать панику

// MDT Calls 911
GET    /api/mdt/calls                    // Получить все вызовы
POST   /api/mdt/calls                    // Создать новый вызов
PUT    /api/mdt/calls/:id                // Обновить вызов
POST   /api/mdt/calls/:id/assign         // Назначить юниты на вызов
PUT    /api/mdt/calls/:id/status         // Обновить статус вызова

// MDT Signals
GET    /api/mdt/signals                  // Получить активные сигналы
POST   /api/mdt/signals                  // Создать новый сигнал
PUT    /api/mdt/signals/:id              // Обновить сигнал
DELETE /api/mdt/signals/:id              // Отозвать сигнал
POST   /api/mdt/signals/:id/notify       // Отправить уведомления
```

#### 2.2 Law Enforcement API
```typescript
// Law Reports
GET    /api/law/reports                  // Получить отчеты
POST   /api/law/reports                  // Создать отчет
PUT    /api/law/reports/:id              // Обновить отчет
DELETE /api/law/reports/:id              // Удалить отчет

// Search APIs
GET    /api/law/search/citizens          // Поиск граждан
GET    /api/law/search/vehicles          // Поиск транспортных средств
GET    /api/law/search/weapons           // Поиск оружия
GET    /api/law/search/addresses         // Поиск по адресам

// Notebook
GET    /api/law/notebook                 // Получить заметки
POST   /api/law/notebook                 // Создать заметку
PUT    /api/law/notebook/:id             // Обновить заметку
DELETE /api/law/notebook/:id             // Удалить заметку
```

#### 2.3 EMS/FD API
```typescript
// EMS/FD Reports
GET    /api/ems-fd/reports               // Получить отчеты
POST   /api/ems-fd/reports               // Создать отчет
PUT    /api/ems-fd/reports/:id           // Обновить отчет
DELETE /api/ems-fd/reports/:id           // Удалить отчет

// Patient Management
GET    /api/ems-fd/patients              // Получить пациентов
POST   /api/ems-fd/patients              // Создать пациента
PUT    /api/ems-fd/patients/:id          // Обновить пациента
GET    /api/ems-fd/patients/search       // Поиск пациентов
```

#### 2.4 Impound API
```typescript
// Impound Lots
GET    /api/impound/lots                 // Получить штрафстоянки
POST   /api/impound/lots                 // Создать штрафстоянку
PUT    /api/impound/lots/:id             // Обновить штрафстоянку

// Impounded Vehicles
GET    /api/impound/vehicles             // Получить конфискованные ТС
POST   /api/impound/vehicles             // Конфисковать ТС
PUT    /api/impound/vehicles/:id/release // Освободить ТС
GET    /api/impound/vehicles/:id         // Получить детали ТС
```

#### 2.5 Companies API
```typescript
// Companies
GET    /api/companies                    // Получить компании
POST   /api/companies                    // Создать компанию
PUT    /api/companies/:id                // Обновить компанию
DELETE /api/companies/:id                // Удалить компанию

// Employees
GET    /api/companies/:id/employees      // Получить сотрудников
POST   /api/companies/:id/employees      // Добавить сотрудника
PUT    /api/companies/:id/employees/:empId // Обновить сотрудника
DELETE /api/companies/:id/employees/:empId // Удалить сотрудника

// Cargo
GET    /api/cargo                        // Получить грузоперевозки
POST   /api/cargo                        // Создать грузоперевозку
PUT    /api/cargo/:id                    // Обновить грузоперевозку
DELETE /api/cargo/:id                    // Удалить грузоперевозку
```

### 3. ОТСУТСТВУЮЩИЕ СЕРВИСЫ

#### 3.1 MDT Service
```typescript
// apps/server/services/MDTService.ts
export class MDTService {
  // Управление юнитами
  async getActiveUnits(): Promise<MDTUnit[]>
  async createUnit(data: CreateUnitData): Promise<MDTUnit>
  async updateUnitStatus(unitId: number, status: string): Promise<MDTUnit>
  async updateUnitLocation(unitId: number, location: Location): Promise<MDTUnit>
  async activatePanic(unitId: number): Promise<void>

  // Управление вызовами
  async getCalls(): Promise<MDTCall911[]>
  async createCall(data: CreateCallData): Promise<MDTCall911>
  async assignUnitsToCall(callId: number, unitIds: number[]): Promise<void>
  async updateCallStatus(callId: number, status: string): Promise<MDTCall911>

  // Управление сигналами
  async getActiveSignals(): Promise<Signal[]>
  async createSignal(data: CreateSignalData): Promise<Signal>
  async revokeSignal(signalId: number): Promise<void>
  async notifySignal(signalId: number): Promise<void>
}
```

#### 3.2 Law Enforcement Service
```typescript
// apps/server/services/LawEnforcementService.ts
export class LawEnforcementService {
  // Поиск
  async searchCitizens(query: string): Promise<CitizenSearchResult[]>
  async searchVehicles(query: string): Promise<VehicleSearchResult[]>
  async searchWeapons(query: string): Promise<WeaponSearchResult[]>
  async searchAddresses(query: string): Promise<AddressSearchResult[]>

  // Отчеты
  async getLawReports(): Promise<LawReport[]>
  async createLawReport(data: CreateLawReportData): Promise<LawReport>
  async updateLawReport(id: number, data: UpdateLawReportData): Promise<LawReport>
  async deleteLawReport(id: number): Promise<void>

  // Блокнот
  async getNotebookNotes(userId: number): Promise<NotebookNote[]>
  async createNotebookNote(data: CreateNotebookNoteData): Promise<NotebookNote>
  async updateNotebookNote(id: number, data: UpdateNotebookNoteData): Promise<NotebookNote>
  async deleteNotebookNote(id: number): Promise<void>
}
```

#### 3.3 EMS/FD Service
```typescript
// apps/server/services/EmsFdService.ts
export class EmsFdService {
  // Отчеты
  async getEmsFdReports(): Promise<EmsFdReport[]>
  async createEmsFdReport(data: CreateEmsFdReportData): Promise<EmsFdReport>
  async updateEmsFdReport(id: number, data: UpdateEmsFdReportData): Promise<EmsFdReport>
  async deleteEmsFdReport(id: number): Promise<void>

  // Пациенты
  async getPatients(): Promise<EmsFdPatient[]>
  async createPatient(data: CreatePatientData): Promise<EmsFdPatient>
  async updatePatient(id: number, data: UpdatePatientData): Promise<EmsFdPatient>
  async searchPatients(query: string): Promise<EmsFdPatient[]>
}
```

#### 3.4 Impound Service
```typescript
// apps/server/services/ImpoundService.ts
export class ImpoundService {
  // Штрафстоянки
  async getImpoundLots(): Promise<ImpoundLot[]>
  async createImpoundLot(data: CreateImpoundLotData): Promise<ImpoundLot>
  async updateImpoundLot(id: number, data: UpdateImpoundLotData): Promise<ImpoundLot>

  // Конфискованные ТС
  async getImpoundedVehicles(): Promise<ImpoundedVehicle[]>
  async impoundVehicle(data: ImpoundVehicleData): Promise<ImpoundedVehicle>
  async releaseVehicle(vehicleId: number, data: ReleaseVehicleData): Promise<void>
  async getImpoundedVehicle(id: number): Promise<ImpoundedVehicle>
}
```

#### 3.5 Companies Service
```typescript
// apps/server/services/CompaniesService.ts
export class CompaniesService {
  // Компании
  async getCompanies(): Promise<Company[]>
  async createCompany(data: CreateCompanyData): Promise<Company>
  async updateCompany(id: number, data: UpdateCompanyData): Promise<Company>
  async deleteCompany(id: number): Promise<void>

  // Сотрудники
  async getCompanyEmployees(companyId: number): Promise<CompanyEmployee[]>
  async addEmployee(companyId: number, data: AddEmployeeData): Promise<CompanyEmployee>
  async updateEmployee(companyId: number, employeeId: number, data: UpdateEmployeeData): Promise<CompanyEmployee>
  async removeEmployee(companyId: number, employeeId: number): Promise<void>

  // Грузоперевозки
  async getCargoShipments(): Promise<CargoShipment[]>
  async createCargoShipment(data: CreateCargoShipmentData): Promise<CargoShipment>
  async updateCargoShipment(id: number, data: UpdateCargoShipmentData): Promise<CargoShipment>
  async deleteCargoShipment(id: number): Promise<void>
}
```

### 4. ОТСУТСТВУЮЩИЕ МИГРАЦИИ

#### 4.1 Создание новых таблиц
```sql
-- Миграция для MDT системы
-- supabase/migrations/004_mdt_system.sql

-- MDT Units
CREATE TABLE mdt_units (
  id SERIAL PRIMARY KEY,
  character_id INTEGER REFERENCES characters(id),
  unit_number VARCHAR(10) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  status VARCHAR(20) DEFAULT 'available',
  location JSONB,
  current_call_id INTEGER,
  partner_id INTEGER REFERENCES mdt_units(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  is_panic BOOLEAN DEFAULT FALSE,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Calls 911
CREATE TABLE mdt_calls_911 (
  id SERIAL PRIMARY KEY,
  caller_name VARCHAR(100),
  caller_phone VARCHAR(20),
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_units INTEGER[],
  patient_info JSONB,
  fire_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MDT Call Attachments
CREATE TABLE mdt_call_attachments (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES mdt_calls_911(id),
  unit_id INTEGER REFERENCES mdt_units(id),
  status VARCHAR(20) DEFAULT 'en_route',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Signals
CREATE TABLE mdt_signals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  author_id INTEGER REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  location VARCHAR(255),
  coordinates JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MDT Signal Notifications
CREATE TABLE mdt_signal_notifications (
  id SERIAL PRIMARY KEY,
  signal_id INTEGER REFERENCES mdt_signals(id),
  recipient_id INTEGER REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Law Reports
CREATE TABLE law_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  citizen_name VARCHAR(255) NOT NULL,
  incident_address VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  penal_code VARCHAR(50) NOT NULL,
  sanction_type VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  suspect_vehicle JSONB,
  seized_items TEXT[],
  suspect_weapon JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- EMS/FD Reports
CREATE TABLE ems_fd_reports (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  call_id INTEGER REFERENCES mdt_calls_911(id),
  type VARCHAR(20) NOT NULL,
  patient_name VARCHAR(255),
  incident_location VARCHAR(255) NOT NULL,
  incident_time TIMESTAMP NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  treatment_provided TEXT,
  medications TEXT[],
  vital_signs JSONB,
  fire_details JSONB,
  outcome VARCHAR(255) NOT NULL,
  disposition VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impound Lots
CREATE TABLE impound_lots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  capacity INTEGER NOT NULL,
  current_vehicles INTEGER DEFAULT 0,
  manager VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impounded Vehicles
CREATE TABLE impounded_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  impound_lot_id INTEGER REFERENCES impound_lots(id),
  impound_date TIMESTAMP NOT NULL,
  impound_reason TEXT NOT NULL,
  impounding_officer_id INTEGER REFERENCES users(id),
  release_date TIMESTAMP,
  release_officer_id INTEGER REFERENCES users(id),
  release_reason TEXT,
  fees DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'impounded',
  notes TEXT,
  evidence BOOLEAN DEFAULT FALSE,
  stolen BOOLEAN DEFAULT FALSE,
  damage TEXT,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notebook Notes
CREATE TABLE notebook_notes (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company Employees
CREATE TABLE company_employees (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  character_id INTEGER REFERENCES characters(id),
  position VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cargo Shipments
CREATE TABLE cargo_shipments (
  id SERIAL PRIMARY KEY,
  cargo_type VARCHAR(100) NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  weight_unit VARCHAR(10) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  driver_id INTEGER REFERENCES characters(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  status VARCHAR(20) DEFAULT 'pending',
  estimated_delivery TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. ПРИОРИТЕТЫ РАЗРАБОТКИ

#### 🔴 КРИТИЧЕСКИЙ ПРИОРИТЕТ
1. **Создание миграций для новых таблиц**
2. **Реализация MDT API эндпоинтов**
3. **Создание сервисов для MDT системы**
4. **Интеграция с существующими компонентами**

#### 🟡 ВЫСОКИЙ ПРИОРИТЕТ
1. **Law Enforcement API и сервисы**
2. **EMS/FD API и сервисы**
3. **Impound система**
4. **Companies система**

#### 🟢 СРЕДНИЙ ПРИОРИТЕТ
1. **Улучшение UI/UX**
2. **Дополнительные функции**
3. **Оптимизация производительности**

### 6. РЕКОМЕНДАЦИИ ПО РЕАЛИЗАЦИИ

#### 6.1 Поэтапная разработка
1. **Этап 1**: Создание миграций и базовых таблиц
2. **Этап 2**: Реализация MDT API
3. **Этап 3**: Интеграция с клиентской частью
4. **Этап 4**: Тестирование и отладка
5. **Этап 5**: Дополнительные функции

#### 6.2 Архитектурные решения
- Использовать существующую структуру сервисов
- Следовать паттернам, установленным в проекте
- Обеспечить обратную совместимость
- Добавить валидацию данных
- Реализовать логирование операций

#### 6.3 Безопасность
- Добавить проверки прав доступа
- Валидировать все входные данные
- Логировать критические операции
- Обеспечить защиту от SQL-инъекций

---

**Дата аудита**: $(date)
**Версия системы**: 1.0.0
**Статус**: Требует доработки 