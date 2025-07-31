// ===== ТИПЫ =====

// Временные типы (заменят импорт из shared-schema)
export interface Character {
  id: number;
  ownerId: number;
  type: string;
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  insuranceNumber: string;
  licenses: Record<string, any>;
  medicalInfo: Record<string, any>;
  mugshotUrl?: string;
  isUnit: boolean;
  unitInfo?: Record<string, any>;
  departmentId?: number;
  rankId?: number;
  divisionId?: number;
  unitId?: number;
  badgeNumber?: string;
  employeeId?: string;
  hireDate?: string;
  terminationDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gender?: string;
  ethnicity?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  phoneNumber?: string;
  postal?: string;
  occupation?: string;
  dead: boolean;
  dateOfDead?: string;
  missing: boolean;
  arrested: boolean;
  callsign?: string;
  callsign2?: string;
  suspended: boolean;
  whitelistStatus: string;
  radioChannelId?: string;
}

export interface Vehicle {
  id: number;
  ownerId: number;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: string;
  insurance: string;
  createdAt: string;
}

export interface Weapon {
  id: number;
  ownerId: number;
  serialNumber: string;
  model: string;
  registration: string;
  createdAt: string;
}

export interface Report {
  id: number;
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
  createdAt: string;
}

export interface Call911 {
  id: number;
  location: string;
  description: string;
  status: string;
  type: string;
  priority: number;
  callerInfo?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveUnit {
  id: number;
  characterId: number;
  status: string;
  callsign: string;
  location: Record<string, any>;
  partnerId?: number;
  vehicleId?: number;
  departmentId: number;
  isPanic: boolean;
  isActive: boolean;
  lastUpdate: string;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  fullName: string;
  logoUrl?: string;
  description?: string;
  gallery: string[];
}

// Фильтры
export interface CitizenFilters {
  type?: string;
  departmentId?: number;
  isActive?: boolean;
}

export interface VehicleFilters {
  ownerId?: number;
  registration?: string;
  insurance?: string;
}

export interface WeaponFilters {
  ownerId?: number;
  registration?: string;
}

export interface ReportFilters {
  authorId?: number;
  status?: string;
}

export interface CallFilters {
  status?: string;
  type?: string;
  priority?: number;
}

export interface UnitFilters {
  characterId?: number;
  status?: string;
  departmentId?: number;
  isActive?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

// ===== КОНФИГУРАЦИЯ =====

const API_BASE_URL = '/api';

// ===== ТИПЫ ОТВЕТОВ =====

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  code?: string;
}

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  error?: string;
  code?: string;
}

