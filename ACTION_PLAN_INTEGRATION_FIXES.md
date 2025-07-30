# 🚀 ПЛАН ДЕЙСТВИЙ ПО УСТРАНЕНИЮ ИНТЕГРАЦИОННЫХ ПРОБЛЕМ

## 📋 ОБЗОР ПЛАНА

Данный план содержит пошаговые инструкции по устранению всех выявленных интеграционных проблем в системе CAD/MDT. План разделен на этапы с указанием приоритетов, времени реализации и конкретных действий.

---

## 🔴 ЭТАП 1: КРИТИЧЕСКИЕ ПРОБЛЕМЫ (2-3 недели)

### Задача 1.1: Интеграция с базой данных

#### Цель:
Подключить все модули к реальной базе данных PostgreSQL, заменив mock данные на реальные API вызовы.

#### Время: 1-2 недели
#### Приоритет: Критический

#### Действия:

##### 1.1.1 Создание единого API слоя (3-4 дня)
```typescript
// apps/server/services/DatabaseService.ts
export class DatabaseService {
  constructor(private db: Database) {}
  
  // Граждане
  async getCitizens(filters: CitizenFilters): Promise<Citizen[]> {
    return await this.db.query.citizens.findMany({
      where: buildWhereClause(filters),
      with: {
        vehicles: true,
        weapons: true,
        medicalRecords: true,
        criminalHistory: true
      }
    });
  }
  
  async createCitizen(data: CreateCitizenData): Promise<Citizen> {
    return await this.db.insert(citizens).values(data).returning()[0];
  }
  
  async updateCitizen(id: number, data: UpdateCitizenData): Promise<Citizen> {
    return await this.db.update(citizens)
      .set(data)
      .where(eq(citizens.id, id))
      .returning()[0];
  }
  
  // Транспорт
  async getVehicles(filters: VehicleFilters): Promise<Vehicle[]> {
    return await this.db.query.vehicles.findMany({
      where: buildVehicleWhereClause(filters),
      with: {
        owner: true,
        violations: true
      }
    });
  }
  
  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    return await this.db.insert(vehicles).values(data).returning()[0];
  }
  
  // Оружие
  async getWeapons(filters: WeaponFilters): Promise<Weapon[]> {
    return await this.db.query.weapons.findMany({
      where: buildWeaponWhereClause(filters),
      with: {
        owner: true
      }
    });
  }
  
  async createWeapon(data: CreateWeaponData): Promise<Weapon> {
    return await this.db.insert(weapons).values(data).returning()[0];
  }
  
  // Отчеты
  async getReports(filters: ReportFilters): Promise<Report[]> {
    return await this.db.query.reports.findMany({
      where: buildReportWhereClause(filters),
      with: {
        author: true,
        suspects: true,
        witnesses: true,
        evidence: true
      }
    });
  }
  
  async createReport(data: CreateReportData): Promise<Report> {
    return await this.db.insert(reports).values(data).returning()[0];
  }
}
```

##### 1.1.2 Обновление API маршрутов (2-3 дня)
```typescript
// apps/server/routes/mdt.ts
import { DatabaseService } from '../services/DatabaseService';

const databaseService = new DatabaseService(db);

// Граждане
router.get('/citizens', async (req, res) => {
  try {
    const filters = parseCitizenFilters(req.query);
    const citizens = await databaseService.getCitizens(filters);
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/citizens', async (req, res) => {
  try {
    const citizen = await databaseService.createCitizen(req.body);
    res.json(citizen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Транспорт
router.get('/vehicles', async (req, res) => {
  try {
    const filters = parseVehicleFilters(req.query);
    const vehicles = await databaseService.getVehicles(filters);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Оружие
router.get('/weapons', async (req, res) => {
  try {
    const filters = parseWeaponFilters(req.query);
    const weapons = await databaseService.getWeapons(filters);
    res.json(weapons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отчеты
router.get('/reports', async (req, res) => {
  try {
    const filters = parseReportFilters(req.query);
    const reports = await databaseService.getReports(filters);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

##### 1.1.3 Обновление клиентских сервисов (2-3 дня)
```typescript
// apps/mdtclient/src/services/api.ts
export class ApiService {
  private baseUrl = process.env.REACT_APP_API_URL;
  
