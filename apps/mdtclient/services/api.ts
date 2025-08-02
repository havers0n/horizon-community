// API Service for MDT Client
const isNUI = typeof (window as any).GetParentResourceName === 'function';

export const API_BASE_URL = isNUI
  ? 'http://127.0.0.1:5000/api'  // Для FiveM NUI
  : '/api';                      // Для браузера (через proxy)

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  departmentId: number | null;
  secondaryDepartmentId: number | null;
  rank: string | null;
  authId: string;
}

export interface Character {
  id: number;
  ownerId: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  rank?: string;
  status: string;
  insuranceNumber?: string;
  address?: string;
  createdAt: Date;
}

export interface Application {
  id: number;
  authorId: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewerId?: number;
  reviewComment?: string;
  characterId?: number;
}

export interface Report {
  id: number;
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  recipientId: number;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  fullName: string;
  description?: string;
}

export interface ApplicationRestriction {
  allowed: boolean;
  reason?: string;
  remainingCount?: number;
  cooldownEndsAt?: Date;
}

export interface ApplicationStats {
  thisMonth: {
    entryApplications: number;
    leaveApplications: number;
    totalApplications: number;
  };
  limits: {
    entryApplicationsPerMonth: number;
    leaveApplicationsPerMonth: number;
    promotionQualificationCooldownDays: number;
  };
  nextResetDate: Date;
  lastPromotionQualificationDate?: Date;
}

