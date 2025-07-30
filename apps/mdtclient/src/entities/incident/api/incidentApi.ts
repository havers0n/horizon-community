// API Layer для Incident Entity
// REST API методы для работы с инцидентами

import {
  Incident,
  IncidentSearchFilters,
  IncidentSearchResult,
  CreateIncidentParams,
  UpdateIncidentParams,
  IncidentStatistics,
  IncidentExportOptions,
  CreateIncidentResponse,
  UpdateIncidentResponse,
  DeleteIncidentResponse,
  GetIncidentResponse,
  SearchIncidentsResponse,
  GetIncidentStatisticsResponse,
  ExportIncidentsResponse,
  IncidentApiResponse,
  IncidentType,
  IncidentStatus,
  IncidentPriority,
  IncidentSeverity,
  IncidentCategory,
  Department
} from '../model';

export class IncidentApi {
  private static baseUrl = '/api/incidents';

  // ===== CRUD ОПЕРАЦИИ =====

  /**
   * Создание нового инцидента
   */
  static async createIncident(params: CreateIncidentParams): Promise<CreateIncidentResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Получение инцидента по ID
   */
  static async getIncident(id: string): Promise<GetIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Получение инцидента по номеру
   */
  static async getIncidentByNumber(incidentNumber: string): Promise<GetIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/number/${incidentNumber}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Обновление инцидента
   */
  static async updateIncident(id: string, params: UpdateIncidentParams): Promise<UpdateIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Удаление инцидента
   */
  static async deleteIncident(id: string): Promise<DeleteIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====

