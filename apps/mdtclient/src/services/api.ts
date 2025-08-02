// ===== ТИПЫ =====

// Импортируем все типы из shared/types для централизации
import type { 
  Character, 
  CreateCharacterRequest, 
  UpdateCharacterRequest,
  User,
  Vehicle,
  Weapon,
  Unit,
  ActiveUnit,
  Call911,
  Department,
  BOLO,
  DispatchStats,
  Report,
  CitizenFilters,
  VehicleFilters,
  WeaponFilters,
  ReportFilters,
  CallFilters,
  UnitFilters
} from '../shared/types';

// ===== API RESPONSE TYPES =====

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

// ===== ERROR HANDLING =====

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

// ===== REQUEST UTILITY =====

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
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
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
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

// ===== API SERVICE =====

export class ApiService {
  private baseUrl = '/api';

  // === CHARACTERS API ===
  
  // Добавляем метод для получения персонажей текущего пользователя
  async getUserCharacters(): Promise<Character[]> {
    const response = await makeRequest<ApiListResponse<Character>>(
      `${this.baseUrl}/characters/my`
    );
    return response.data;
  }

  async getCitizens(filters: CitizenFilters = {}): Promise<Character[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Character>>(
      `${this.baseUrl}/characters?${params.toString()}`
    );
    return response.data;
  }

  async getCitizenById(id: string): Promise<Character> {
    const response = await makeRequest<ApiResponse<Character>>(
      `${this.baseUrl}/characters/${id}`
    );
    return response.data;
  }