// ===== УТИЛИТЫ =====

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('[API] Making request to:', url);
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Добавляем токен аутентификации, если он есть
  // ИСПРАВЛЕНО: Используем правильный ключ auth_token вместо authToken
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('[API] Token found and added to headers');
  } else {
    console.log('[API] No token found');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log('[API] Sending request with config:', { url, method: config.method || 'GET' });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// ===== API КЛАСС =====

export class ApiService {
  // ===== ГРАЖДАНЕ =====

  async getCitizens(filters: CitizenFilters = {}): Promise<Character[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response: ApiListResponse<Character> = await makeRequest(
      `/database/citizens?${params.toString()}`
    );
    
    return response.data;
  }

  async getCitizenById(id: number): Promise<Character> {
    const response: ApiResponse<Character> = await makeRequest(
      `/database/citizens/${id}`
    );
    
    return response.data;
  }

  async createCitizen(data: any): Promise<Character> {
    const response: ApiResponse<Character> = await makeRequest(
      '/database/citizens',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateCitizen(id: number, data: any): Promise<Character> {
    const response: ApiResponse<Character> = await makeRequest(
      `/database/citizens/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async deleteCitizen(id: number): Promise<void> {
    await makeRequest(`/database/citizens/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== ТРАНСПОРТ =====

  async getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response: ApiListResponse<Vehicle> = await makeRequest(
      `/database/vehicles?${params.toString()}`
    );
    
    return response.data;
  }

  async getVehicleById(id: number): Promise<Vehicle> {
    const response: ApiResponse<Vehicle> = await makeRequest(
      `/database/vehicles/${id}`
    );
    
    return response.data;
  }

  async createVehicle(data: any): Promise<Vehicle> {
    const response: ApiResponse<Vehicle> = await makeRequest(
      '/database/vehicles',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateVehicle(id: number, data: any): Promise<Vehicle> {
    const response: ApiResponse<Vehicle> = await makeRequest(
      `/database/vehicles/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  // ===== ОРУЖИЕ =====

  async getWeapons(filters: WeaponFilters = {}): Promise<Weapon[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response: ApiListResponse<Weapon> = await makeRequest(
      `/database/weapons?${params.toString()}`
    );
    
    return response.data;
  }

  async getWeaponById(id: number): Promise<Weapon> {
    const response: ApiResponse<Weapon> = await makeRequest(
      `/database/weapons/${id}`
    );
    
    return response.data;
  }

  async createWeapon(data: any): Promise<Weapon> {
    const response: ApiResponse<Weapon> = await makeRequest(
      '/database/weapons',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateWeapon(id: number, data: any): Promise<Weapon> {
    const response: ApiResponse<Weapon> = await makeRequest(
      `/database/weapons/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  // ===== ОТЧЕТЫ =====

  async getReports(filters: ReportFilters = {}): Promise<Report[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response: ApiListResponse<Report> = await makeRequest(
      `/database/reports?${params.toString()}`
    );
    
    return response.data;
  }

  async getReportById(id: number): Promise<Report> {
    const response: ApiResponse<Report> = await makeRequest(
      `/database/reports/${id}`
    );
    
    return response.data;
  }

  async createReport(data: any): Promise<Report> {
    const response: ApiResponse<Report> = await makeRequest(
      '/database/reports',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateReport(id: number, data: any): Promise<Report> {
    const response: ApiResponse<Report> = await makeRequest(
      `/database/reports/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  // ===== ВЫЗОВЫ 911 =====

  async getCalls(filters: CallFilters = {}): Promise<Call911[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response: ApiListResponse<Call911> = await makeRequest(
      `/database/calls?${params.toString()}`
    );
    
    return response.data;
  }

  async getCallById(id: number): Promise<Call911> {
    const response: ApiResponse<Call911> = await makeRequest(
      `/database/calls/${id}`
    );
    
    return response.data;
  }

  async createCall(data: any): Promise<Call911> {
    const response: ApiResponse<Call911> = await makeRequest(
      '/database/calls',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateCall(id: number, data: any): Promise<Call911> {
    const response: ApiResponse<Call911> = await makeRequest(
      `/database/calls/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  // ===== ЮНИТЫ =====

  async getUnits(filters: UnitFilters = {}): Promise<ActiveUnit[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response: ApiListResponse<ActiveUnit> = await makeRequest(
      `/database/units?${params.toString()}`
    );
    
    return response.data;
  }

  async getUnitById(id: number): Promise<ActiveUnit> {
    const response: ApiResponse<ActiveUnit> = await makeRequest(
      `/database/units/${id}`
    );
    
    return response.data;
  }

  async createUnit(data: any): Promise<ActiveUnit> {
    const response: ApiResponse<ActiveUnit> = await makeRequest(
      '/database/units',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  async updateUnit(id: number, data: any): Promise<ActiveUnit> {
    const response: ApiResponse<ActiveUnit> = await makeRequest(
      `/database/units/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  }

  // ===== ДЕПАРТАМЕНТЫ =====

  async getDepartments(): Promise<Department[]> {
    const response: ApiListResponse<Department> = await makeRequest(
      '/database/departments'
    );
    
    return response.data;
  }

  async getDepartmentById(id: number): Promise<Department> {
    const response: ApiResponse<Department> = await makeRequest(
      `/database/departments/${id}`
    );
    
    return response.data;
  }

  // ===== ПОИСК =====

  async searchCitizens(query: string, limit: number = 10): Promise<Character[]> {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
    });

    const response: ApiListResponse<Character> = await makeRequest(
      `/database/search/citizens?${params.toString()}`
    );
    
    return response.data;
  }

  async searchVehicles(query: string, limit: number = 10): Promise<Vehicle[]> {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
    });

    const response: ApiListResponse<Vehicle> = await makeRequest(
      `/database/search/vehicles?${params.toString()}`
    );
    
    return response.data;
  }

  async searchWeapons(query: string, limit: number = 10): Promise<Weapon[]> {
    const params = new URLSearchParams({
      query,
      limit: String(limit),
    });

    const response: ApiListResponse<Weapon> = await makeRequest(
      `/database/search/weapons?${params.toString()}`
    );
    
    return response.data;
  }

  // ===== СТАТИСТИКА =====

  async getSystemStats(): Promise<any> {
    const response: ApiResponse<any> = await makeRequest('/database/stats');
    return response.data;
  }

  // ===== АУТЕНТИФИКАЦИЯ =====

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    const response: ApiResponse<any> = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return response;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<ApiResponse<any>> {
    const response: ApiResponse<any> = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    const response: ApiResponse<any> = await makeRequest('/auth/me');
    return response;
  }

  async authenticate(token: string): Promise<any> {
    const response: ApiResponse<any> = await makeRequest('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  }

  async generateCadToken(): Promise<string> {
    const response: ApiResponse<{ token: string }> = await makeRequest(
      '/auth/cad-token',
      {
        method: 'POST',
      }
    );
    
    return response.data.token;
  }

  // ===== MDT СПЕЦИФИЧНЫЕ API =====

  async getActiveUnits(): Promise<any[]> {
    const response: ApiListResponse<any> = await makeRequest('/mdt/units');
    return response.data;
  }

  async createMDTUnit(data: any): Promise<any> {
    const response: ApiResponse<any> = await makeRequest('/mdt/units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data;
  }

  async updateMDTUnitStatus(unitId: number, status: string): Promise<any> {
    const response: ApiResponse<any> = await makeRequest(
      `/mdt/units/${unitId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    
    return response.data;
  }

  async activatePanic(unitId: number): Promise<void> {
    await makeRequest(`/mdt/units/${unitId}/panic`, {
      method: 'POST',
    });
  }

  async deactivatePanic(unitId: number): Promise<void> {
    await makeRequest(`/mdt/units/${unitId}/panic`, {
      method: 'DELETE',
    });
  }

  // ===== УТИЛИТЫ =====

  setAuthToken(token: string): void {
    // ИСПРАВЛЕНО: Используем правильный ключ auth_token
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    // ИСПРАВЛЕНО: Используем правильный ключ auth_token
    return localStorage.getItem('auth_token');
  }

  removeAuthToken(): void {
    // ИСПРАВЛЕНО: Используем правильный ключ auth_token
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Экспорт экземпляра сервиса
export const apiService = new ApiService();

// Экспорт типов для использования в других модулях
export type { ApiError }; 