export interface LeaveStats {
  currentYear: {
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    leaveTypes: Record<string, number>;
  };
  activeLeave?: {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  upcomingLeaves: Array<{
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    daysUntilStart: number;
  }>;
}

// === MDT API ИНТЕРФЕЙСЫ ===

export interface MDTUnit {
  id: string;
  characterId: number;
  unitNumber: string;
  departmentId: number;
  status: string;
  location?: any;
  currentCallId?: number;
  partnerId?: number;
  vehicleId?: number;
  isPanic: boolean;
  lastUpdate: string;
  createdAt: string;
  // Дополнительная информация
  characterName?: string;
  badgeNumber?: string;
  callsign?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
}

export interface MDTCall911 {
  id: string;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  type: string;
  priority: number;
  status: string;
  assignedUnits: number[];
  patientInfo?: any;
  fireInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  type: string;
  authorId: number;
  authorName?: string;
  priority: string;
  location?: string;
  coordinates?: any;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface SignalNotification {
  id: string;
  signalId: string;
  recipientId: number;
  isRead: boolean;
  createdAt: string;
}

export interface Location {
  x: number;
  y: number;
  z: number;
}

export interface CreateUnitData {
  characterId: number;
  unitNumber: string;
  departmentId: number;
  status?: string;
  location?: Location;
  vehicleId?: number;
  authorId?: number;
}

export interface UpdateUnitData {
  status?: string;
  location?: Location;
  vehicleId?: number;
}

export interface CreateCallData {
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  type: string;
  priority?: number;
  status?: string;
  patientInfo?: any;
  fireInfo?: any;
  authorId?: number;
}

export interface UpdateCallData {
  callerName?: string;
  callerPhone?: string;
  location?: string;
  description?: string;
  type?: string;
  priority?: number;
  status?: string;
  patientInfo?: any;
  fireInfo?: any;
}

export interface CreateSignalData {
  title: string;
  description: string;
  type: string;
  authorId: number;
  priority?: string;
  location?: string;
  coordinates?: Location;
  isActive?: boolean;
  expiresAt?: string;
}

export interface UpdateSignalData {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  location?: string;
  coordinates?: Location;
  isActive?: boolean;
  expiresAt?: string;
}

export interface MDTDashboardData {
  activeUnits: number;
  activeCalls: number;
  activeSignals: number;
  recentActivity: any[];
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      
      // Синхронизируем с authUtils если он доступен
      if ((window as any).authUtils) {
        (window as any).authUtils.setToken(token);
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      
      // Синхронизируем с authUtils если он доступен
      if ((window as any).authUtils) {
        (window as any).authUtils.removeToken();
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          message: data.message,
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // === СУЩЕСТВУЮЩИЕ МЕТОДЫ ===

  async login(credentials: LoginData): Promise<ApiResponse<{ user: User; session: any }>> {
    return this.request<{ user: User; session: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; characters: Character[] }>> {
    return this.request<{ user: User; characters: Character[] }>('/auth/me');
  }

  async getUserCharacters(): Promise<ApiResponse<Character[]>> {
    return this.request<Character[]>('/characters/my');
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return this.request<Department[]>('/departments');
  }

  async getDepartment(id: number): Promise<ApiResponse<Department>> {
    return this.request<Department>(`/departments/${id}`);
  }

  async getApplications(): Promise<ApiResponse<Application[]>> {
    return this.request<Application[]>('/applications');
  }

  async createApplication(applicationData: any): Promise<ApiResponse<Application>> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async checkApplicationLimits(type: string): Promise<ApiResponse<{
    restriction: ApplicationRestriction;
    stats: ApplicationStats;
  }>> {
    return this.request<{
      restriction: ApplicationRestriction;
      stats: ApplicationStats;
    }>(`/application-limits/${type}`);
  }

  async getReports(): Promise<ApiResponse<Report[]>> {
    return this.request<Report[]>('/reports');
  }

  async createReport(reportData: any): Promise<ApiResponse<Report>> {
    return this.request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReportTemplates(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/report-templates');
  }

  async downloadReportTemplate(id: string): Promise<Blob> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/report-templates/${id}/download`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(id: number): Promise<ApiResponse<Notification>> {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.request<{ message: string; count: number }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeaveStats(): Promise<ApiResponse<LeaveStats>> {
    return this.request<LeaveStats>('/leave-stats');
  }

  async getJointPositions(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/joint-positions');
  }

  async removeJointPosition(userId: number, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/joint-positions/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    environment: string;
  }>> {
    return this.request<{
      status: string;
      timestamp: string;
      environment: string;
    }>('/health');
  }

  // === НОВЫЕ MDT API МЕТОДЫ ===

  // MDT Units
  async getMDTUnits(): Promise<ApiResponse<MDTUnit[]>> {
    return this.request<MDTUnit[]>('/mdt/units');
  }

  async createMDTUnit(unitData: CreateUnitData): Promise<ApiResponse<MDTUnit>> {
    return this.request<MDTUnit>('/mdt/units', {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  }

  async updateMDTUnitStatus(unitId: string, status: string): Promise<ApiResponse<MDTUnit>> {
    return this.request<MDTUnit>(`/mdt/units/${unitId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateMDTUnitLocation(unitId: string, location: Location): Promise<ApiResponse<MDTUnit>> {
    return this.request<MDTUnit>(`/mdt/units/${unitId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ location }),
    });
  }

  async activateMDTUnitPanic(unitId: string): Promise<ApiResponse<MDTUnit>> {
    return this.request<MDTUnit>(`/mdt/units/${unitId}/panic`, {
      method: 'POST',
    });
  }

  async deactivateMDTUnitPanic(unitId: string): Promise<ApiResponse<MDTUnit>> {
    return this.request<MDTUnit>(`/mdt/units/${unitId}/panic`, {
      method: 'DELETE',
    });
  }

  // MDT Calls 911
  async getMDTCalls(): Promise<ApiResponse<MDTCall911[]>> {
    return this.request<MDTCall911[]>('/mdt/calls');
  }

  async createMDTCall(callData: CreateCallData): Promise<ApiResponse<MDTCall911>> {
    return this.request<MDTCall911>('/mdt/calls', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  async updateMDTCall(callId: string, callData: UpdateCallData): Promise<ApiResponse<MDTCall911>> {
    return this.request<MDTCall911>(`/mdt/calls/${callId}`, {
      method: 'PUT',
      body: JSON.stringify(callData),
    });
  }

  async assignUnitsToCall(callId: string, unitIds: number[]): Promise<ApiResponse<MDTCall911>> {
    return this.request<MDTCall911>(`/mdt/calls/${callId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ unitIds }),
    });
  }

  async updateMDTCallStatus(callId: string, status: string): Promise<ApiResponse<MDTCall911>> {
    return this.request<MDTCall911>(`/mdt/calls/${callId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // MDT Signals
  async getMDTSignals(): Promise<ApiResponse<Signal[]>> {
    return this.request<Signal[]>('/mdt/signals');
  }

  async createMDTSignal(signalData: CreateSignalData): Promise<ApiResponse<Signal>> {
    return this.request<Signal>('/mdt/signals', {
      method: 'POST',
      body: JSON.stringify(signalData),
    });
  }

  async updateMDTSignal(signalId: string, signalData: UpdateSignalData): Promise<ApiResponse<Signal>> {
    return this.request<Signal>(`/mdt/signals/${signalId}`, {
      method: 'PUT',
      body: JSON.stringify(signalData),
    });
  }

  async revokeMDTSignal(signalId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/mdt/signals/${signalId}`, {
      method: 'DELETE',
    });
  }

  async notifyMDTSignal(signalId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/mdt/signals/${signalId}/notify`, {
      method: 'POST',
    });
  }

  // MDT Dashboard
  async getMDTDashboard(): Promise<ApiResponse<MDTDashboardData>> {
    return this.request<MDTDashboardData>('/mdt/dashboard');
  }

  // MDT Notifications
  async getMDTNotifications(): Promise<ApiResponse<SignalNotification[]>> {
    return this.request<SignalNotification[]>('/mdt/notifications');
  }

  async markMDTNotificationAsRead(notificationId: string): Promise<ApiResponse<SignalNotification>> {
    return this.request<SignalNotification>(`/mdt/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService(); 