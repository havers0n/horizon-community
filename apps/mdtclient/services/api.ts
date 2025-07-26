// API Service for MDT Client
const API_BASE_URL = 'http://localhost:5000/api';

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

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: LoginData): Promise<ApiResponse<{ user: User; session: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User; characters: Character[] }>> {
    return this.request('/auth/me');
  }

  async logout(): Promise<ApiResponse> {
    this.clearToken();
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Departments
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return this.request('/departments');
  }

  async getDepartment(id: number): Promise<ApiResponse<Department>> {
    return this.request(`/departments/${id}`);
  }

  // Applications
  async getApplications(): Promise<ApiResponse<Application[]>> {
    return this.request('/applications');
  }

  async createApplication(applicationData: any): Promise<ApiResponse<Application>> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async checkApplicationLimits(type: string): Promise<ApiResponse<{
    restriction: ApplicationRestriction;
    stats: ApplicationStats;
  }>> {
    return this.request(`/application-limits/${type}`);
  }

  // Reports
  async getReports(): Promise<ApiResponse<Report[]>> {
    return this.request('/reports');
  }

  async createReport(reportData: any): Promise<ApiResponse<Report>> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReportTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('/report-templates');
  }

  async downloadReportTemplate(id: string): Promise<Blob> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/report-templates/${id}/download`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    return response.blob();
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id: number): Promise<ApiResponse<Notification>> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async deleteNotification(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // Leave Management
  async getLeaveStats(): Promise<ApiResponse<LeaveStats>> {
    return this.request('/leave-stats');
  }

  // Joint Positions
  async getJointPositions(): Promise<ApiResponse<any[]>> {
    return this.request('/joint-positions');
  }

  async removeJointPosition(userId: number, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/joint-positions/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    environment: string;
  }>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService; 