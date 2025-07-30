// Fire Incident Entity - API Layer
// REST API для управления пожарными инцидентами

import {
  FireIncident,
  FireIncidentSearchParams,
  CreateFireIncidentParams,
  UpdateFireIncidentParams,
  FireIncidentResponse,
  FireIncidentListResponse,
  FireIncidentStatsResponse,
  FireIncidentExportResponse,
  AddFireUnitParams,
  AddCivilianParams,
  AddDamageParams,
  FireIncidentType,
  FireIncidentStatus,
  FireIncidentPriority,
  FireIncidentSeverity,
  FireIncidentCategory,
  FireUnitType,
  FireUnitStatus,
  WeatherCondition,
  WindDirection
} from '../model/types';

export class FireIncidentApi {
  private static baseUrl = '/api/fire-incidents';

  // ============================================================================
  // CRUD OPERATIONS - Основные операции
  // ============================================================================

  /**
   * Создать новый пожарный инцидент
   */
  static async createFireIncident(params: CreateFireIncidentParams): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating fire incident:', error);
      throw error;
    }
  }

  /**
   * Получить пожарный инцидент по ID
   */
  static async getFireIncident(id: string): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident:', error);
      throw error;
    }
  }

  /**
   * Обновить пожарный инцидент
   */
  static async updateFireIncident(id: string, params: UpdateFireIncidentParams): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire incident:', error);
      throw error;
    }
  }

  /**
   * Удалить пожарный инцидент
   */
  static async deleteFireIncident(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting fire incident:', error);
      throw error;
    }
  }

  // ============================================================================
  // SEARCH & FILTERING - Поиск и фильтрация
  // ============================================================================

  /**
   * Поиск пожарных инцидентов
   */
  static async searchFireIncidents(params: FireIncidentSearchParams = {}): Promise<FireIncidentListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Добавляем параметры поиска
      if (params.type?.length) {
        params.type.forEach(type => queryParams.append('type', type));
      }
      if (params.status?.length) {
        params.status.forEach(status => queryParams.append('status', status));
      }
      if (params.priority?.length) {
        params.priority.forEach(priority => queryParams.append('priority', priority));
      }
      if (params.severity?.length) {
        params.severity.forEach(severity => queryParams.append('severity', severity));
      }
      if (params.category?.length) {
        params.category.forEach(category => queryParams.append('category', category));
      }
      if (params.city) {
        queryParams.append('city', params.city);
      }
      if (params.address) {
        queryParams.append('address', params.address);
      }
      if (params.reportedAfter) {
        queryParams.append('reportedAfter', params.reportedAfter);
      }
      if (params.reportedBefore) {
        queryParams.append('reportedBefore', params.reportedBefore);
      }
      if (params.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
      }
      if (params.isFalseAlarm !== undefined) {
        queryParams.append('isFalseAlarm', params.isFalseAlarm.toString());
      }
      if (params.requiresEvacuation !== undefined) {
        queryParams.append('requiresEvacuation', params.requiresEvacuation.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset) {
        queryParams.append('offset', params.offset.toString());
      }
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const response = await fetch(`${this.baseUrl}/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching fire incidents:', error);
      throw error;
    }
  }

  /**
   * Поиск по типу инцидента
   */
  static async getFireIncidentsByType(type: FireIncidentType, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ type: [type], limit });
  }

  /**
   * Поиск по статусу
   */
  static async getFireIncidentsByStatus(status: FireIncidentStatus, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ status: [status], limit });
  }

  /**
   * Поиск по приоритету
   */
  static async getFireIncidentsByPriority(priority: FireIncidentPriority, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ priority: [priority], limit });
  }

  /**
   * Поиск по серьезности
   */
  static async getFireIncidentsBySeverity(severity: FireIncidentSeverity, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ severity: [severity], limit });
  }

  /**
   * Поиск по категории
   */
  static async getFireIncidentsByCategory(category: FireIncidentCategory, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ category: [category], limit });
  }

  /**
   * Поиск по городу
   */
  static async getFireIncidentsByCity(city: string, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ city, limit });
  }

  /**
   * Поиск по адресу
   */
  static async getFireIncidentsByAddress(address: string, limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ address, limit });
  }

  /**
   * Поиск активных инцидентов
   */
  static async getActiveFireIncidents(limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ isActive: true, limit });
  }

  /**
   * Поиск ложных тревог
   */
  static async getFalseAlarms(limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ isFalseAlarm: true, limit });
  }

  /**
   * Поиск инцидентов с эвакуацией
   */
  static async getEvacuationIncidents(limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ requiresEvacuation: true, limit });
  }

  // ============================================================================
  // TIME-BASED SEARCH - Поиск по времени
  // ============================================================================

  /**
   * Получить инциденты за сегодня
   */
  static async getTodayFireIncidents(limit = 50): Promise<FireIncidentListResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.searchFireIncidents({ 
      reportedAfter: `${today}T00:00:00Z`,
      reportedBefore: `${today}T23:59:59Z`,
      limit 
    });
  }

  /**
   * Получить инциденты за неделю
   */
  static async getThisWeekFireIncidents(limit = 100): Promise<FireIncidentListResponse> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.searchFireIncidents({ 
      reportedAfter: weekAgo.toISOString(),
      reportedBefore: now.toISOString(),
      limit 
    });
  }

  /**
   * Получить инциденты за месяц
   */
  static async getThisMonthFireIncidents(limit = 200): Promise<FireIncidentListResponse> {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return this.searchFireIncidents({ 
      reportedAfter: monthAgo.toISOString(),
      reportedBefore: now.toISOString(),
      limit 
    });
  }

  /**
   * Получить критические инциденты
   */
  static async getCriticalFireIncidents(limit = 50): Promise<FireIncidentListResponse> {
    return this.searchFireIncidents({ 
      priority: [FireIncidentPriority.CRITICAL, FireIncidentPriority.EMERGENCY],
      limit 
    });
  }

  // ============================================================================
  // UNIT MANAGEMENT - Управление подразделениями
  // ============================================================================

  /**
   * Добавить подразделение к инциденту
   */
  static async addFireUnit(incidentId: string, params: AddFireUnitParams): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding fire unit:', error);
      throw error;
    }
  }

  /**
   * Обновить статус подразделения
   */
  static async updateFireUnitStatus(
    incidentId: string, 
    unitId: string, 
    status: FireUnitStatus
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/units/${unitId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire unit status:', error);
      throw error;
    }
  }

  /**
   * Удалить подразделение из инцидента
   */
  static async removeFireUnit(incidentId: string, unitId: string): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/units/${unitId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing fire unit:', error);
      throw error;
    }
  }

  // ============================================================================
  // CIVILIAN MANAGEMENT - Управление гражданскими лицами
  // ============================================================================

  /**
   * Добавить гражданское лицо к инциденту
   */
  static async addCivilian(incidentId: string, params: AddCivilianParams): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/civilians`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding civilian:', error);
      throw error;
    }
  }

  /**
   * Обновить информацию о гражданском лице
   */
  static async updateCivilian(
    incidentId: string, 
    civilianId: string, 
    params: Partial<AddCivilianParams>
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/civilians/${civilianId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating civilian:', error);
      throw error;
    }
  }

  /**
   * Удалить гражданское лицо из инцидента
   */
  static async removeCivilian(incidentId: string, civilianId: string): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/civilians/${civilianId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing civilian:', error);
      throw error;
    }
  }

  // ============================================================================
  // DAMAGE MANAGEMENT - Управление повреждениями
  // ============================================================================

  /**
   * Добавить повреждение к инциденту
   */
  static async addDamage(incidentId: string, params: AddDamageParams): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/damages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding damage:', error);
      throw error;
    }
  }

  /**
   * Обновить информацию о повреждении
   */
  static async updateDamage(
    incidentId: string, 
    damageId: string, 
    params: Partial<AddDamageParams>
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/damages/${damageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating damage:', error);
      throw error;
    }
  }

  /**
   * Удалить повреждение из инцидента
   */
  static async removeDamage(incidentId: string, damageId: string): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${incidentId}/damages/${damageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing damage:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATUS MANAGEMENT - Управление статусом
  // ============================================================================

  /**
   * Изменить статус инцидента
   */
  static async updateFireIncidentStatus(
    id: string, 
    status: FireIncidentStatus
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire incident status:', error);
      throw error;
    }
  }

  /**
   * Изменить приоритет инцидента
   */
  static async updateFireIncidentPriority(
    id: string, 
    priority: FireIncidentPriority
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire incident priority:', error);
      throw error;
    }
  }

  /**
   * Изменить серьезность инцидента
   */
  static async updateFireIncidentSeverity(
    id: string, 
    severity: FireIncidentSeverity
  ): Promise<FireIncidentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/severity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ severity }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating fire incident severity:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS & ANALYTICS - Статистика и аналитика
  // ============================================================================

  /**
   * Получить общую статистику
   */
  static async getFireIncidentStats(): Promise<FireIncidentStatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident stats:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по типам
   */
  static async getFireIncidentStatsByType(): Promise<{ type: FireIncidentType; count: number }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/by-type`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident stats by type:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по статусам
   */
  static async getFireIncidentStatsByStatus(): Promise<{ status: FireIncidentStatus; count: number }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/by-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident stats by status:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по приоритетам
   */
  static async getFireIncidentStatsByPriority(): Promise<{ priority: FireIncidentPriority; count: number }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/by-priority`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident stats by priority:', error);
      throw error;
    }
  }

  /**
   * Получить статистику по городам
   */
  static async getFireIncidentStatsByCity(): Promise<{ city: string; count: number }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/by-city`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching fire incident stats by city:', error);
      throw error;
    }
  }

  // ============================================================================
  // EXPORT - Экспорт данных
  // ============================================================================

  /**
   * Экспорт инцидентов в CSV
   */
  static async exportFireIncidentsToCSV(params: FireIncidentSearchParams = {}): Promise<FireIncidentExportResponse> {
    return this.exportFireIncidents('csv', params);
  }

  /**
   * Экспорт инцидентов в JSON
   */
  static async exportFireIncidentsToJSON(params: FireIncidentSearchParams = {}): Promise<FireIncidentExportResponse> {
    return this.exportFireIncidents('json', params);
  }

  /**
   * Экспорт инцидентов в PDF
   */
  static async exportFireIncidentsToPDF(params: FireIncidentSearchParams = {}): Promise<FireIncidentExportResponse> {
    return this.exportFireIncidents('pdf', params);
  }

  /**
   * Экспорт инцидентов в Excel
   */
  static async exportFireIncidentsToExcel(params: FireIncidentSearchParams = {}): Promise<FireIncidentExportResponse> {
    return this.exportFireIncidents('excel', params);
  }

  /**
   * Общий метод экспорта
   */
  private static async exportFireIncidents(
    format: 'csv' | 'json' | 'pdf' | 'excel', 
    params: FireIncidentSearchParams = {}
  ): Promise<FireIncidentExportResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      // Добавляем параметры поиска
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error exporting fire incidents to ${format}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS - Утилитарные методы
  // ============================================================================

  /**
   * Получить опции для селектов
   */
  static getFireIncidentOptions() {
    return {
      types: [
        { value: FireIncidentType.STRUCTURE_FIRE, label: 'Пожар в здании' },
        { value: FireIncidentType.VEHICLE_FIRE, label: 'Пожар ТС' },
        { value: FireIncidentType.WILDLAND_FIRE, label: 'Лесной пожар' },
        { value: FireIncidentType.GRASS_FIRE, label: 'Пожар травы' },
        { value: FireIncidentType.ELECTRICAL_FIRE, label: 'Электрический пожар' },
        { value: FireIncidentType.CHEMICAL_FIRE, label: 'Химический пожар' },
        { value: FireIncidentType.EXPLOSION, label: 'Взрыв' },
        { value: FireIncidentType.GAS_LEAK, label: 'Утечка газа' },
        { value: FireIncidentType.HAZMAT, label: 'Опасные материалы' },
        { value: FireIncidentType.RESCUE, label: 'Спасательная операция' },
        { value: FireIncidentType.FALSE_ALARM, label: 'Ложная тревога' },
        { value: FireIncidentType.OTHER, label: 'Другое' }
      ],
      statuses: [
        { value: FireIncidentStatus.REPORTED, label: 'Заявлен' },
        { value: FireIncidentStatus.DISPATCHED, label: 'Отправлен' },
        { value: FireIncidentStatus.EN_ROUTE, label: 'В пути' },
        { value: FireIncidentStatus.ON_SCENE, label: 'На месте' },
        { value: FireIncidentStatus.IN_PROGRESS, label: 'В работе' },
        { value: FireIncidentStatus.UNDER_CONTROL, label: 'Под контролем' },
        { value: FireIncidentStatus.EXTINGUISHED, label: 'Потух' },
        { value: FireIncidentStatus.CLEANUP, label: 'Уборка' },
        { value: FireIncidentStatus.CLOSED, label: 'Закрыт' },
        { value: FireIncidentStatus.CANCELLED, label: 'Отменен' }
      ],
      priorities: [
        { value: FireIncidentPriority.LOW, label: 'Низкий' },
        { value: FireIncidentPriority.MEDIUM, label: 'Средний' },
        { value: FireIncidentPriority.HIGH, label: 'Высокий' },
        { value: FireIncidentPriority.CRITICAL, label: 'Критический' },
        { value: FireIncidentPriority.EMERGENCY, label: 'Экстренный' }
      ],
      severities: [
        { value: FireIncidentSeverity.MINOR, label: 'Незначительный' },
        { value: FireIncidentSeverity.MODERATE, label: 'Умеренный' },
        { value: FireIncidentSeverity.SERIOUS, label: 'Серьезный' },
        { value: FireIncidentSeverity.SEVERE, label: 'Тяжелый' },
        { value: FireIncidentSeverity.CATASTROPHIC, label: 'Катастрофический' }
      ],
      categories: [
        { value: FireIncidentCategory.RESIDENTIAL, label: 'Жилой дом' },
        { value: FireIncidentCategory.COMMERCIAL, label: 'Коммерческое здание' },
        { value: FireIncidentCategory.INDUSTRIAL, label: 'Промышленное здание' },
        { value: FireIncidentCategory.VEHICLE, label: 'Транспортное средство' },
        { value: FireIncidentCategory.WILDLAND, label: 'Дикая природа' },
        { value: FireIncidentCategory.ELECTRICAL, label: 'Электрическое оборудование' },
        { value: FireIncidentCategory.CHEMICAL, label: 'Химические вещества' },
        { value: FireIncidentCategory.EXPLOSIVE, label: 'Взрывчатые вещества' },
        { value: FireIncidentCategory.GAS, label: 'Газ' },
        { value: FireIncidentCategory.OTHER, label: 'Другое' }
      ],
      unitTypes: [
        { value: FireUnitType.ENGINE, label: 'Пожарная машина' },
        { value: FireUnitType.LADDER, label: 'Лестница' },
        { value: FireUnitType.RESCUE, label: 'Спасательная машина' },
        { value: FireUnitType.HAZMAT, label: 'Опасные материалы' },
        { value: FireUnitType.WATER_TENDER, label: 'Водовоз' },
        { value: FireUnitType.COMMAND, label: 'Командная машина' },
        { value: FireUnitType.MEDICAL, label: 'Медицинская машина' },
        { value: FireUnitType.AIR_SUPPORT, label: 'Воздушная поддержка' },
        { value: FireUnitType.OTHER, label: 'Другое' }
      ],
      unitStatuses: [
        { value: FireUnitStatus.AVAILABLE, label: 'Доступен' },
        { value: FireUnitStatus.DISPATCHED, label: 'Отправлен' },
        { value: FireUnitStatus.EN_ROUTE, label: 'В пути' },
        { value: FireUnitStatus.ON_SCENE, label: 'На месте' },
        { value: FireUnitStatus.IN_PROGRESS, label: 'В работе' },
        { value: FireUnitStatus.RETURNING, label: 'Возвращается' },
        { value: FireUnitStatus.OUT_OF_SERVICE, label: 'Вне службы' },
        { value: FireUnitStatus.MAINTENANCE, label: 'Техобслуживание' }
      ],
      weatherConditions: [
        { value: WeatherCondition.CLEAR, label: 'Ясно' },
        { value: WeatherCondition.CLOUDY, label: 'Облачно' },
        { value: WeatherCondition.RAIN, label: 'Дождь' },
        { value: WeatherCondition.SNOW, label: 'Снег' },
        { value: WeatherCondition.FOG, label: 'Туман' },
        { value: WeatherCondition.WINDY, label: 'Ветрено' },
        { value: WeatherCondition.STORM, label: 'Буря' },
        { value: WeatherCondition.OTHER, label: 'Другое' }
      ],
      windDirections: [
        { value: WindDirection.NORTH, label: 'Север' },
        { value: WindDirection.NORTHEAST, label: 'Северо-восток' },
        { value: WindDirection.EAST, label: 'Восток' },
        { value: WindDirection.SOUTHEAST, label: 'Юго-восток' },
        { value: WindDirection.SOUTH, label: 'Юг' },
        { value: WindDirection.SOUTHWEST, label: 'Юго-запад' },
        { value: WindDirection.WEST, label: 'Запад' },
        { value: WindDirection.NORTHWEST, label: 'Северо-запад' }
      ]
    };
  }
} 