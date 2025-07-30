import type { 
  Character, 
  Vehicle, 
  Weapon, 
  Report, 
  Call911, 
  ActiveUnit, 
  Department,
  CitizenFilters,
  VehicleFilters,
  WeaponFilters,
  ReportFilters,
  CallFilters,
  UnitFilters
} from '@roleplay-identity/shared-schema';

// ===== КОНФИГУРАЦИЯ =====

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5002/api';

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
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Добавляем токен аутентификации, если он есть
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
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
    localStorage.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Экспорт экземпляра сервиса
export const apiService = new ApiService();

// Экспорт типов для использования в других модулях
export type { ApiError }; 