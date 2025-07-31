// @ts-nocheck - TODO: Remove after major refactoring is complete
export interface EmsPersonnel {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  badgeNumber: string;
  rank: EmsRank;
  department: string;
  unitId?: string;
  qualifications: EmsQualification[];
  certifications: EmsCertification[];
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  employmentInfo: {
    hireDate: string;
    status: 'active' | 'inactive' | 'suspended' | 'terminated';
    position: string;
    supervisor?: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  training: EmsTraining[];
  performance: EmsPerformance[];
  createdAt: string;
  updatedAt: string;
}

export type EmsRank = 
  | 'paramedic' 
  | 'emt_basic' 
  | 'emt_intermediate' 
  | 'emt_advanced' 
  | 'firefighter' 
  | 'firefighter_ii' 
  | 'engineer' 
  | 'lieutenant' 
  | 'captain' 
  | 'battalion_chief' 
  | 'deputy_chief' 
  | 'chief';

export interface EmsQualification {
  id: string;
  name: string;
  type: 'medical' | 'fire' | 'rescue' | 'hazmat' | 'other';
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  description?: string;
}

export interface EmsCertification {
  id: string;
  name: string;
  type: 'medical' | 'fire' | 'rescue' | 'hazmat' | 'other';
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  description?: string;
  renewalRequirements?: string;
}

export interface EmsTraining {
  id: string;
  name: string;
  type: 'mandatory' | 'elective' | 'specialized';
  startDate: string;
  endDate?: string;
  instructor: string;
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  score?: number;
  description?: string;
  hours: number;
}

export interface EmsPerformance {
  id: string;
  evaluationDate: string;
  evaluator: string;
  period: string;
  overallRating: number;
  categories: {
    medicalSkills: number;
    firefightingSkills: number;
    teamwork: number;
    communication: number;
    leadership: number;
    safety: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments?: string;
}

export interface CreateEmsPersonnelRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  badgeNumber: string;
  rank: EmsRank;
  department: string;
  unitId?: string;
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  employmentInfo: {
    hireDate: string;
    position: string;
    supervisor?: string;
  };
}

export interface UpdateEmsPersonnelRequest extends Partial<CreateEmsPersonnelRequest> {
  id: string;
  employmentInfo?: {
    status?: 'active' | 'inactive' | 'suspended' | 'terminated';
    position?: string;
    supervisor?: string;
  };
}

export interface EmsPersonnelSearchParams {
  query?: string;
  rank?: EmsRank;
  department?: string;
  unitId?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'terminated';
  qualificationType?: string;
  certificationType?: string;
  limit?: number;
  offset?: number;
}

export interface EmsPersonnelSearchResult {
  personnel: EmsPersonnel[];
  total: number;
  hasMore: boolean;
}

export interface EmsPersonnelStats {
  total: number;
  byRank: Record<EmsRank, number>;
  byDepartment: Record<string, number>;
  byStatus: Record<string, number>;
  activePersonnel: number;
  newHiresThisMonth: number;
  certificationsExpiringSoon: number;
  averagePerformanceRating: number;
} 