  /**
   * Поиск инцидентов с фильтрами
   */
  static async searchIncidents(filters: IncidentSearchFilters = {}): Promise<SearchIncidentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем фильтры в query параметры
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/search?${queryParams.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Поиск инцидентов по типу
   */
  static async getIncidentsByType(type: IncidentType, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ type: [type], limit });
  }

  /**
   * Поиск инцидентов по статусу
   */
  static async getIncidentsByStatus(status: IncidentStatus, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ status: [status], limit });
  }

  /**
   * Поиск инцидентов по приоритету
   */
  static async getIncidentsByPriority(priority: IncidentPriority, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ priority: [priority], limit });
  }

  /**
   * Поиск инцидентов по серьезности
   */
  static async getIncidentsBySeverity(severity: IncidentSeverity, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ severity: [severity], limit });
  }

  /**
   * Поиск инцидентов по категории
   */
  static async getIncidentsByCategory(category: IncidentCategory, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ category: [category], limit });
  }

  /**
   * Поиск инцидентов по департаменту
   */
  static async getIncidentsByDepartment(department: Department, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ department: [department], limit });
  }

  /**
   * Поиск инцидентов по городу
   */
  static async getIncidentsByCity(city: string, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ city, limit });
  }

  /**
   * Поиск инцидентов по почтовому индексу
   */
  static async getIncidentsByZipCode(zipCode: string, limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ zipCode, limit });
  }

  /**
   * Поиск инцидентов по радиусу от координат
   */
  static async getIncidentsByRadius(
    latitude: number, 
    longitude: number, 
    radius: number, 
    limit = 50
  ): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ 
      radius, 
      limit,
      // Добавляем координаты в фильтры
      coordinates: { latitude, longitude }
    } as any);
  }

  /**
   * Поиск инцидентов по временному диапазону
   */
  static async getIncidentsByDateRange(
    dateFrom: string, 
    dateTo: string, 
    limit = 50
  ): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ dateFrom, dateTo, limit });
  }

  /**
   * Поиск инцидентов с медиа файлами
   */
  static async getIncidentsWithMedia(limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ hasPhotos: true, hasVideos: true, limit });
  }

  /**
   * Поиск инцидентов по тегам
   */
  static async getIncidentsByTags(tags: string[], limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({ tags, limit });
  }

  // ===== УПРАВЛЕНИЕ УЧАСТНИКАМИ =====

  /**
   * Добавление подразделения к инциденту
   */
  static async assignUnitToIncident(
    incidentId: string, 
    unitId: string
  ): Promise<IncidentApiResponse<Incident>> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unitId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Удаление подразделения из инцидента
   */
  static async removeUnitFromIncident(
    incidentId: string, 
    unitId: string
  ): Promise<IncidentApiResponse<Incident>> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/units/${unitId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Добавление гражданина к инциденту
   */
  static async addCitizenToIncident(
    incidentId: string, 
    citizenData: any
  ): Promise<IncidentApiResponse<Incident>> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/citizens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(citizenData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Добавление транспортного средства к инциденту
   */
  static async addVehicleToIncident(
    incidentId: string, 
    vehicleData: any
  ): Promise<IncidentApiResponse<Incident>> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===== УПРАВЛЕНИЕ СТАТУСОМ =====

  /**
   * Изменение статуса инцидента
   */
  static async updateIncidentStatus(
    incidentId: string, 
    status: IncidentStatus
  ): Promise<UpdateIncidentResponse> {
    return this.updateIncident(incidentId, { status });
  }

  /**
   * Изменение приоритета инцидента
   */
  static async updateIncidentPriority(
    incidentId: string, 
    priority: IncidentPriority
  ): Promise<UpdateIncidentResponse> {
    return this.updateIncident(incidentId, { priority });
  }

  /**
   * Изменение серьезности инцидента
   */
  static async updateIncidentSeverity(
    incidentId: string, 
    severity: IncidentSeverity
  ): Promise<UpdateIncidentResponse> {
    return this.updateIncident(incidentId, { severity });
  }

  /**
   * Закрытие инцидента
   */
  static async closeIncident(incidentId: string): Promise<UpdateIncidentResponse> {
    return this.updateIncident(incidentId, { 
      status: IncidentStatus.CLOSED,
      resolvedAt: new Date().toISOString()
    });
  }

  /**
   * Отмена инцидента
   */
  static async cancelIncident(incidentId: string): Promise<UpdateIncidentResponse> {
    return this.updateIncident(incidentId, { 
      status: IncidentStatus.CANCELLED 
    });
  }

  // ===== СТАТИСТИКА И АНАЛИТИКА =====

  /**
   * Получение статистики инцидентов
   */
  static async getIncidentStatistics(filters?: Partial<IncidentSearchFilters>): Promise<GetIncidentStatisticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/statistics?${queryParams.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Получение статистики по типам инцидентов
   */
  static async getStatisticsByType(): Promise<GetIncidentStatisticsResponse> {
    return this.getIncidentStatistics();
  }

  /**
   * Получение статистики по статусам
   */
  static async getStatisticsByStatus(): Promise<GetIncidentStatisticsResponse> {
    return this.getIncidentStatistics();
  }

  /**
   * Получение статистики по приоритетам
   */
  static async getStatisticsByPriority(): Promise<GetIncidentStatisticsResponse> {
    return this.getIncidentStatistics();
  }

  /**
   * Получение статистики по департаментам
   */
  static async getStatisticsByDepartment(): Promise<GetIncidentStatisticsResponse> {
    return this.getIncidentStatistics();
  }

  /**
   * Получение статистики по городам
   */
  static async getStatisticsByCity(): Promise<GetIncidentStatisticsResponse> {
    return this.getIncidentStatistics();
  }

  // ===== ЭКСПОРТ ДАННЫХ =====

  /**
   * Экспорт инцидентов
   */
  static async exportIncidents(options: IncidentExportOptions): Promise<ExportIncidentsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Экспорт инцидентов в CSV
   */
  static async exportToCSV(filters?: IncidentSearchFilters): Promise<ExportIncidentsResponse> {
    return this.exportIncidents({ 
      format: 'csv', 
      filters,
      includeDetails: true 
    });
  }

  /**
   * Экспорт инцидентов в JSON
   */
  static async exportToJSON(filters?: IncidentSearchFilters): Promise<ExportIncidentsResponse> {
    return this.exportIncidents({ 
      format: 'json', 
      filters,
      includeDetails: true 
    });
  }

  /**
   * Экспорт инцидентов в PDF
   */
  static async exportToPDF(filters?: IncidentSearchFilters): Promise<ExportIncidentsResponse> {
    return this.exportIncidents({ 
      format: 'pdf', 
      filters,
      includeDetails: true,
      includeMedia: true 
    });
  }

  /**
   * Экспорт инцидентов в Excel
   */
  static async exportToExcel(filters?: IncidentSearchFilters): Promise<ExportIncidentsResponse> {
    return this.exportIncidents({ 
      format: 'excel', 
      filters,
      includeDetails: true 
    });
  }

  // ===== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ =====

  /**
   * Получение активных инцидентов
   */
  static async getActiveIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({
      status: [
        IncidentStatus.REPORTED,
        IncidentStatus.DISPATCHED,
        IncidentStatus.EN_ROUTE,
        IncidentStatus.ON_SCENE,
        IncidentStatus.IN_PROGRESS
      ],
      limit
    });
  }

  /**
   * Получение критических инцидентов
   */
  static async getCriticalIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    return this.searchIncidents({
      priority: [IncidentPriority.CRITICAL, IncidentPriority.EMERGENCY],
      limit
    });
  }

  /**
   * Получение инцидентов за сегодня
   */
  static async getTodayIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.searchIncidents({
      dateFrom: today,
      dateTo: today,
      limit
    });
  }

  /**
   * Получение инцидентов за последние 24 часа
   */
  static async getLast24HoursIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return this.searchIncidents({
      dateFrom: yesterday.toISOString(),
      dateTo: now.toISOString(),
      limit
    });
  }

  /**
   * Получение инцидентов за текущую неделю
   */
  static async getThisWeekIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return this.searchIncidents({
      dateFrom: startOfWeek.toISOString(),
      dateTo: now.toISOString(),
      limit
    });
  }

  /**
   * Получение инцидентов за текущий месяц
   */
  static async getThisMonthIncidents(limit = 50): Promise<SearchIncidentsResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.searchIncidents({
      dateFrom: startOfMonth.toISOString(),
      dateTo: now.toISOString(),
      limit
    });
  }
} 