  // Граждане
  async getCitizens(filters: CitizenFilters): Promise<Citizen[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/mdt/citizens?${params}`);
    return response.json();
  }
  
  async createCitizen(data: CreateCitizenData): Promise<Citizen> {
    const response = await fetch(`${this.baseUrl}/mdt/citizens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  // Транспорт
  async getVehicles(filters: VehicleFilters): Promise<Vehicle[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/mdt/vehicles?${params}`);
    return response.json();
  }
  
  // Оружие
  async getWeapons(filters: WeaponFilters): Promise<Weapon[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/mdt/weapons?${params}`);
    return response.json();
  }
  
  // Отчеты
  async getReports(filters: ReportFilters): Promise<Report[]> {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/mdt/reports?${params}`);
    return response.json();
  }
}
```

##### 1.1.4 Замена mock данных (1-2 дня)
```typescript
// apps/mdtclient/src/features/citizen-management/model/citizenStore.ts
import { ApiService } from '@/services/api';

const apiService = new ApiService();

export const useCitizenStore = create<CitizenStore>((set, get) => ({
  citizens: [],
  loading: false,
  error: null,
  
  fetchCitizens: async (filters: CitizenFilters) => {
    set({ loading: true, error: null });
    try {
      const citizens = await apiService.getCitizens(filters);
      set({ citizens, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  createCitizen: async (data: CreateCitizenData) => {
    try {
      const citizen = await apiService.createCitizen(data);
      set(state => ({
        citizens: [...state.citizens, citizen]
      }));
      return citizen;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));
```

### Задача 1.2: Единая система аутентификации

#### Цель:
Создать единую систему аутентификации, синхронизирующую пользователей между всеми компонентами системы.

#### Время: 1 неделя
#### Приоритет: Критический

#### Действия:

##### 1.2.1 Создание AuthService (2-3 дня)
```typescript
// apps/server/services/AuthService.ts
export class AuthService {
  constructor(
    private supabase: SupabaseClient,
    private db: Database
  ) {}
  
  async authenticate(token: string): Promise<User> {
    try {
      // Проверка токена в Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Invalid token');
      }
      
      // Синхронизация с локальной БД
      return await this.syncUser(user);
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
  
  async syncUser(supabaseUser: any): Promise<User> {
    // Поиск пользователя в локальной БД
    let user = await this.db.query.users.findFirst({
      where: eq(users.supabaseId, supabaseUser.id)
    });
    
    if (!user) {
      // Создание нового пользователя
      user = await this.db.insert(users).values({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        role: 'candidate',
        createdAt: new Date()
      }).returning()[0];
    }
    
    return user;
  }
  
  async validateCadToken(token: string): Promise<boolean> {
    // Проверка CAD токена для игровой интеграции
    const user = await this.db.query.users.findFirst({
      where: eq(users.cadToken, token)
    });
    
    return !!user;
  }
}
```

##### 1.2.2 Обновление middleware (1-2 дня)
```typescript
// apps/server/middleware/auth.middleware.ts
import { AuthService } from '../services/AuthService';

const authService = new AuthService(supabase, db);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await authService.authenticate(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const cadAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['x-cad-token'] as string;
    
    if (!token) {
      return res.status(401).json({ error: 'No CAD token provided' });
    }
    
    const isValid = await authService.validateCadToken(token);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid CAD token' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
```

##### 1.2.3 Обновление клиентской аутентификации (1-2 дня)
```typescript
// apps/mdtclient/src/services/auth.ts
export class AuthService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.REACT_APP_SUPABASE_ANON_KEY!
    );
  }
  
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Синхронизация с сервером
    const response = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data.session?.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
  
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
```

### Задача 1.3: Улучшение WebSocket

#### Цель:
Перейти с нативной библиотеки `ws` на Socket.IO для улучшения стабильности и функциональности real-time обновлений.

#### Время: 1 неделя
#### Приоритет: Высокий

#### Действия:

##### 1.3.1 Установка Socket.IO (1 день)
```bash
# На сервере
npm install socket.io

# На клиенте
npm install socket.io-client
```

##### 1.3.2 Обновление серверной части WebSocket (2-3 дня)
```typescript
// apps/server/websocket.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// Аутентификация через middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await authService.authenticate(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Обработка подключений
io.on('connection', (socket) => {
  console.log(`User ${socket.user.id} connected`);
  
  // Присоединение к комнатам по департаментам
  socket.on('join-department', (departmentId: string) => {
    socket.join(`department-${departmentId}`);
  });
  
  // Обработка отключений
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.id} disconnected`);
  });
});

