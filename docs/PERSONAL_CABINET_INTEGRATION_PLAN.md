# 🔗 ПЛАН ИНТЕГРАЦИИ CABINET С SERVER

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ АНАЛИЗА

### 🎯 Цель интеграции
Подключить `@personal-cabinet/` к `@server/` согласно принципам новой архитектуры с DI, соблюдая все "Золотые Правила".

### 🔍 Анализ personal-cabinet
```
apps/personal-cabinet/
├── ✅ React + TypeScript + Vite
├── ✅ FSD архитектура (Feature-Sliced Design)
├── ✅ TanStack Query для API
├── ✅ Axios для HTTP запросов
├── ✅ Supabase для аутентификации
├── ✅ Tailwind CSS + Radix UI
└── ✅ Порт 3001 (не конфликтует с server:5000)
```

### 🔍 Анализ server
```
apps/server/
├── ✅ Express + TypeScript
├── ✅ DI-контейнер с сервисами
├── ✅ v1 API архитектура
├── ✅ Supabase для БД
├── ✅ WebSocket (Socket.IO)
└── ✅ Порт 5000
```

---

## 🏗️ АРХИТЕКТУРА ИНТЕГРАЦИИ

### 📡 Схема подключения
```
┌─────────────────────────────────────────────────────────────┐
│                    PERSONAL CABINET                        │
│                    (Port 3001)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   React App     │    │   TanStack      │                │
│  │   (FSD)         │    │   Query         │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              API CLIENT LAYER                          │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Axios     │  │   Auth      │  │   Services  │     │ │
│  │  │   Client    │  │   Service   │  │   (FSD)     │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                                               │
│           ▼ HTTP/HTTPS                                    │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER                                │
│                     (Port 5000)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Express       │    │   DI Container  │                │
│  │   Router        │    │   (Services)    │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              V1 API ROUTES                             │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Auth      │  │   Personal  │  │   Shared    │     │ │
│  │  │   Routes    │  │   Cabinet   │  │   Routes    │     │ │
│  │  │             │  │   Routes    │  │             │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                                               │
│           ▼                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CORE SERVICES                             │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   AuthS.    │  │   Personal  │  │   Shared    │     │ │
│  │  │   CharacterS│  │   CabinetS. │  │   Services  │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
│           │                                               │
│           ▼                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              SUPABASE DATABASE                         │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Auth      │  │   Personal  │  │   Shared    │     │ │
│  │  │   Tables    │  │   Cabinet   │  │   Tables    │     │ │
│  │  │             │  │   Tables    │  │             │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ПЛАН ИНТЕГРАЦИИ ПО ЭТАПАМ

### 🚨 ЭТАП 1: Создание CabinetService (КРИТИЧНО)
```typescript
// apps/server/src/core/services/CabinetService.ts
export class CabinetService {
  constructor(
    private authService: AuthService,
    private characterService: CharacterService,
    private applicationService: ApplicationService,
    private reportService: ReportService
  ) {}

