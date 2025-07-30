// Patient Entity - Model Layer
// Типы данных для работы с пациентами

// ============================================================================
// ОСНОВНЫЕ СУЩНОСТИ
// ============================================================================

export interface Patient {
  id: string;
  number: string; // Номер пациента
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // ISO date
  gender: PatientGender;
  bloodType?: BloodType;
  height?: number; // см
  weight?: number; // кг
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContacts: EmergencyContact[];
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  insurance?: InsuranceInfo;
  primaryCarePhysician?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  recordNumber: string;
  visitDate: string;
  visitType: VisitType;
  symptoms: string[];
  vitalSigns: VitalSigns;
  diagnosis?: Diagnosis[];
  treatments: Treatment[];
  prescriptions: Prescription[];
  labResults: LabResult[];
  imagingResults: ImagingResult[];
  notes: string;
  attendingPhysician: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagnosis {
  id: string;
  medicalRecordId: string;
  icd10Code: string;
  icd10Description: string;
  diagnosis: string;
  severity: DiagnosisSeverity;
  isPrimary: boolean;
  isConfirmed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  medicalRecordId: string;
  treatmentType: TreatmentType;
  description: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ СУЩНОСТИ
// ============================================================================

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface MedicalCondition {
  id: string;
  patientId: string;
  condition: string;
  diagnosisDate?: string;
  isActive: boolean;
  isControlled: boolean;
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  prescribedBy: string;
  notes?: string;
  createdAt: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: string;
  expirationDate?: string;
  copay?: number;
  deductible?: number;
  notes?: string;
}

export interface VitalSigns {
  temperature?: number; // °C
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number; // bpm
  respiratoryRate?: number; // breaths/min
  oxygenSaturation?: number; // %
  height?: number; // см
  weight?: number; // кг
  bmi?: number;
  painLevel?: number; // 0-10
  notes?: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  quantity: number;
  refills: number;
  instructions: string;
  prescribedBy: string;
  prescribedAt: string;
  expiresAt: string;
  isFilled: boolean;
  filledAt?: string;
  notes?: string;
}

export interface LabResult {
  id: string;
  medicalRecordId: string;
  testName: string;
  testCategory: LabTestCategory;
  result: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  performedAt: string;
  reportedAt: string;
  notes?: string;
}

export interface ImagingResult {
  id: string;
  medicalRecordId: string;
  studyType: ImagingStudyType;
  bodyPart: string;
  findings: string;
  impression: string;
  performedAt: string;
  reportedAt: string;
  radiologist: string;
  images?: string[]; // URLs to images
  notes?: string;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum PatientGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum VisitType {
  EMERGENCY = 'emergency',
  URGENT_CARE = 'urgent_care',
  ROUTINE_CHECKUP = 'routine_checkup',
  FOLLOW_UP = 'follow_up',
  SPECIALIST_CONSULTATION = 'specialist_consultation',
  SURGERY = 'surgery',
  LABORATORY = 'laboratory',
  IMAGING = 'imaging',
  PHARMACY = 'pharmacy',
  OTHER = 'other'
}

export enum DiagnosisSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

export enum TreatmentType {
  MEDICATION = 'medication',
  SURGERY = 'surgery',
  PHYSICAL_THERAPY = 'physical_therapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  SPEECH_THERAPY = 'speech_therapy',
  PSYCHOTHERAPY = 'psychotherapy',
  RADIATION_THERAPY = 'radiation_therapy',
  CHEMOTHERAPY = 'chemotherapy',
  IMMUNOTHERAPY = 'immunotherapy',
  DIALYSIS = 'dialysis',
  RESPIRATORY_THERAPY = 'respiratory_therapy',
  WOUND_CARE = 'wound_care',
  OTHER = 'other'
}

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening'
}

export enum MedicationRoute {
  ORAL = 'oral',
  INTRAVENOUS = 'intravenous',
  INTRAMUSCULAR = 'intramuscular',
  SUBCUTANEOUS = 'subcutaneous',
  TOPICAL = 'topical',
  INHALATION = 'inhalation',
  RECTAL = 'rectal',
  NASAL = 'nasal',
  OPHTHALMIC = 'ophthalmic',
  OTIC = 'otic',
  OTHER = 'other'
}

export enum LabTestCategory {
  BLOOD_CHEMISTRY = 'blood_chemistry',
  HEMATOLOGY = 'hematology',
  MICROBIOLOGY = 'microbiology',
  IMMUNOLOGY = 'immunology',
  TOXICOLOGY = 'toxicology',
  GENETICS = 'genetics',
  URINALYSIS = 'urinalysis',
  STOOL_ANALYSIS = 'stool_analysis',
  OTHER = 'other'
}

export enum ImagingStudyType {
  X_RAY = 'x_ray',
  CT_SCAN = 'ct_scan',
  MRI = 'mri',
  ULTRASOUND = 'ultrasound',
  NUCLEAR_MEDICINE = 'nuclear_medicine',
  FLUOROSCOPY = 'fluoroscopy',
  MAMMOGRAM = 'mammogram',
  BONE_DENSITY = 'bone_density',
  ANGIOGRAM = 'angiogram',
  OTHER = 'other'
}

// ============================================================================
// API ТИПЫ
// ============================================================================

export interface PatientSearchFilters {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  bloodType?: BloodType;
  city?: string;
  state?: string;
  zipCode?: string;
  hasAllergies?: boolean;
  hasMedicalConditions?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'firstName' | 'lastName' | 'dateOfBirth' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePatientParams {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: PatientGender;
  bloodType?: BloodType;
  height?: number;
  weight?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContacts?: Omit<EmergencyContact, 'id' | 'patientId' | 'createdAt'>[];
  allergies?: Omit<Allergy, 'id' | 'patientId' | 'createdAt'>[];
  medicalConditions?: Omit<MedicalCondition, 'id' | 'patientId' | 'createdAt'>[];
  medications?: Omit<Medication, 'id' | 'patientId' | 'createdAt'>[];
  insurance?: InsuranceInfo;
  primaryCarePhysician?: string;
  notes?: string;
}

export interface UpdatePatientParams {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  bloodType?: BloodType;
  height?: number;
  weight?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insurance?: InsuranceInfo;
  primaryCarePhysician?: string;
  isActive?: boolean;
  notes?: string;
}

export interface MedicalRecordSearchFilters {
  patientId?: string;
  visitType?: VisitType;
  visitDateFrom?: string;
  visitDateTo?: string;
  department?: string;
  attendingPhysician?: string;
  hasDiagnosis?: boolean;
  hasTreatments?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'visitDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMedicalRecordParams {
  patientId: string;
  visitType: VisitType;
  symptoms: string[];
  vitalSigns: VitalSigns;
  diagnosis?: Omit<Diagnosis, 'id' | 'medicalRecordId' | 'createdAt'>[];
  treatments: Omit<Treatment, 'id' | 'medicalRecordId' | 'createdAt'>[];
  prescriptions?: Omit<Prescription, 'id' | 'medicalRecordId' | 'createdAt'>[];
  labResults?: Omit<LabResult, 'id' | 'medicalRecordId' | 'createdAt'>[];
  imagingResults?: Omit<ImagingResult, 'id' | 'medicalRecordId' | 'createdAt'>[];
  notes: string;
  attendingPhysician: string;
  department: string;
}

export interface PatientStatistics {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  patientsByGender: Record<PatientGender, number>;
  patientsByBloodType: Record<BloodType, number>;
  patientsByAgeGroup: {
    '0-17': number;
    '18-30': number;
    '31-50': number;
    '51-70': number;
    '70+': number;
  };
  patientsWithAllergies: number;
  patientsWithMedicalConditions: number;
  averageAge: number;
  topMedicalConditions: Array<{
    condition: string;
    count: number;
  }>;
  topAllergies: Array<{
    allergen: string;
    count: number;
  }>;
}

export interface PatientExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  includeMedicalRecords?: boolean;
  includeAllergies?: boolean;
  includeMedications?: boolean;
  includeEmergencyContacts?: boolean;
  dateFrom?: string;
  dateTo?: string;
  filters?: PatientSearchFilters;
} 