// Функции для отправки уведомлений
export const notifyDepartment = (departmentId: string, event: string, data: any) => {
  io.to(`department-${departmentId}`).emit(event, data);
};

export const notifyAll = (event: string, data: any) => {
  io.emit(event, data);
};

export const notifyUser = (userId: string, event: string, data: any) => {
  io.to(`user-${userId}`).emit(event, data);
};
```

##### 1.3.3 Обновление клиентской части WebSocket (2-3 дня)
```typescript
// apps/mdtclient/src/services/websocket.ts
import { io, Socket } from 'socket.io-client';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(private token: string) {}
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(process.env.REACT_APP_WS_URL!, {
        auth: { token: this.token },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
        this.reconnectAttempts = 0;
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          // Сервер отключил соединение
          this.socket?.connect();
        }
      });
      
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
      });
      
      this.socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect to WebSocket');
      });
    });
  }
  
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
  
  joinDepartment(departmentId: string): void {
    this.socket?.emit('join-department', departmentId);
  }
  
  onDispatchCall(callback: (call: DispatchCall) => void): void {
    this.socket?.on('dispatch-call', callback);
  }
  
  onEmergencySignal(callback: (signal: EmergencySignal) => void): void {
    this.socket?.on('emergency-signal', callback);
  }
  
  onUnitStatusUpdate(callback: (update: UnitStatusUpdate) => void): void {
    this.socket?.on('unit-status-update', callback);
  }
}
```

---

## 🟡 ЭТАП 2: СЕРЬЕЗНЫЕ ПРОБЛЕМЫ (2-3 недели)

### Задача 2.1: Оптимизация FiveM интеграции

#### Цель:
Улучшить производительность FiveM интеграции, сделав HTTP запросы асинхронными и неблокирующими.

#### Время: 1-2 недели
#### Приоритет: Высокий

#### Действия:

##### 2.1.1 Создание асинхронного HTTP клиента (3-4 дня)
```lua
-- apps/resources_fivem/mdt-system/client/http.lua
local HttpClient = {}

function HttpClient.MakeAsyncRequest(url, data, callback, errorCallback)
  local requestId = math.random(1000000, 9999999)
  
  -- Сохраняем callback для обработки ответа
  HttpClient.pendingRequests[requestId] = {
    callback = callback,
    errorCallback = errorCallback,
    timestamp = GetGameTimer()
  }
  
  -- Асинхронный HTTP запрос
  PerformHttpRequest(url, function(statusCode, response, headers)
    Citizen.CreateThread(function()
      local request = HttpClient.pendingRequests[requestId]
      if request then
        if statusCode == 200 then
          local success, result = pcall(json.decode, response)
          if success then
            request.callback(result)
          else
            request.errorCallback("Failed to parse response")
          end
        else
          request.errorCallback("HTTP request failed: " .. statusCode)
        end
        
        -- Очистка
        HttpClient.pendingRequests[requestId] = nil
      end
    end)
  end, 'POST', json.encode(data), { ['Content-Type'] = 'application/json' })
  
  return requestId
end

-- Очистка старых запросов
Citizen.CreateThread(function()
  while true do
    Citizen.Wait(30000) -- Каждые 30 секунд
    
    local currentTime = GetGameTimer()
    for requestId, request in pairs(HttpClient.pendingRequests) do
      if currentTime - request.timestamp > 30000 then -- 30 секунд таймаут
        HttpClient.pendingRequests[requestId] = nil
      end
    end
  end
end)

HttpClient.pendingRequests = {}
```

##### 2.1.2 Обновление команд чата (2-3 дня)
```lua
-- apps/resources_fivem/mdt-system/client/commands.lua
RegisterCommand('mdt', function(source, args, rawCommand)
  local playerId = GetPlayerServerId(PlayerId())
  local token = GetPlayerToken(playerId, 0)
  
  HttpClient.MakeAsyncRequest(
    Config.API_URL .. '/mdt/auth',
    { token = token },
    function(response)
      if response.success then
        SetNuiFocus(true, true)
        SendNUIMessage({
          type = 'open-mdt',
          data = response.data
        })
      else
        TriggerEvent('chat:addMessage', {
          color = {255, 0, 0},
          multiline = true,
          args = {"MDT", "Authentication failed"}
        })
      end
    end,
    function(error)
      TriggerEvent('chat:addMessage', {
        color = {255, 0, 0},
        multiline = true,
        args = {"MDT", "Connection error: " .. error}
      })
    end
  )
end, false)

