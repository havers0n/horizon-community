// Типы данных для Incident Entity
// Основные сущности и интерфейсы для работы с инцидентами

// Основная сущность инцидента
export interface Incident {
  id: string;
  incidentNumber: string;
  type: IncidentType;
  status: IncidentStatus;
  priority: IncidentPriority;
  severity: IncidentSeverity;
  
  // Основная информация
  title: string;
  description: string;
  location: IncidentLocation;
  reportedAt: string;
  updatedAt: string;
  
  // Участники
  reporter: IncidentReporter;
  assignedUnits: IncidentUnit[];
  involvedCitizens: IncidentCitizen[];
  involvedVehicles: IncidentVehicle[];
  
  // Детали
  category: IncidentCategory;
  subcategory?: string;
  tags: string[];
  
  // Временные рамки
  estimatedDuration?: number; // в минутах
  actualDuration?: number; // в минутах
  resolvedAt?: string;
  
  // Дополнительная информация
  weatherConditions?: WeatherConditions;
  trafficConditions?: TrafficConditions;
  notes: string[];
  
  // Медиа
  photos: string[];
  videos: string[];
  documents: string[];
  
  // Статистика
  responseTime?: number; // время отклика в минутах
  resolutionTime?: number; // время решения в минутах
}

// Типы инцидентов
export enum IncidentType {
  CRIMINAL = 'criminal',
  TRAFFIC = 'traffic',
  MEDICAL = 'medical',
  FIRE = 'fire',
  NATURAL_DISASTER = 'natural_disaster',
  PUBLIC_DISTURBANCE = 'public_disturbance',
  DOMESTIC = 'domestic',
  ACCIDENT = 'accident',
  OTHER = 'other'
}

// Статусы инцидентов
export enum IncidentStatus {
  REPORTED = 'reported',
  DISPATCHED = 'dispatched',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

// Приоритеты инцидентов
export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Уровни серьезности
export enum IncidentSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  SEVERE = 'severe',
  CATASTROPHIC = 'catastrophic'
}

// Категории инцидентов
export enum IncidentCategory {
  VIOLENCE = 'violence',
  THEFT = 'theft',
  VANDALISM = 'vandalism',
  DRUGS = 'drugs',
  TRAFFIC_VIOLATION = 'traffic_violation',
  ACCIDENT = 'accident',
  MEDICAL_EMERGENCY = 'medical_emergency',
  FIRE = 'fire',
  NATURAL_DISASTER = 'natural_disaster',
  PUBLIC_DISTURBANCE = 'public_disturbance',
  DOMESTIC_VIOLENCE = 'domestic_violence',
  OTHER = 'other'
}

// Локация инцидента
export interface IncidentLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  landmarks?: string[];
  buildingInfo?: {
    name?: string;
    floor?: number;
    room?: string;
    accessNotes?: string;
  };
}

// Информация о заявителе
export interface IncidentReporter {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  isAnonymous: boolean;
  relationshipToIncident?: string;
}

// Участвующие подразделения
export interface IncidentUnit {
  id: string;
  unitNumber: string;
  unitType: UnitType;
  department: Department;
  assignedAt: string;
  arrivedAt?: string;
  leftAt?: string;
  status: UnitStatus;
  notes?: string;
}

// Типы подразделений
export enum UnitType {
  PATROL = 'patrol',
  DETECTIVE = 'detective',
  SWAT = 'swat',
  K9 = 'k9',
  TRAFFIC = 'traffic',
  EMS = 'ems',
  FIRE = 'fire',
  BOMB_SQUAD = 'bomb_squad',
  AIR_SUPPORT = 'air_support',
  OTHER = 'other'
}

// Департаменты
export enum Department {
  POLICE = 'police',
  FIRE = 'fire',
  EMS = 'ems',
  SHERIFF = 'sheriff',
  STATE_TROOPER = 'state_trooper',
  FEDERAL = 'federal',
  OTHER = 'other'
}

// Статусы подразделений
export enum UnitStatus {
  DISPATCHED = 'dispatched',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  CLEARED = 'cleared',
  UNAVAILABLE = 'unavailable'
}

// Участвующие граждане
export interface IncidentCitizen {
  citizenId: string;
  role: CitizenRole;
  involvement: string;
  injuries?: Injury[];
  arrested?: boolean;
  charges?: string[];
  notes?: string;
}

// Роли граждан в инциденте
export enum CitizenRole {
  VICTIM = 'victim',
  SUSPECT = 'suspect',
  WITNESS = 'witness',
  REPORTING_PARTY = 'reporting_party',
  INVOLVED = 'involved',
  OTHER = 'other'
}

// Травмы
export interface Injury {
  type: InjuryType;
  severity: InjurySeverity;
  location: string;
  description: string;
  treatedAt?: string;
  hospital?: string;
}

// Типы травм
export enum InjuryType {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  FATAL = 'fatal',
  NONE = 'none'
}

// Серьезность травм
export enum InjurySeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