  // Методы для cabinet
  async getUserProfile(userId: string) { /* ... */ }
  async updateUserProfile(userId: string, data: UpdateProfileData) { /* ... */ }
  async getUserApplications(userId: string) { /* ... */ }
  async getUserReports(userId: string) { /* ... */ }
  async getUserDepartments(userId: string) { /* ... */ }
  async getUserSettings(userId: string) { /* ... */ }
  async updateUserSettings(userId: string, settings: UserSettings) { /* ... */ }
}
```

### 🔥 ЭТАП 2: Создание v1/cabinet роутов (ВЫСОКИЙ)
```typescript
// apps/server/src/api/routes/v1/cabinet.ts
export function createCabinetRoutes(services: ServicesContainer): Router {
  const router = Router();
  const { cabinetService } = services;

  // GET /api/v1/cabinet/profile
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const profile = await cabinetService.getUserProfile(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/v1/cabinet/profile
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const updatedProfile = await cabinetService.updateUserProfile(
        req.user.id, 
        req.body
      );
      res.json({ success: true, data: updatedProfile });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/v1/cabinet/applications
  router.get('/applications', authenticateToken, async (req, res) => {
    try {
      const applications = await cabinetService.getUserApplications(req.user.id);
      res.json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/v1/cabinet/reports
  router.get('/reports', authenticateToken, async (req, res) => {
    try {
      const reports = await cabinetService.getUserReports(req.user.id);
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/v1/cabinet/departments
  router.get('/departments', authenticateToken, async (req, res) => {
    try {
      const departments = await cabinetService.getUserDepartments(req.user.id);
      res.json({ success: true, data: departments });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/v1/cabinet/settings
  router.get('/settings', authenticateToken, async (req, res) => {
    try {
      const settings = await cabinetService.getUserSettings(req.user.id);
      res.json({ success: true, data: settings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/v1/cabinet/settings
  router.put('/settings', authenticateToken, async (req, res) => {
    try {
      const updatedSettings = await cabinetService.updateUserSettings(
        req.user.id, 
        req.body
      );
      res.json({ success: true, data: updatedSettings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
```

### 📈 ЭТАП 3: Обновление DI-контейнера (СРЕДНИЙ)
```typescript
// apps/server/src/index.ts
import { CabinetService } from './core/services/CabinetService';

// В DI-контейнере:
const cabinetService = new CabinetService(
  authService,
  characterService,
  applicationService,
  reportService
);

const services: ServicesContainer = {
  // ... существующие сервисы
  cabinetService,
};
```

### 🔧 ЭТАП 4: Обновление типов (НИЗКИЙ)
```typescript
// apps/server/src/types/services.ts
export interface ServicesContainer {
  // ... существующие сервисы
  cabinetService: CabinetService;
}
```

// packages/db-types/src/index.ts
// Добавить типы для personal-cabinet:
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ru';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visible: boolean;
    show_email: boolean;
    show_phone: boolean;
  };
}
```

---

## 🔄 ОБНОВЛЕНИЕ PERSONAL-CABINET

### 📡 Обновление API клиента
```typescript
// apps/personal-cabinet/src/shared/api/api-client.ts
const axiosInstance: AxiosInstance = axios.create({
  // Обновляем baseURL для подключения к server
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 🎯 Создание Cabinet API сервиса
```typescript
// apps/personal-cabinet/src/shared/api/cabinet-service.ts
import { apiClient } from './api-client';
import type { UserProfile, UserSettings } from '@roleplay-identity/db-types';

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export const cabinetApi = {
  // Профиль пользователя
  getProfile: () => apiClient.get<UserProfile>('/cabinet/profile'),
  updateProfile: (data: UpdateProfileData) => 
    apiClient.put<UserProfile>('/cabinet/profile', data),

  // Заявки пользователя
  getApplications: () => 
    apiClient.get('/cabinet/applications'),

  // Отчеты пользователя
  getReports: () => 
    apiClient.get('/cabinet/reports'),

  // Департаменты пользователя
  getDepartments: () => 
    apiClient.get('/cabinet/departments'),

  // Настройки пользователя
  getSettings: () => 
    apiClient.get<UserSettings>('/cabinet/settings'),
  updateSettings: (settings: Partial<UserSettings>) => 
    apiClient.put<UserSettings>('/cabinet/settings', settings),
};
```

### 🎣 Создание React Query хуков
```typescript
// apps/personal-cabinet/src/shared/hooks/useCabinet.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi } from '../api/cabinet-service';

export const useCabinet = () => {
  const queryClient = useQueryClient();

  // Профиль
  const profileQuery = useQuery({
    queryKey: ['cabinet', 'profile'],
    queryFn: cabinetApi.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: cabinetApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinet', 'profile'] });
    },
  });

  // Заявки
  const applicationsQuery = useQuery({
    queryKey: ['cabinet', 'applications'],
    queryFn: cabinetApi.getApplications,
  });

  // Отчеты
  const reportsQuery = useQuery({
    queryKey: ['cabinet', 'reports'],
    queryFn: cabinetApi.getReports,
  });

  // Департаменты
  const departmentsQuery = useQuery({
    queryKey: ['cabinet', 'departments'],
    queryFn: cabinetApi.getDepartments,
  });

  // Настройки
  const settingsQuery = useQuery({
    queryKey: ['cabinet', 'settings'],
    queryFn: cabinetApi.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: cabinetApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinet', 'settings'] });
    },
  });

  return {
    // Профиль
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    updateProfileLoading: updateProfileMutation.isPending,

    // Заявки
    applications: applicationsQuery.data,
    applicationsLoading: applicationsQuery.isLoading,
    applicationsError: applicationsQuery.error,

    // Отчеты
    reports: reportsQuery.data,
    reportsLoading: reportsQuery.isLoading,
    reportsError: reportsQuery.error,

    // Департаменты
    departments: departmentsQuery.data,
    departmentsLoading: departmentsQuery.isLoading,
    departmentsError: departmentsQuery.error,

    // Настройки
    settings: settingsQuery.data,
    settingsLoading: settingsQuery.isLoading,
    settingsError: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutate,
    updateSettingsLoading: updateSettingsMutation.isPending,
  };
};
```

---

## 🗄️ ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ

### 📋 Новые таблицы для cabinet
```sql
-- supabase/migrations/20250101000000_cabinet_tables.sql

-- Таблица настроек пользователя
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ru')),
  notifications JSONB NOT NULL DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
  privacy JSONB NOT NULL DEFAULT '{"profile_visible": true, "show_email": false, "show_phone": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- RLS политики
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 📝 Тесты для CabinetService
```typescript
// apps/server/tests/services/CabinetService.test.ts
import { CabinetService } from '../../src/core/services/CabinetService';
import { AuthService } from '../../src/core/services/AuthService';
import { CharacterService } from '../../src/core/services/CharacterService';

describe('CabinetService', () => {
  let cabinetService: CabinetService;
  let authService: AuthService;
  let characterService: CharacterService;

  beforeEach(() => {
    authService = new AuthService();
    characterService = new CharacterService();
    cabinetService = new CabinetService(
      authService,
      characterService,
      applicationService,
      reportService
    );
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      // Тест
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      // Тест
    });
  });
});
```

### 🌐 Тесты для API роутов
```typescript
// apps/server/tests/api/cabinet.test.ts
import request from 'supertest';
import { app } from '../../src/index';

describe('Cabinet API', () => {
  describe('GET /api/v1/cabinet/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Тест
    });

    it('should return 401 when not authenticated', async () => {
      // Тест
    });
  });

  describe('PUT /api/v1/cabinet/profile', () => {
    it('should update user profile when authenticated', async () => {
      // Тест
    });
  });
});
```

---

## 🚀 ДЕПЛОЙ И КОНФИГУРАЦИЯ

### 🔧 Обновление переменных окружения
```bash
# apps/personal-cabinet/.env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# apps/server/.env
PERSONAL_CABINET_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 📦 Обновление package.json
```json
// apps/server/package.json
{
  "scripts": {
    "dev:personal-cabinet": "concurrently \"npm run dev\" \"cd ../personal-cabinet && npm run dev\"",
    "build:personal-cabinet": "cd ../personal-cabinet && npm run build",
    "test:personal-cabinet": "jest tests/api/personal-cabinet.test.ts"
  }
}
```

---

## 📊 МЕТРИКИ ИНТЕГРАЦИИ

### ✅ КРИТЕРИИ УСПЕХА
- [ ] CabinetService создан и работает
- [ ] v1/cabinet роуты созданы
- [ ] DI-контейнер обновлен
- [ ] Типы синхронизированы
- [ ] API клиент обновлен
- [ ] React Query хуки созданы
- [ ] База данных обновлена
- [ ] Тесты написаны
- [ ] Документация обновлена

### 📈 МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ
- Время ответа API: < 200ms
- Время загрузки страниц: < 2s
- Покрытие тестами: > 90%
- Обработка ошибок: 100%

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Создать CabinetService** - основа интеграции
2. **Создать v1/cabinet роуты** - API эндпоинты
3. **Обновить DI-контейнер** - внедрение зависимостей
4. **Обновить типы** - синхронизация с БД
5. **Обновить personal-cabinet** - подключение к API
6. **Написать тесты** - обеспечение качества
7. **Обновить документацию** - для разработчиков

---

*Этот план обеспечивает полную интеграцию personal-cabinet с server согласно принципам новой архитектуры.* 