RegisterCommand('panic', function(source, args, rawCommand)
  local playerId = GetPlayerServerId(PlayerId())
  local coords = GetEntityCoords(PlayerPedId())
  
  HttpClient.MakeAsyncRequest(
    Config.API_URL .. '/mdt/panic',
    {
      playerId = playerId,
      coordinates = { x = coords.x, y = coords.y, z = coords.z }
    },
    function(response)
      if response.success then
        TriggerEvent('chat:addMessage', {
          color = {0, 255, 0},
          multiline = true,
          args = {"MDT", "Panic button activated"}
        })
      end
    end,
    function(error)
      TriggerEvent('chat:addMessage', {
        color = {255, 0, 0},
        multiline = true,
        args = {"MDT", "Failed to activate panic button"}
      })
    end
  )
end, false)
```

##### 2.1.3 Оптимизация NUI взаимодействия (1-2 дня)
```lua
-- apps/resources_fivem/mdt-system/client/nui.lua
local isNuiOpen = false

RegisterNUICallback('close', function(data, cb)
  SetNuiFocus(false, false)
  isNuiOpen = false
  cb('ok')
end)

RegisterNUICallback('search-citizen', function(data, cb)
  HttpClient.MakeAsyncRequest(
    Config.API_URL .. '/mdt/citizens/search',
    { query = data.query },
    function(response)
      SendNUIMessage({
        type = 'search-results',
        data = response
      })
      cb(response)
    end,
    function(error)
      cb({ error = error })
    end
  )
end)

-- Оптимизация открытия/закрытия
RegisterCommand('f6', function()
  if not isNuiOpen then
    local playerId = GetPlayerServerId(PlayerId())
    local token = GetPlayerToken(playerId, 0)
    
    HttpClient.MakeAsyncRequest(
      Config.API_URL .. '/mdt/auth',
      { token = token },
      function(response)
        if response.success then
          SetNuiFocus(true, true)
          isNuiOpen = true
          SendNUIMessage({
            type = 'open-mdt',
            data = response.data
          })
        end
      end,
      function(error)
        TriggerEvent('chat:addMessage', {
          color = {255, 0, 0},
          multiline = true,
          args = {"MDT", "Failed to open MDT"}
        })
      end
    )
  end
end, false)
```

### Задача 2.2: Единая система уведомлений

#### Цель:
Создать централизованную систему уведомлений, интегрированную со всеми компонентами системы.

#### Время: 1 неделя
#### Приоритет: Средний

#### Действия:

##### 2.2.1 Создание NotificationService (2-3 дня)
```typescript
// apps/server/services/NotificationService.ts
export class NotificationService {
  private io: Server;
  
  constructor(io: Server) {
    this.io = io;
  }
  
