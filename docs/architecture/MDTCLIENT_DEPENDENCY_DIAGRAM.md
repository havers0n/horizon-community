# Диаграмма зависимостей @mdtclient/

## Слои FSD и их зависимости

```
┌─────────────────────────────────────────────────────────────┐
│                        APP LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AppRouter.tsx                                      │   │
│  │ MainLayout.tsx                                     │   │
│  │ Providers (Theme, Auth, etc.)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     WIDGETS LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ mdt-portal/                                        │   │
│  │ ems-portal/                                        │   │
│  │ citizen-portal/                                    │   │
│  │ dispatch-portal/                                   │   │
│  │ department-selector-grid/                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FEATURES LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ auth/                                              │   │
│  │ citizen-registration/                              │   │
│  │ vehicle-registration/                              │   │
│  │ weapon-registration/                               │   │
│  │ emergency-calls/                                   │   │
│  │ company-management/                                │   │
│  │ ems-system/                                        │   │
│  │ fd-system/                                         │   │
│  │ call-management/                                   │   │
│  │ incident-management/                               │   │
│  │ bolo-management/                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ENTITIES LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ citizen/                                           │   │
│  │ vehicle/                                           │   │
│  │ weapon/                                            │   │
│  │ ems/                                               │   │
│  │ patient/                                           │   │
│  │ company/                                           │   │
│  │ incident/                                          │   │
│  │ fire-incident/                                     │   │
│  │ dispatch/                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SHARED LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ui/ (Atomic Design)                                │   │
│  │ ├── atoms/                                         │   │
│  │ ├── molecules/                                     │   │
│  │ ├── organisms/                                     │   │
│  │ └── templates/                                     │   │
│  │ api/                                               │   │
│  │ config/                                            │   │
│  │ contexts/                                          │   │
│  │ hooks/                                             │   │
│  │ lib/                                               │   │
│  │ types/                                             │   │
│  │ utils/                                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Детальная схема зависимостей

### App Layer → Widgets Layer
```
AppRouter.tsx
├── DepartmentSelectorGrid (widget)
└── MainLayout (app/layouts)
    └── Widgets (mdt-portal, ems-portal, etc.)
```

### Widgets Layer → Features Layer
```
mdt-portal/
├── LawEnforcementPortal (feature)
├── EMSPortal (feature)
├── FDPortal (feature)
└── CitizenPortal (feature)

ems-portal/
├── EmsSystem (feature)
├── EmsCallManagement (feature)
└── PatientManagement (feature)

dispatch-portal/
├── CallManagement (feature)
├── DispatchFeed (feature)
└── UnitManagement (feature)
```

### Features Layer → Entities Layer
```
citizen-registration/
├── Citizen (entity)
└── Vehicle (entity)

vehicle-registration/
└── Vehicle (entity)

weapon-registration/
└── Weapon (entity)

ems-system/
├── Ems (entity)
├── Patient (entity)
└── Incident (entity)

call-management/
├── Dispatch (entity)
└── Incident (entity)
```

### Все слои → Shared Layer
```
App Layer
├── shared/contexts/ThemeContext
├── shared/contexts/AuthContext
└── shared/lib/auth-init

Widgets Layer
├── shared/ui/atoms/Button
├── shared/ui/molecules/SearchInput
└── shared/hooks/useAuth

Features Layer
├── shared/api/httpClient
├── shared/types/common
└── shared/utils/validators

Entities Layer
├── shared/api/baseApi
├── shared/types/base
└── shared/utils/formatters
```

## Atomic Design в Shared UI

```
SHARED UI LAYER
┌─────────────────────────────────────────────────────────────┐
│                    TEMPLATES                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ MainLayout.tsx                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ORGANISMS                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DepartmentSelector/                                 │   │
│  │ CallList/                                          │   │
│  │ UnitList/                                          │   │
│  │ DataTable/                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MOLECULES                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SearchInput/                                       │   │
│  │ SearchBar/                                         │   │
│  │ CallCard/                                          │   │
│  │ UnitCard/                                          │   │
│  │ StatusBadge/                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      ATOMS                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Button/                                            │   │
│  │ Input/                                             │   │
│  │ Select/                                            │   │
│  │ Checkbox/                                          │   │
│  │ Card/                                              │   │
│  │ Dialog/                                            │   │
│  │ Modal/                                             │   │
│  │ Label/                                             │   │
│  │ Badge/                                             │   │
│  │ Table/                                             │   │
│  │ Tabs/                                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Правила зависимостей FSD

### ✅ Разрешенные зависимости
- **App** → **Widgets** → **Features** → **Entities** → **Shared**
- **App** → **Shared**
- **Widgets** → **Shared**
- **Features** → **Shared**
- **Entities** → **Shared**

### ❌ Запрещенные зависимости
- **Shared** → любой другой слой
- **Entities** → **Features**, **Widgets**, **App**
- **Features** → **Widgets**, **App**
- **Widgets** → **App**

### 🔄 Горизонтальные зависимости
- **Features** ↔ **Features** (через shared)
- **Entities** ↔ **Entities** (через shared)
- **Widgets** ↔ **Widgets** (через shared)

## Примеры правильных импортов

### ✅ Правильно
```typescript
// App Layer
import { DepartmentSelectorGrid } from '@/widgets/department-selector-grid';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';

// Widgets Layer
import { LawEnforcementPortal } from '@/features/law-enforcement';
import { Button } from '@/shared/ui/atoms/Button';

// Features Layer
import { Citizen } from '@/entities/citizen';
import { httpClient } from '@/shared/api/httpClient';

// Entities Layer
import { baseApi } from '@/shared/api/baseApi';
import { commonTypes } from '@/shared/types/common';
```

### ❌ Неправильно
```typescript
// Запрещено: Shared зависит от Features
import { citizenApi } from '@/features/citizen-registration';

// Запрещено: Entities зависит от Features
import { CitizenRegistrationForm } from '@/features/citizen-registration';

// Запрещено: Features зависит от Widgets
import { MDTPortal } from '@/widgets/mdt-portal';
```

## Заключение

Архитектура `@mdtclient/` строго следует принципам FSD:
- Четкое разделение слоев
- Правильные зависимости
- Изоляция бизнес-логики
- Переиспользование компонентов

Это обеспечивает масштабируемость, поддерживаемость и тестируемость кода. 