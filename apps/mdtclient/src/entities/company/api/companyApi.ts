// @ts-nocheck - TODO: Remove after major refactoring is complete
// Company API - методы для работы с компаниями
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanySearchParams,
  CompanySearchResult,
  CompanyExportData,
  CompanyStats,
  CompanyLicense,
  CreateLicenseRequest,
  UpdateLicenseRequest,
  CompanyViolation,
  CreateViolationRequest,
  UpdateViolationRequest,
  CompanyInspection,
  CreateInspectionRequest,
  UpdateInspectionRequest,
  CompanyDocument
} from '@/shared/types';

export class CompanyApi {
  private static baseUrl = '/api/companies';

  // Основные CRUD операции
  static async getCompany(id: string): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company: ${response.statusText}`);
    }
    return response.json();
  }

  static async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create company: ${response.statusText}`);
    }
    return response.json();
  }

  static async updateCompany(id: string, data: UpdateCompanyRequest): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update company: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteCompany(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete company: ${response.statusText}`);
    }
  }

  // Поиск и фильтрация
  static async searchCompanies(params: CompanySearchParams = {}): Promise<CompanySearchResult> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/search?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to search companies: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompaniesByIndustry(industry: string, limit = 10): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/industry/${industry}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies by industry: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompaniesByType(type: string, limit = 10): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/type/${type}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies by type: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompaniesByStatus(status: string, limit = 10): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/status/${status}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies by status: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompaniesByLocation(city: string, state?: string, limit = 10): Promise<Company[]> {
    const params = new URLSearchParams({ city, limit: limit.toString() });
    if (state) params.append('state', state);
    
    const response = await fetch(`${this.baseUrl}/location?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch companies by location: ${response.statusText}`);
    }
    return response.json();
  }

  // Статистика и аналитика
  static async getCompanyStats(): Promise<CompanyStats> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company stats: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompanyStatsByIndustry(): Promise<Record<string, number>> {
    const response = await fetch(`${this.baseUrl}/stats/industry`);
    if (!response.ok) {
      throw new Error(`Failed to fetch industry stats: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompanyStatsByLocation(): Promise<Record<string, number>> {
    const response = await fetch(`${this.baseUrl}/stats/location`);
    if (!response.ok) {
      throw new Error(`Failed to fetch location stats: ${response.statusText}`);
    }
    return response.json();
  }

  // Экспорт данных
  static async exportCompanies(params: CompanySearchParams = {}): Promise<CompanyExportData> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/export?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to export companies: ${response.statusText}`);
    }
    return response.json();
  }

  // Управление лицензиями
  static async getCompanyLicenses(companyId: string): Promise<CompanyLicense[]> {
    const response = await fetch(`${this.baseUrl}/${companyId}/licenses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company licenses: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompanyLicense(companyId: string, licenseId: string): Promise<CompanyLicense> {
    const response = await fetch(`${this.baseUrl}/${companyId}/licenses/${licenseId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company license: ${response.statusText}`);
    }
    return response.json();
  }

  static async createCompanyLicense(companyId: string, data: CreateLicenseRequest): Promise<CompanyLicense> {
    const response = await fetch(`${this.baseUrl}/${companyId}/licenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create company license: ${response.statusText}`);
    }
    return response.json();
  }

  static async updateCompanyLicense(companyId: string, licenseId: string, data: UpdateLicenseRequest): Promise<CompanyLicense> {
    const response = await fetch(`${this.baseUrl}/${companyId}/licenses/${licenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update company license: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteCompanyLicense(companyId: string, licenseId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${companyId}/licenses/${licenseId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete company license: ${response.statusText}`);
    }
  }

  static async getExpiringLicenses(daysThreshold = 30): Promise<CompanyLicense[]> {
    const response = await fetch(`${this.baseUrl}/licenses/expiring?days=${daysThreshold}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expiring licenses: ${response.statusText}`);
    }
    return response.json();
  }

  // Управление нарушениями
  static async getCompanyViolations(companyId: string): Promise<CompanyViolation[]> {
    const response = await fetch(`${this.baseUrl}/${companyId}/violations`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company violations: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompanyViolation(companyId: string, violationId: string): Promise<CompanyViolation> {
    const response = await fetch(`${this.baseUrl}/${companyId}/violations/${violationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company violation: ${response.statusText}`);
    }
    return response.json();
  }

  static async createCompanyViolation(companyId: string, data: CreateViolationRequest): Promise<CompanyViolation> {
    const response = await fetch(`${this.baseUrl}/${companyId}/violations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create company violation: ${response.statusText}`);
    }
    return response.json();
  }

  static async updateCompanyViolation(companyId: string, violationId: string, data: UpdateViolationRequest): Promise<CompanyViolation> {
    const response = await fetch(`${this.baseUrl}/${companyId}/violations/${violationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update company violation: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteCompanyViolation(companyId: string, violationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${companyId}/violations/${violationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete company violation: ${response.statusText}`);
    }
  }

  static async getPendingViolations(): Promise<CompanyViolation[]> {
    const response = await fetch(`${this.baseUrl}/violations/pending`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pending violations: ${response.statusText}`);
    }
    return response.json();
  }

  // Управление инспекциями
  static async getCompanyInspections(companyId: string): Promise<CompanyInspection[]> {
    const response = await fetch(`${this.baseUrl}/${companyId}/inspections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company inspections: ${response.statusText}`);
    }
    return response.json();
  }

  static async getCompanyInspection(companyId: string, inspectionId: string): Promise<CompanyInspection> {
    const response = await fetch(`${this.baseUrl}/${companyId}/inspections/${inspectionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company inspection: ${response.statusText}`);
    }
    return response.json();
  }

  static async createCompanyInspection(companyId: string, data: CreateInspectionRequest): Promise<CompanyInspection> {
    const response = await fetch(`${this.baseUrl}/${companyId}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create company inspection: ${response.statusText}`);
    }
    return response.json();
  }

  static async updateCompanyInspection(companyId: string, inspectionId: string, data: UpdateInspectionRequest): Promise<CompanyInspection> {
    const response = await fetch(`${this.baseUrl}/${companyId}/inspections/${inspectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update company inspection: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteCompanyInspection(companyId: string, inspectionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${companyId}/inspections/${inspectionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete company inspection: ${response.statusText}`);
    }
  }

  static async getScheduledInspections(): Promise<CompanyInspection[]> {
    const response = await fetch(`${this.baseUrl}/inspections/scheduled`);
    if (!response.ok) {
      throw new Error(`Failed to fetch scheduled inspections: ${response.statusText}`);
    }
    return response.json();
  }

  // Управление документами
  static async getCompanyDocuments(companyId: string): Promise<CompanyDocument[]> {
    const response = await fetch(`${this.baseUrl}/${companyId}/documents`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company documents: ${response.statusText}`);
    }
    return response.json();
  }

  static async uploadCompanyDocument(companyId: string, file: File, description?: string): Promise<CompanyDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const response = await fetch(`${this.baseUrl}/${companyId}/documents`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to upload company document: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteCompanyDocument(companyId: string, documentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${companyId}/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete company document: ${response.statusText}`);
    }
  }

  // Дополнительные методы
  static async getCompanyHistory(companyId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/${companyId}/history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch company history: ${response.statusText}`);
    }
    return response.json();
  }

  static async validateCompanyData(data: CreateCompanyRequest): Promise<{ valid: boolean; errors: string[] }> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to validate company data: ${response.statusText}`);
    }
    return response.json();
  }

  static async duplicateCompany(companyId: string, newName: string): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/${companyId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to duplicate company: ${response.statusText}`);
    }
    return response.json();
  }
} 