  // Уведомления для департаментов
  notifyDepartment(departmentId: string, type: NotificationType, message: string, data?: any) {
    this.io.to(`department-${departmentId}`).emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Уведомления для конкретных пользователей
  notifyUser(userId: string, type: NotificationType, message: string, data?: any) {
    this.io.to(`user-${userId}`).emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Глобальные уведомления
  notifyAll(type: NotificationType, message: string, data?: any) {
    this.io.emit('notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Экстренные уведомления
  notifyEmergency(message: string, data?: any) {
    this.io.emit('emergency-notification', {
      type: 'emergency',
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  // Уведомления о вызовах 911
  notifyDispatchCall(call: DispatchCall) {
    this.io.to(`department-${call.departmentId}`).emit('dispatch-call', call);
  }
  
  // Уведомления о статусе юнитов
  notifyUnitStatus(unitId: string, status: UnitStatus) {
    this.io.emit('unit-status-update', { unitId, status });
  }
}
```

##### 2.2.2 Интеграция с клиентской частью (2-3 дня)
```typescript
// apps/mdtclient/src/services/notifications.ts
export class NotificationService {
  private subscribers: NotificationSubscriber[] = [];
  private websocket: WebSocketService;
  
  constructor(websocket: WebSocketService) {
    this.websocket = websocket;
    this.setupWebSocketListeners();
  }
  
  private setupWebSocketListeners() {
    this.websocket.onNotification((notification) => {
      this.handleNotification(notification);
    });
    
    this.websocket.onEmergencySignal((signal) => {
      this.handleEmergencySignal(signal);
    });
    
    this.websocket.onDispatchCall((call) => {
      this.handleDispatchCall(call);
    });
  }
  
  private handleNotification(notification: Notification) {
    // Отправка уведомления всем подписчикам
    this.subscribers.forEach(subscriber => {
      subscriber.onNotification(notification);
    });
    
    // Интеграция с браузерными уведомлениями
    if (Notification.permission === 'granted') {
      new Notification(notification.message, {
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
    
    // Интеграция с игровыми уведомлениями (если в FiveM)
    if (window.invokeNative) {
      window.invokeNative('0x4A0C7C9BB10ABB36', notification.message);
    }
  }
  
  private handleEmergencySignal(signal: EmergencySignal) {
    // Специальная обработка экстренных сигналов
    this.subscribers.forEach(subscriber => {
      subscriber.onEmergencySignal(signal);
    });
    
    // Звуковое уведомление
    this.playEmergencySound();
  }
  
  private handleDispatchCall(call: DispatchCall) {
    // Обработка вызовов 911
    this.subscribers.forEach(subscriber => {
      subscriber.onDispatchCall(call);
    });
  }
  
  private playEmergencySound() {
    const audio = new Audio('/sounds/emergency.mp3');
    audio.play().catch(console.error);
  }
  
  subscribe(subscriber: NotificationSubscriber) {
    this.subscribers.push(subscriber);
  }
  
  unsubscribe(subscriber: NotificationSubscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }
}
```

##### 2.2.3 Интеграция с компонентами (1-2 дня)
```typescript
// apps/mdtclient/src/components/NotificationCenter.tsx
import { useEffect } from 'react';
import { useNotificationService } from '@/hooks/useNotificationService';

export const NotificationCenter: React.FC = () => {
  const { notifications, subscribe, unsubscribe } = useNotificationService();
  
  useEffect(() => {
    const subscriber = {
      onNotification: (notification: Notification) => {
        // Добавление уведомления в список
        console.log('New notification:', notification);
      },
      onEmergencySignal: (signal: EmergencySignal) => {
        // Обработка экстренного сигнала
        console.log('Emergency signal:', signal);
      },
      onDispatchCall: (call: DispatchCall) => {
        // Обработка вызова 911
        console.log('Dispatch call:', call);
      }
    };
    
    subscribe(subscriber);
    
    return () => unsubscribe(subscriber);
  }, [subscribe, unsubscribe]);
  
  return (
    <div className="notification-center">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
```

---

## 🟢 ЭТАП 3: УМЕРЕННЫЕ ПРОБЛЕМЫ (1-2 недели)

### Задача 3.1: Система кэширования

#### Цель:
Внедрить кэширование данных для улучшения производительности и снижения нагрузки на сервер.

#### Время: 1 неделя
#### Приоритет: Средний

#### Действия:

##### 3.1.1 Настройка React Query (2-3 дня)
```typescript
// apps/mdtclient/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
```

##### 3.1.2 Создание хуков для кэширования (2-3 дня)
```typescript
// apps/mdtclient/src/hooks/useCitizens.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export const useCitizens = (filters: CitizenFilters) => {
  return useQuery({
    queryKey: ['citizens', filters],
    queryFn: () => apiService.getCitizens(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useCreateCitizen = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCitizenData) => apiService.createCitizen(data),
    onSuccess: (newCitizen) => {
      // Обновление кэша
      queryClient.setQueryData(['citizens'], (old: Citizen[] = []) => [
        ...old,
        newCitizen
      ]);
      
      // Инвалидация связанных запросов
      queryClient.invalidateQueries({ queryKey: ['citizens'] });
    },
  });
};

export const useVehicles = (filters: VehicleFilters) => {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => apiService.getVehicles(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWeapons = (filters: WeaponFilters) => {
  return useQuery({
    queryKey: ['weapons', filters],
    queryFn: () => apiService.getWeapons(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReports = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiService.getReports(filters),
    staleTime: 2 * 60 * 1000, // 2 минуты для отчетов
  });
};
```

##### 3.1.3 Интеграция с компонентами (1-2 дня)
```typescript
// apps/mdtclient/src/features/citizen-management/ui/CitizenList.tsx
import { useCitizens, useCreateCitizen } from '@/hooks/useCitizens';

export const CitizenList: React.FC = () => {
  const { data: citizens, isLoading, error } = useCitizens({});
  const createCitizenMutation = useCreateCitizen();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {citizens?.map(citizen => (
        <CitizenCard key={citizen.id} citizen={citizen} />
      ))}
    </div>
  );
};
```

### Задача 3.2: Система логирования

#### Цель:
Создать централизованную систему логирования для мониторинга и отладки.

#### Время: 1 неделя
#### Приоритет: Низкий

#### Действия:

##### 3.2.1 Создание LoggerService (2-3 дня)
```typescript
// apps/server/services/LoggerService.ts
import winston from 'winston';

export class LoggerService {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'mdt-system' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ],
    });
  }
  
  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
  
  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.stack, ...meta });
  }
  
  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }
  
  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
  
  // Специальные методы для разных типов событий
  logApiCall(method: string, url: string, statusCode: number, duration: number) {
    this.info('API Call', { method, url, statusCode, duration });
  }
  
  logUserAction(userId: string, action: string, details?: any) {
    this.info('User Action', { userId, action, details });
  }
  
  logError(error: Error, context?: any) {
    this.error('Application Error', error, context);
  }
  
  logSecurityEvent(event: string, details?: any) {
    this.warn('Security Event', { event, details });
  }
}
```

##### 3.2.2 Интеграция с middleware (1-2 дня)
```typescript
// apps/server/middleware/logging.middleware.ts
import { LoggerService } from '../services/LoggerService';

const logger = new LoggerService();

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Логирование запроса
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Перехват ответа
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.logApiCall(
      req.method,
      req.url,
      res.statusCode,
      duration
    );
    
    return originalSend.call(this, data);
  };
  
  next();
};

export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.logError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id
  });
  
