// Типы данных для сущности Company

export interface Company {
  id: string;
  name: string;
  legalName: string;
  type: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'government';
  industry: 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'construction' | 'transportation' | 'education' | 'other';
  registrationNumber: string;
  taxId: string;
  foundedDate: string;
  status: 'active' | 'inactive' | 'suspended' | 'dissolved' | 'pending';
  
  // Контактная информация
  contact: {
    email: string;
    phone: string;
    website?: string;
    fax?: string;
  };
  
  // Адрес
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Руководство
  leadership: {
    ceo: {
      name: string;
      title: string;
      email: string;
      phone: string;
    };
    boardMembers: BoardMember[];
  };
  
  // Финансовая информация
  financial: {
    annualRevenue?: number;
    employeeCount: number;
    marketCap?: number;
    fiscalYearEnd: string;
  };
  
  // Лицензии и разрешения
  licenses: CompanyLicense[];
  
  // Нарушения и штрафы
  violations: CompanyViolation[];
  
  // Инспекции
  inspections: CompanyInspection[];
  
  // Документы
  documents: CompanyDocument[];
  
  // Примечания
  notes?: string;
  
  // Метаданные
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  appointmentDate: string;
  termEndDate?: string;
  isActive: boolean;
}

export interface CompanyLicense {
  id: string;
  type: 'business' | 'professional' | 'operating' | 'special' | 'other';
  number: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked' | 'pending';
  description: string;
  restrictions?: string;
  renewalRequirements?: string;
}

export interface CompanyViolation {
  id: string;
  type: 'regulatory' | 'safety' | 'environmental' | 'financial' | 'operational' | 'other';
  date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  fine: number;
  status: 'pending' | 'paid' | 'disputed' | 'dismissed' | 'appealed';
  inspectorId: string;
  inspectorName: string;
  resolutionDate?: string;
  correctiveActions?: string;
}

export interface CompanyInspection {
  id: string;
  type: 'routine' | 'complaint' | 'follow_up' | 'emergency' | 'scheduled';
  date: string;
  inspectorId: string;
  inspectorName: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result: 'pass' | 'fail' | 'conditional' | 'pending';
  findings: string;
  recommendations?: string;
  nextInspectionDate?: string;
  violations?: string[];
}

export interface CompanyDocument {
  id: string;
  name: string;
  type: 'registration' | 'license' | 'permit' | 'contract' | 'report' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
  expiryDate?: string;
  isPublic: boolean;
}

// Типы для создания и обновления
export interface CreateCompanyRequest {
  name: string;
  legalName: string;
  type: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'government';
  industry: 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'construction' | 'transportation' | 'education' | 'other';
  registrationNumber: string;
  taxId: string;
  foundedDate: string;
  contact: {
    email: string;
    phone: string;
    website?: string;
    fax?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  leadership: {
    ceo: {
      name: string;
      title: string;
      email: string;
      phone: string;
    };
  };
  financial: {
    employeeCount: number;
    fiscalYearEnd: string;
    annualRevenue?: number;
    marketCap?: number;
  };
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  status?: 'active' | 'inactive' | 'suspended' | 'dissolved' | 'pending';
  notes?: string;
}

// Типы для поиска и фильтрации
export interface CompanySearchParams {
  query?: string;
  type?: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'government';
  industry?: 'technology' | 'healthcare' | 'finance' | 'retail' | 'manufacturing' | 'construction' | 'transportation' | 'education' | 'other';
  status?: 'active' | 'inactive' | 'suspended' | 'dissolved' | 'pending';
  city?: string;
  state?: string;
  employeeCountMin?: number;
  employeeCountMax?: number;
  foundedYearMin?: number;
  foundedYearMax?: number;
  limit?: number;
  offset?: number;
}

export interface CompanySearchResult {
  companies: Company[];
  total: number;
  hasMore: boolean;
}

// Типы для экспорта и статистики
export interface CompanyExportData {
  companies: Company[];
  exportDate: string;
  exportedBy: string;
  filters?: CompanySearchParams;
}

export interface CompanyStats {
  total: number;
  byType: Record<string, number>;
  byIndustry: Record<string, number>;
  byStatus: Record<string, number>;
  byCity: Record<string, number>;
  byState: Record<string, number>;
  averageEmployeeCount: number;
  totalRevenue: number;
  activeLicenses: number;
  pendingViolations: number;
}

// Типы для управления лицензиями
export interface CreateLicenseRequest {
  type: 'business' | 'professional' | 'operating' | 'special' | 'other';
  number: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  description: string;
  restrictions?: string;
  renewalRequirements?: string;
}

export interface UpdateLicenseRequest extends Partial<CreateLicenseRequest> {
  status?: 'active' | 'expired' | 'suspended' | 'revoked' | 'pending';
}

// Типы для управления нарушениями
export interface CreateViolationRequest {
  type: 'regulatory' | 'safety' | 'environmental' | 'financial' | 'operational' | 'other';
  date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  fine: number;
  inspectorId: string;
  inspectorName: string;
  correctiveActions?: string;
}

export interface UpdateViolationRequest extends Partial<CreateViolationRequest> {
  status?: 'pending' | 'paid' | 'disputed' | 'dismissed' | 'appealed';
  resolutionDate?: string;
}

// Типы для управления инспекциями
export interface CreateInspectionRequest {
  type: 'routine' | 'complaint' | 'follow_up' | 'emergency' | 'scheduled';
  date: string;
  inspectorId: string;
  inspectorName: string;
  findings?: string;
  recommendations?: string;
  nextInspectionDate?: string;
}

export interface UpdateInspectionRequest extends Partial<CreateInspectionRequest> {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result?: 'pass' | 'fail' | 'conditional' | 'pending';
  violations?: string[];
} 