  async createCitizen(data: CreateCharacterRequest): Promise<Character> {
    const response = await makeRequest<ApiResponse<Character>>(
      `${this.baseUrl}/characters`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateCitizen(id: string, data: UpdateCharacterRequest): Promise<Character> {
    const response = await makeRequest<ApiResponse<Character>>(
      `${this.baseUrl}/characters/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async deleteCitizen(id: string): Promise<void> {
    await makeRequest(`${this.baseUrl}/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // === VEHICLES API ===
  async getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Vehicle>>(
      `${this.baseUrl}/vehicles?${params.toString()}`
    );
    return response.data;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await makeRequest<ApiResponse<Vehicle>>(
      `${this.baseUrl}/vehicles/${id}`
    );
    return response.data;
  }

  async createVehicle(data: any): Promise<Vehicle> {
    const response = await makeRequest<ApiResponse<Vehicle>>(
      `${this.baseUrl}/vehicles`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateVehicle(id: string, data: any): Promise<Vehicle> {
    const response = await makeRequest<ApiResponse<Vehicle>>(
      `${this.baseUrl}/vehicles/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // === WEAPONS API ===
  async getWeapons(filters: WeaponFilters = {}): Promise<Weapon[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Weapon>>(
      `${this.baseUrl}/weapons?${params.toString()}`
    );
    return response.data;
  }

  async getWeaponById(id: string): Promise<Weapon> {
    const response = await makeRequest<ApiResponse<Weapon>>(
      `${this.baseUrl}/weapons/${id}`
    );
    return response.data;
  }

  async createWeapon(data: any): Promise<Weapon> {
    const response = await makeRequest<ApiResponse<Weapon>>(
      `${this.baseUrl}/weapons`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateWeapon(id: string, data: any): Promise<Weapon> {
    const response = await makeRequest<ApiResponse<Weapon>>(
      `${this.baseUrl}/weapons/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // === REPORTS API ===
  async getReports(filters: ReportFilters = {}): Promise<Report[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Report>>(
      `${this.baseUrl}/reports?${params.toString()}`
    );
    return response.data;
  }

  async getReportById(id: string): Promise<Report> {
    const response = await makeRequest<ApiResponse<Report>>(
      `${this.baseUrl}/reports/${id}`
    );
    return response.data;
  }

  async createReport(data: any): Promise<Report> {
    const response = await makeRequest<ApiResponse<Report>>(
      `${this.baseUrl}/reports`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateReport(id: string, data: any): Promise<Report> {
    const response = await makeRequest<ApiResponse<Report>>(
      `${this.baseUrl}/reports/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // === CALLS API ===
  async getCalls(filters: CallFilters = {}): Promise<Call911[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Call911>>(
      `${this.baseUrl}/calls?${params.toString()}`
    );
    return response.data;
  }

  async getCallById(id: string): Promise<Call911> {
    const response = await makeRequest<ApiResponse<Call911>>(
      `${this.baseUrl}/calls/${id}`
    );
    return response.data;
  }

  async createCall(data: any): Promise<Call911> {
    const response = await makeRequest<ApiResponse<Call911>>(
      `${this.baseUrl}/calls`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateCall(id: string, data: any): Promise<Call911> {
    const response = await makeRequest<ApiResponse<Call911>>(
      `${this.baseUrl}/calls/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // === UNITS API ===
  async getUnits(filters: UnitFilters = {}): Promise<Unit[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await makeRequest<ApiListResponse<Unit>>(
      `${this.baseUrl}/units?${params.toString()}`
    );
    return response.data;
  }

  async getUnitById(id: string): Promise<Unit> {
    const response = await makeRequest<ApiResponse<Unit>>(
      `${this.baseUrl}/units/${id}`
    );
    return response.data;
  }

  async createUnit(data: any): Promise<Unit> {
    const response = await makeRequest<ApiResponse<Unit>>(
      `${this.baseUrl}/units`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateUnit(id: string, data: any): Promise<Unit> {
    const response = await makeRequest<ApiResponse<Unit>>(
      `${this.baseUrl}/units/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // === ACTIVE UNITS API ===
  async getActiveUnits(): Promise<ActiveUnit[]> {
    const response = await makeRequest<ApiListResponse<ActiveUnit>>(
      `${this.baseUrl}/mdt/units/active`
    );
    return response.data;
  }

  async createMDTUnit(data: any): Promise<ActiveUnit> {
    const response = await makeRequest<ApiResponse<ActiveUnit>>(
      `${this.baseUrl}/mdt/units`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateMDTUnitStatus(unitId: string, status: string): Promise<ActiveUnit> {
    const response = await makeRequest<ApiResponse<ActiveUnit>>(
      `${this.baseUrl}/mdt/units/${unitId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    return response.data;
  }

  async activatePanic(unitId: string): Promise<void> {
    await makeRequest(`${this.baseUrl}/mdt/units/${unitId}/panic`, {
      method: 'POST',
    });
  }

  async deactivatePanic(unitId: string): Promise<void> {
    await makeRequest(`${this.baseUrl}/mdt/units/${unitId}/panic`, {
      method: 'DELETE',
    });
  }

  // === DEPARTMENTS API ===
  async getDepartments(): Promise<Department[]> {
    const response = await makeRequest<ApiListResponse<Department>>(
      `${this.baseUrl}/departments`
    );
    return response.data;
  }

  async getDepartmentById(id: string): Promise<Department> {
    const response = await makeRequest<ApiResponse<Department>>(
      `${this.baseUrl}/departments/${id}`
    );
    return response.data;
  }

  // === SEARCH API ===
  async searchCitizens(query: string, limit: number = 10): Promise<Character[]> {
    const response = await makeRequest<ApiListResponse<Character>>(
      `${this.baseUrl}/characters/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  }

  async searchVehicles(query: string, limit: number = 10): Promise<Vehicle[]> {
    const response = await makeRequest<ApiListResponse<Vehicle>>(
      `${this.baseUrl}/vehicles/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  }

  async searchWeapons(query: string, limit: number = 10): Promise<Weapon[]> {
    const response = await makeRequest<ApiListResponse<Weapon>>(
      `${this.baseUrl}/weapons/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  }

  // === SYSTEM API ===
  async getSystemStats(): Promise<DispatchStats> {
    const response = await makeRequest<ApiResponse<DispatchStats>>(
      `${this.baseUrl}/stats`
    );
    return response.data;
  }

  // === AUTH API ===
  
  // Добавляем метод для получения данных текущего пользователя
  async getCurrentUser(): Promise<User> {
    const response = await makeRequest<{ user: User; characters: any[] }>(`${this.baseUrl}/auth/me`);
    return response.user; // Сервер возвращает { user, characters }, а не { success, data }
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return makeRequest<ApiResponse<any>>(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; email: string; password: string }): Promise<ApiResponse<any>> {
    return makeRequest<ApiResponse<any>>(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async authenticate(token: string): Promise<any> {
    return makeRequest<any>(`${this.baseUrl}/auth/authenticate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // === MDT SPECIFIC API ===
  async generateCadToken(): Promise<string> {
    const response = await makeRequest<ApiResponse<{ token: string }>>(
      `${this.baseUrl}/mdt/token/generate`,
      { method: 'POST' }
    );
    return response.data.token;
  }

  // === TOKEN MANAGEMENT ===
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Экспортируем экземпляр сервиса
export const apiService = new ApiService(); 