  next(error);
};
```

##### 3.2.3 Интеграция с клиентской частью (1-2 дня)
```typescript
// apps/mdtclient/src/services/logger.ts
export class ClientLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';
  
  constructor() {
    // Определение уровня логирования из env
    this.logLevel = (process.env.REACT_APP_LOG_LEVEL as any) || 'info';
  }
  
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }
  
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }
  
  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }
  
  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }
  
  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }
  
  error(message: string, error?: Error, data?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, { 
        error: error?.stack, 
        ...data 
      }));
    }
  }
  
  // Отправка логов на сервер
  async sendToServer(level: string, message: string, data?: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }
}
```

---

## 📊 ПЛАН ТЕСТИРОВАНИЯ

### 1. Модульное тестирование
- Тестирование всех сервисов
- Тестирование API endpoints
- Тестирование клиентских компонентов

### 2. Интеграционное тестирование
- Тестирование взаимодействия между компонентами
- Тестирование WebSocket соединений
- Тестирование FiveM интеграции

### 3. Нагрузочное тестирование
- Тестирование производительности API
- Тестирование WebSocket под нагрузкой
- Тестирование базы данных

### 4. Пользовательское тестирование
- Тестирование реальных сценариев использования
- Тестирование в игровой среде
- Тестирование различных устройств

---

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

### После завершения всех этапов:
- ✅ Полная интеграция с базой данных
- ✅ Стабильные real-time обновления
- ✅ Плавная работа в FiveM
- ✅ Единая система аутентификации
- ✅ Централизованные уведомления
- ✅ Эффективное кэширование
- ✅ Полное логирование и мониторинг

### Улучшения производительности:
- ⚡ Снижение времени загрузки на 60%
- ⚡ Уменьшение нагрузки на сервер на 40%
- ⚡ Стабильность WebSocket соединений 99.9%
- ⚡ Время отклика API < 100ms

---

**Дата создания плана**: Декабрь 2024  
**Статус**: Готов к реализации  
**Общее время**: 5-8 недель 