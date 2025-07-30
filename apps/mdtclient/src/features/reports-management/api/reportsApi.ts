import { 
  EmsReport, 
  CreateEmsReportRequest, 
  UpdateEmsReportRequest, 
  EmsReportSearchParams, 
  EmsReportSearchResult 
} from '../model/types';

export class ReportsApi {
  private static baseUrl = '/api/ems/reports';

  static async getReports(params: EmsReportSearchParams = {}): Promise<EmsReportSearchResult> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.type) queryParams.append('type', params.type);
      if (params.authorId) queryParams.append('authorId', params.authorId);
      if (params.callId) queryParams.append('callId', params.callId);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  static async getReport(id: string): Promise<EmsReport> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  static async createReport(data: CreateEmsReportRequest): Promise<EmsReport> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  static async updateReport(id: string, data: UpdateEmsReportRequest): Promise<EmsReport> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  static async deleteReport(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  static async getReportsByType(type: 'medical' | 'fire' | 'rescue', limit = 10): Promise<EmsReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/type/${type}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.reports || [];
    } catch (error) {
      console.error('Error fetching reports by type:', error);
      throw error;
    }
  }

  static async getReportsByAuthor(authorId: string, limit = 10): Promise<EmsReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/author/${authorId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.reports || [];
    } catch (error) {
      console.error('Error fetching reports by author:', error);
      throw error;
    }
  }

  static async getReportsByCall(callId: string): Promise<EmsReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.reports || [];
    } catch (error) {
      console.error('Error fetching reports by call:', error);
      throw error;
    }
  }

  static async exportReports(params: EmsReportSearchParams = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.type) queryParams.append('type', params.type);
      if (params.authorId) queryParams.append('authorId', params.authorId);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${this.baseUrl}/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting reports:', error);
      throw error;
    }
  }

  static async getReportStats(): Promise<{
    total: number;
    byType: { medical: number; fire: number; rescue: number };
    byMonth: Record<string, number>;
    averageResponseTime: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching report stats:', error);
      throw error;
    }
  }
} 