// Участвующие транспортные средства
export interface IncidentVehicle {
  vehicleId: string;
  role: VehicleRole;
  damage?: VehicleDamage[];
  towed?: boolean;
  impounded?: boolean;
  notes?: string;
}

// Роли транспортных средств
export enum VehicleRole {
  INVOLVED = 'involved',
  SUSPECT_VEHICLE = 'suspect_vehicle',
  VICTIM_VEHICLE = 'victim_vehicle',
  WITNESS_VEHICLE = 'witness_vehicle',
  EMERGENCY_VEHICLE = 'emergency_vehicle',
  OTHER = 'other'
}

// Повреждения транспортных средств
export interface VehicleDamage {
  area: string;
  severity: DamageSeverity;
  description: string;
  estimatedCost?: number;
}

// Серьезность повреждений
export enum DamageSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  TOTALED = 'totaled'
}

// Погодные условия
export interface WeatherConditions {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  precipitation?: string;
  visibility?: number;
  conditions: string;
}

// Дорожные условия
export interface TrafficConditions {
  trafficLevel: TrafficLevel;
  roadConditions: string;
  construction?: boolean;
  specialEvents?: boolean;
  notes?: string;
}

// Уровни трафика
export enum TrafficLevel {
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
  CONGESTED = 'congested',
  STANDSTILL = 'standstill'
}

// Заметки об инциденте
export interface IncidentNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  type: NoteType;
  isPrivate: boolean;
}

// Типы заметок
export enum NoteType {
  GENERAL = 'general',
  INVESTIGATION = 'investigation',
  MEDICAL = 'medical',
  LEGAL = 'legal',
  ADMINISTRATIVE = 'administrative',
  OTHER = 'other'
}

// Фильтры для поиска инцидентов
export interface IncidentSearchFilters {
  // Основные фильтры
  type?: IncidentType[];
  status?: IncidentStatus[];
  priority?: IncidentPriority[];
  severity?: IncidentSeverity[];
  category?: IncidentCategory[];
  
  // Временные фильтры
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  
  // Локация
  city?: string;
  zipCode?: string;
  radius?: number; // радиус поиска в км
  
  // Участники
  assignedUnit?: string;
  department?: Department[];
  involvedCitizen?: string;
  involvedVehicle?: string;
  
  // Дополнительные фильтры
  tags?: string[];
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hasDocuments?: boolean;
  
  // Пагинация
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Параметры для создания инцидента
export interface CreateIncidentParams {
  type: IncidentType;
  priority: IncidentPriority;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: IncidentLocation;
  category: IncidentCategory;
  subcategory?: string;
  tags?: string[];
  reporter: IncidentReporter;
  estimatedDuration?: number;
  weatherConditions?: WeatherConditions;
  trafficConditions?: TrafficConditions;
}

// Параметры для обновления инцидента
export interface UpdateIncidentParams {
  type?: IncidentType;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  severity?: IncidentSeverity;
  title?: string;
  description?: string;
  location?: IncidentLocation;
  category?: IncidentCategory;
  subcategory?: string;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  resolvedAt?: string;
  weatherConditions?: WeatherConditions;
  trafficConditions?: TrafficConditions;
  notes?: string[];
}

// Статистика инцидентов
export interface IncidentStatistics {
  total: number;
  byType: Record<IncidentType, number>;
  byStatus: Record<IncidentStatus, number>;
  byPriority: Record<IncidentPriority, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byCategory: Record<IncidentCategory, number>;
  byDepartment: Record<Department, number>;
  
  // Временная статистика
  averageResponseTime: number;
  averageResolutionTime: number;
  incidentsByHour: Record<number, number>;
  incidentsByDay: Record<string, number>;
  incidentsByMonth: Record<string, number>;
  
  // Географическая статистика
  incidentsByCity: Record<string, number>;
  incidentsByZipCode: Record<string, number>;
  
  // Тренды
  trendData: {
    date: string;
    count: number;
    averageResponseTime: number;
    averageResolutionTime: number;
  }[];
}

// Результат поиска инцидентов
export interface IncidentSearchResult {
  incidents: Incident[];
  total: number;
  statistics: IncidentStatistics;
  filters: IncidentSearchFilters;
}

// Экспорт данных
export interface IncidentExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  filters?: IncidentSearchFilters;
  includeDetails?: boolean;
  includeMedia?: boolean;
  includeNotes?: boolean;
}

// API ответы
export interface IncidentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Типы для CRUD операций
export type CreateIncidentResponse = IncidentApiResponse<Incident>;
export type UpdateIncidentResponse = IncidentApiResponse<Incident>;
export type DeleteIncidentResponse = IncidentApiResponse<{ deleted: boolean }>;
export type GetIncidentResponse = IncidentApiResponse<Incident>;
export type SearchIncidentsResponse = IncidentApiResponse<IncidentSearchResult>;
export type GetIncidentStatisticsResponse = IncidentApiResponse<IncidentStatistics>;
export type ExportIncidentsResponse = IncidentApiResponse<{ downloadUrl: string }>; 