// @ts-nocheck - TODO: Remove after major refactoring is complete
import { EmsUnit, EmsCall, EmsReport, EmsShiftLog, UnitStatus, UnitStatuses } from '@/shared/types';

// Моковые данные для демонстрации
const MOCK_EMS_UNITS: EmsUnit[] = [
  {
    id: 'unit_1',
    name: 'EMS-1',
    unitType: 'ambulance',
    status: UnitStatuses.AVAILABLE,
    crew: [
      { id: 'crew_1', name: 'Джон Смит', rank: 'Парамедик', qualifications: ['EMT-P', 'ACLS'], isDriver: true, isCommander: false },
      { id: 'crew_2', name: 'Сара Джонсон', rank: 'Фельдшер', qualifications: ['EMT-B', 'PALS'], isDriver: false, isCommander: true }
    ],
    equipment: ['Дефибриллятор', 'Кислород', 'Медикаменты', 'Шины'],
    location: 'Станция EMS-1'
  },
  {
    id: 'unit_2',
    name: 'FD-1',
    unitType: 'fire_engine',
    status: UnitStatuses.AVAILABLE,
    crew: [
      { id: 'crew_3', name: 'Майк Браун', rank: 'Капитан', qualifications: ['Firefighter', 'Hazmat'], isDriver: true, isCommander: true },
      { id: 'crew_4', name: 'Лиза Дэвис', rank: 'Лейтенант', qualifications: ['Firefighter', 'Rescue'], isDriver: false, isCommander: false }
    ],
    equipment: ['Пожарные рукава', 'Дыхательные аппараты', 'Аварийно-спасательный инструмент'],
    location: 'Пожарная станция №1'
  }
];

const MOCK_EMS_CALLS: EmsCall[] = [
  {
    id: 'call_1',
    type: 'medical_emergency',
    priority: 'high',
    caller: 'Мэри Уилсон',
    location: 'ул. Мэйн, 123',
    description: 'Пациент жалуется на боль в груди',
    timestamp: '2024-01-15T10:30:00Z',
    assignedUnits: ['unit_1'],
    status: 'en_route',
    patientInfo: {
      name: 'Роберт Уилсон',
      age: 65,
      condition: 'Боль в груди',
      vitalSigns: {
        heartRate: 95,
        bloodPressure: '140/90',
        temperature: 37.2,
        oxygenSaturation: 98
      }
    }
  },
  {
    id: 'call_2',
    type: 'structure_fire',
    priority: 'critical',
    caller: 'Диспетчер 911',
    location: 'ул. Оук, 456',
    description: 'Пожар в жилом доме',
    timestamp: '2024-01-15T11:15:00Z',
    assignedUnits: ['unit_2'],
    status: 'on_scene'
  }
];

export class EmsApi {
  // Получение всех EMS юнитов
  static async getUnits(): Promise<EmsUnit[]> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_EMS_UNITS;
  }

  // Получение юнита по ID
  static async getUnit(id: string): Promise<EmsUnit | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_EMS_UNITS.find(unit => unit.id === id) || null;
  }

  // Обновление статуса юнита
  static async updateUnitStatus(unitId: string, status: UnitStatus): Promise<EmsUnit> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const unit = MOCK_EMS_UNITS.find(u => u.id === unitId);
    if (!unit) {
      throw new Error('Unit not found');
    }
    unit.status = status;
    return unit;
  }

  // Получение активных вызовов
  static async getActiveCalls(): Promise<EmsCall[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_EMS_CALLS.filter(call => 
      ['pending', 'en_route', 'on_scene', 'transporting'].includes(call.status)
    );
  }

  // Получение всех вызовов
  static async getAllCalls(): Promise<EmsCall[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_EMS_CALLS;
  }

  // Получение вызова по ID
  static async getCall(id: string): Promise<EmsCall | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_EMS_CALLS.find(call => call.id === id) || null;
  }

  // Создание нового отчета
  static async createReport(report: Omit<EmsReport, 'id'>): Promise<EmsReport> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newReport: EmsReport = {
      ...report,
      id: `report_${Date.now()}`
    };
    return newReport;
  }

  // Получение отчетов
  static async getReports(): Promise<EmsReport[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }

  // Получение журнала смен
  static async getShiftLogs(): Promise<EmsShiftLog[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [];
  }

  // Создание записи в журнале смен
  static async createShiftLog(log: Omit<EmsShiftLog, 'id'>): Promise<EmsShiftLog> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newLog: EmsShiftLog = {
      ...log,
      id: `shift_${Date.now()}`
    };
    return newLog;
  }
} 