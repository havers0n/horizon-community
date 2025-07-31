// @ts-nocheck - TODO: Remove after major refactoring is complete
// Patient Entity - API Layer
// REST API для работы с пациентами

import {
  Patient,
  MedicalRecord,
  Diagnosis,
  Treatment,
  EmergencyContact,
  Allergy,
  MedicalCondition,
  Medication,
  Prescription,
  LabResult,
  ImagingResult,
  PatientSearchFilters,
  CreatePatientParams,
  UpdatePatientParams,
  MedicalRecordSearchFilters,
  CreateMedicalRecordParams,
  PatientStatistics,
  PatientExportOptions,
  PatientGender,
  BloodType,
  VisitType,
  DiagnosisSeverity,
  TreatmentType,
  AllergySeverity,
  MedicationRoute,
  LabTestCategory,
  ImagingStudyType
} from '@/shared/types';

export class PatientApi {
  // ============================================================================
  // CRUD ОПЕРАЦИИ ДЛЯ ПАЦИЕНТОВ
  // ============================================================================

  /**
   * Создание нового пациента
   */
  static async createPatient(params: CreatePatientParams): Promise<Patient> {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create patient: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациента по ID
   */
  static async getPatient(id: string): Promise<Patient> {
    const response = await fetch(`/api/patients/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get patient: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациента по ID (алиас для совместимости)
   */
  static async getPatientById(id: string): Promise<Patient> {
    return this.getPatient(id);
  }

  /**
   * Получение списка пациентов (заглушка)
   */
  static async getPatients(filters?: any): Promise<Patient[]> {
    return [];
  }

  /**
   * Получение статистики пациентов (заглушка)
   */
  static async getStatistics(): Promise<any> {
    return {
      total: 0,
      byGender: { male: 0, female: 0, other: 0 },
      byBloodType: {},
      byAgeGroup: {},
      byCity: []
    };
  }

  /**
   * Получение пациента по номеру
   */
  static async getPatientByNumber(number: string): Promise<Patient> {
    const response = await fetch(`/api/patients/number/${number}`);

    if (!response.ok) {
      throw new Error(`Failed to get patient by number: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Обновление пациента
   */
  static async updatePatient(id: string, params: UpdatePatientParams): Promise<Patient> {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to update patient: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Удаление пациента
   */
  static async deletePatient(id: string): Promise<void> {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete patient: ${response.statusText}`);
    }
  }

  // ============================================================================
  // ПОИСК И ФИЛЬТРАЦИЯ ПАЦИЕНТОВ
  // ============================================================================

  /**
   * Основной поиск пациентов
   */
  static async searchPatients(filters: PatientSearchFilters = {}): Promise<{
    patients: Patient[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await fetch(`/api/patients/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов по имени
   */
  static async searchPatientsByName(name: string, limit = 50): Promise<Patient[]> {
    const response = await fetch(`/api/patients/search/name?name=${encodeURIComponent(name)}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to search patients by name: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов по дате рождения
   */
  static async getPatientsByDateOfBirth(dateOfBirth: string): Promise<Patient[]> {
    const response = await fetch(`/api/patients/search/birth?dateOfBirth=${dateOfBirth}`);

    if (!response.ok) {
      throw new Error(`Failed to get patients by date of birth: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов по полу
   */
  static async getPatientsByGender(gender: PatientGender): Promise<Patient[]> {
    const response = await fetch(`/api/patients/search/gender?gender=${gender}`);

    if (!response.ok) {
      throw new Error(`Failed to get patients by gender: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов по группе крови
   */
  static async getPatientsByBloodType(bloodType: BloodType): Promise<Patient[]> {
    const response = await fetch(`/api/patients/search/blood-type?bloodType=${bloodType}`);

    if (!response.ok) {
      throw new Error(`Failed to get patients by blood type: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов по городу
   */
  static async getPatientsByCity(city: string): Promise<Patient[]> {
    const response = await fetch(`/api/patients/search/city?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      throw new Error(`Failed to get patients by city: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов с аллергиями
   */
  static async getPatientsWithAllergies(): Promise<Patient[]> {
    const response = await fetch('/api/patients/search/allergies');

    if (!response.ok) {
      throw new Error(`Failed to get patients with allergies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск пациентов с медицинскими состояниями
   */
  static async getPatientsWithMedicalConditions(): Promise<Patient[]> {
    const response = await fetch('/api/patients/search/medical-conditions');

    if (!response.ok) {
      throw new Error(`Failed to get patients with medical conditions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск активных пациентов
   */
  static async getActivePatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/search/active');

    if (!response.ok) {
      throw new Error(`Failed to get active patients: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // УПРАВЛЕНИЕ МЕДИЦИНСКИМИ ЗАПИСЯМИ
  // ============================================================================

  /**
   * Создание медицинской записи
   */
  static async createMedicalRecord(params: CreateMedicalRecordParams): Promise<MedicalRecord> {
    const response = await fetch('/api/medical-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create medical record: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение медицинской записи по ID
   */
  static async getMedicalRecord(id: string): Promise<MedicalRecord> {
    const response = await fetch(`/api/medical-records/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to get medical record: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение медицинских записей пациента
   */
  static async getPatientMedicalRecords(patientId: string, filters: MedicalRecordSearchFilters = {}): Promise<{
    records: MedicalRecord[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams({ patientId });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/patients/${patientId}/medical-records?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to get patient medical records: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Поиск медицинских записей
   */
  static async searchMedicalRecords(filters: MedicalRecordSearchFilters = {}): Promise<{
    records: MedicalRecord[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/medical-records/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search medical records: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение медицинских записей по типу посещения
   */
  static async getMedicalRecordsByVisitType(visitType: VisitType): Promise<MedicalRecord[]> {
    const response = await fetch(`/api/medical-records/search/visit-type?visitType=${visitType}`);

    if (!response.ok) {
      throw new Error(`Failed to get medical records by visit type: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение медицинских записей по дате
   */
  static async getMedicalRecordsByDate(dateFrom: string, dateTo: string): Promise<MedicalRecord[]> {
    const response = await fetch(`/api/medical-records/search/date?dateFrom=${dateFrom}&dateTo=${dateTo}`);

    if (!response.ok) {
      throw new Error(`Failed to get medical records by date: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // УПРАВЛЕНИЕ КОНТАКТАМИ ДЛЯ ЭКСТРЕННОЙ СВЯЗИ
  // ============================================================================

  /**
   * Добавление контакта для экстренной связи
   */
  static async addEmergencyContact(patientId: string, contact: Omit<EmergencyContact, 'id' | 'patientId' | 'createdAt'>): Promise<EmergencyContact> {
    const response = await fetch(`/api/patients/${patientId}/emergency-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`Failed to add emergency contact: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Обновление контакта для экстренной связи
   */
  static async updateEmergencyContact(patientId: string, contactId: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await fetch(`/api/patients/${patientId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`Failed to update emergency contact: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Удаление контакта для экстренной связи
   */
  static async removeEmergencyContact(patientId: string, contactId: string): Promise<void> {
    const response = await fetch(`/api/patients/${patientId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove emergency contact: ${response.statusText}`);
    }
  }

  // ============================================================================
  // УПРАВЛЕНИЕ АЛЛЕРГИЯМИ
  // ============================================================================

  /**
   * Добавление аллергии
   */
  static async addAllergy(patientId: string, allergy: Omit<Allergy, 'id' | 'patientId' | 'createdAt'>): Promise<Allergy> {
    const response = await fetch(`/api/patients/${patientId}/allergies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allergy),
    });

    if (!response.ok) {
      throw new Error(`Failed to add allergy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Обновление аллергии
   */
  static async updateAllergy(patientId: string, allergyId: string, allergy: Partial<Allergy>): Promise<Allergy> {
    const response = await fetch(`/api/patients/${patientId}/allergies/${allergyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allergy),
    });

    if (!response.ok) {
      throw new Error(`Failed to update allergy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Удаление аллергии
   */
  static async removeAllergy(patientId: string, allergyId: string): Promise<void> {
    const response = await fetch(`/api/patients/${patientId}/allergies/${allergyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove allergy: ${response.statusText}`);
    }
  }

  // ============================================================================
  // УПРАВЛЕНИЕ МЕДИЦИНСКИМИ СОСТОЯНИЯМИ
  // ============================================================================

  /**
   * Добавление медицинского состояния
   */
  static async addMedicalCondition(patientId: string, condition: Omit<MedicalCondition, 'id' | 'patientId' | 'createdAt'>): Promise<MedicalCondition> {
    const response = await fetch(`/api/patients/${patientId}/medical-conditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condition),
    });

    if (!response.ok) {
      throw new Error(`Failed to add medical condition: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Обновление медицинского состояния
   */
  static async updateMedicalCondition(patientId: string, conditionId: string, condition: Partial<MedicalCondition>): Promise<MedicalCondition> {
    const response = await fetch(`/api/patients/${patientId}/medical-conditions/${conditionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condition),
    });

    if (!response.ok) {
      throw new Error(`Failed to update medical condition: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Удаление медицинского состояния
   */
  static async removeMedicalCondition(patientId: string, conditionId: string): Promise<void> {
    const response = await fetch(`/api/patients/${patientId}/medical-conditions/${conditionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove medical condition: ${response.statusText}`);
    }
  }

  // ============================================================================
  // УПРАВЛЕНИЕ ЛЕКАРСТВАМИ
  // ============================================================================

  /**
   * Добавление лекарства
   */
  static async addMedication(patientId: string, medication: Omit<Medication, 'id' | 'patientId' | 'createdAt'>): Promise<Medication> {
    const response = await fetch(`/api/patients/${patientId}/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medication),
    });

    if (!response.ok) {
      throw new Error(`Failed to add medication: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Обновление лекарства
   */
  static async updateMedication(patientId: string, medicationId: string, medication: Partial<Medication>): Promise<Medication> {
    const response = await fetch(`/api/patients/${patientId}/medications/${medicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medication),
    });

    if (!response.ok) {
      throw new Error(`Failed to update medication: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Удаление лекарства
   */
  static async removeMedication(patientId: string, medicationId: string): Promise<void> {
    const response = await fetch(`/api/patients/${patientId}/medications/${medicationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove medication: ${response.statusText}`);
    }
  }

  // ============================================================================
  // СТАТИСТИКА И АНАЛИТИКА
  // ============================================================================

  /**
   * Получение общей статистики пациентов
   */
  static async getPatientStatistics(dateFrom?: string, dateTo?: string): Promise<PatientStatistics> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const response = await fetch(`/api/patients/statistics?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to get patient statistics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Статистика по полу
   */
  static async getStatisticsByGender(): Promise<Record<PatientGender, number>> {
    const response = await fetch('/api/patients/statistics/gender');

    if (!response.ok) {
      throw new Error(`Failed to get statistics by gender: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Статистика по группе крови
   */
  static async getStatisticsByBloodType(): Promise<Record<BloodType, number>> {
    const response = await fetch('/api/patients/statistics/blood-type');

    if (!response.ok) {
      throw new Error(`Failed to get statistics by blood type: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Статистика по возрасту
   */
  static async getStatisticsByAgeGroup(): Promise<{
    '0-17': number;
    '18-30': number;
    '31-50': number;
    '51-70': number;
    '70+': number;
  }> {
    const response = await fetch('/api/patients/statistics/age-group');

    if (!response.ok) {
      throw new Error(`Failed to get statistics by age group: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Статистика по городам
   */
  static async getStatisticsByCity(): Promise<Array<{
    city: string;
    count: number;
  }>> {
    const response = await fetch('/api/patients/statistics/city');

    if (!response.ok) {
      throw new Error(`Failed to get statistics by city: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // ЭКСПОРТ ДАННЫХ
  // ============================================================================

  /**
   * Экспорт пациентов
   */
  static async exportPatients(options: PatientExportOptions): Promise<Blob> {
    const response = await fetch('/api/patients/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Failed to export patients: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Экспорт в CSV
   */
  static async exportToCSV(filters?: PatientSearchFilters): Promise<Blob> {
    const response = await fetch('/api/patients/export/csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export to CSV: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Экспорт в JSON
   */
  static async exportToJSON(filters?: PatientSearchFilters): Promise<Blob> {
    const response = await fetch('/api/patients/export/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export to JSON: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Экспорт в PDF
   */
  static async exportToPDF(patientId: string): Promise<Blob> {
    const response = await fetch(`/api/patients/${patientId}/export/pdf`);

    if (!response.ok) {
      throw new Error(`Failed to export to PDF: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Экспорт в Excel
   */
  static async exportToExcel(filters?: PatientSearchFilters): Promise<Blob> {
    const response = await fetch('/api/patients/export/excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters }),
    });

    if (!response.ok) {
      throw new Error(`Failed to export to Excel: ${response.statusText}`);
    }

    return response.blob();
  }

  // ============================================================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================================

  /**
   * Получение пациентов за сегодня
   */
  static async getTodayPatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/today');

    if (!response.ok) {
      throw new Error(`Failed to get today patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациентов за последние 24 часа
   */
  static async getLast24HoursPatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/last-24-hours');

    if (!response.ok) {
      throw new Error(`Failed to get last 24 hours patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациентов за текущую неделю
   */
  static async getThisWeekPatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/this-week');

    if (!response.ok) {
      throw new Error(`Failed to get this week patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациентов за текущий месяц
   */
  static async getThisMonthPatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/this-month');

    if (!response.ok) {
      throw new Error(`Failed to get this month patients: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Получение пациентов с критическими состояниями
   */
  static async getCriticalPatients(): Promise<Patient[]> {
    const response = await fetch('/api/patients/critical');

    if (!response.ok) {
      throw new Error(`Failed to get critical patients: ${response.statusText}`);
    }

    return response.json();
  }
} 