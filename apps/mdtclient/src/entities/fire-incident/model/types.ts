// Fire Incident Entity - Model Layer
// Типы данных для пожарных инцидентов

// ============================================================================
// ENUMS - Перечисления
// ============================================================================

export enum FireIncidentType {
  STRUCTURE_FIRE = 'structure_fire',           // Пожар в здании
  VEHICLE_FIRE = 'vehicle_fire',               // Пожар транспортного средства
  WILDLAND_FIRE = 'wildland_fire',             // Лесной пожар
  GRASS_FIRE = 'grass_fire',                   // Пожар травы
  ELECTRICAL_FIRE = 'electrical_fire',         // Электрический пожар
  CHEMICAL_FIRE = 'chemical_fire',             // Химический пожар
  EXPLOSION = 'explosion',                     // Взрыв
  GAS_LEAK = 'gas_leak',                       // Утечка газа
  HAZMAT = 'hazmat',                          // Опасные материалы
  RESCUE = 'rescue',                          // Спасательная операция
  FALSE_ALARM = 'false_alarm',                // Ложная тревога
  OTHER = 'other'                             // Другое
}

export enum FireIncidentStatus {
  REPORTED = 'reported',                      // Заявлен
  DISPATCHED = 'dispatched',                  // Отправлен
  EN_ROUTE = 'en_route',                      // В пути
  ON_SCENE = 'on_scene',                      // На месте
  IN_PROGRESS = 'in_progress',                // В работе
  UNDER_CONTROL = 'under_control',            // Под контролем
  EXTINGUISHED = 'extinguished',              // Потух
  CLEANUP = 'cleanup',                        // Уборка
  CLOSED = 'closed',                          // Закрыт
  CANCELLED = 'cancelled'                     // Отменен
}

export enum FireIncidentPriority {
  LOW = 'low',                                // Низкий
  MEDIUM = 'medium',                          // Средний
  HIGH = 'high',                              // Высокий
  CRITICAL = 'critical',                      // Критический
  EMERGENCY = 'emergency'                     // Экстренный
}

export enum FireIncidentSeverity {
  MINOR = 'minor',                            // Незначительный
  MODERATE = 'moderate',                      // Умеренный
  SERIOUS = 'serious',                        // Серьезный
  SEVERE = 'severe',                          // Тяжелый
  CATASTROPHIC = 'catastrophic'               // Катастрофический
}

export enum FireIncidentCategory {
  RESIDENTIAL = 'residential',                // Жилой дом
  COMMERCIAL = 'commercial',                  // Коммерческое здание
  INDUSTRIAL = 'industrial',                  // Промышленное здание
  VEHICLE = 'vehicle',                        // Транспортное средство
  WILDLAND = 'wildland',                      // Дикая природа
  ELECTRICAL = 'electrical',                  // Электрическое оборудование
  CHEMICAL = 'chemical',                      // Химические вещества
  EXPLOSIVE = 'explosive',                    // Взрывчатые вещества
  GAS = 'gas',                                // Газ
  OTHER = 'other'                             // Другое
}

export enum FireUnitType {
  ENGINE = 'engine',                          // Пожарная машина
  LADDER = 'ladder',                          // Лестница
  RESCUE = 'rescue',                          // Спасательная машина
  HAZMAT = 'hazmat',                          // Опасные материалы
  WATER_TENDER = 'water_tender',              // Водовоз
  COMMAND = 'command',                        // Командная машина
  MEDICAL = 'medical',                        // Медицинская машина
  AIR_SUPPORT = 'air_support',                // Воздушная поддержка
  OTHER = 'other'                             // Другое
}

export enum FireUnitStatus {
  AVAILABLE = 'available',                    // Доступен
  DISPATCHED = 'dispatched',                  // Отправлен
  EN_ROUTE = 'en_route',                      // В пути
  ON_SCENE = 'on_scene',                      // На месте
  IN_PROGRESS = 'in_progress',                // В работе
  RETURNING = 'returning',                    // Возвращается
  OUT_OF_SERVICE = 'out_of_service',          // Вне службы
  MAINTENANCE = 'maintenance'                 // Техобслуживание
}

export enum WeatherCondition {
  CLEAR = 'clear',                            // Ясно
  CLOUDY = 'cloudy',                          // Облачно
  RAIN = 'rain',                              // Дождь
  SNOW = 'snow',                              // Снег
  FOG = 'fog',                                // Туман
  WINDY = 'windy',                            // Ветрено
  STORM = 'storm',                            // Буря
  OTHER = 'other'                             // Другое
}

export enum WindDirection {
  NORTH = 'north',                            // Север
  NORTHEAST = 'northeast',                    // Северо-восток
  EAST = 'east',                              // Восток
  SOUTHEAST = 'southeast',                    // Юго-восток
  SOUTH = 'south',                            // Юг
  SOUTHWEST = 'southwest',                    // Юго-запад
  WEST = 'west',                              // Запад
  NORTHWEST = 'northwest'                     // Северо-запад
}

// ============================================================================
// INTERFACES - Интерфейсы
// ============================================================================

// Основная сущность пожарного инцидента
export interface FireIncident {
  id: string;                                 // Уникальный идентификатор
  incidentNumber: string;                     // Номер инцидента
  type: FireIncidentType;                     // Тип инцидента
  status: FireIncidentStatus;                 // Статус
  priority: FireIncidentPriority;             // Приоритет
  severity: FireIncidentSeverity;             // Серьезность
  category: FireIncidentCategory;             // Категория
  
  // Временные метки
  reportedAt: string;                         // Время заявления
  dispatchedAt?: string;                      // Время отправки
  arrivedAt?: string;                         // Время прибытия
  underControlAt?: string;                    // Время взятия под контроль
  extinguishedAt?: string;                    // Время тушения
  closedAt?: string;                          // Время закрытия
  
  // Локация
  location: FireIncidentLocation;             // Место происшествия
  
  // Заявитель
  reporter?: FireIncidentReporter;            // Заявитель
  
  // Описание
  description: string;                        // Описание инцидента
  notes?: string;                             // Заметки
  
  // Участвующие подразделения
  units: FireIncidentUnit[];                  // Пожарные подразделения
  
  // Участвующие лица
  civilians: FireIncidentCivilian[];          // Гражданские лица
  
  // Повреждения
  damages: FireIncidentDamage[];              // Повреждения
  
  // Погодные условия
  weather?: WeatherConditions;                // Погодные условия
  
  // Дополнительная информация
  isActive: boolean;                          // Активен ли инцидент
  isFalseAlarm: boolean;                      // Ложная тревога
  requiresEvacuation: boolean;                // Требуется эвакуация
  evacuationRadius?: number;                  // Радиус эвакуации (метры)
  
  // Метаданные
  createdAt: string;                          // Дата создания
  updatedAt: string;                          // Дата обновления
  createdBy: string;                          // Кто создал
  updatedBy: string;                          // Кто обновил
}

// Локация пожарного инцидента
export interface FireIncidentLocation {
  address: string;                            // Адрес
  city: string;                               // Город
  state: string;                              // Штат/область
  zipCode: string;                            // Почтовый индекс
  coordinates?: {                              // Координаты
    latitude: number;
    longitude: number;
  };
  buildingType?: string;                      // Тип здания
  buildingHeight?: number;                    // Высота здания (этажи)
  buildingOccupancy?: string;                 // Назначение здания
  crossStreets?: string;                      // Пересекающиеся улицы
  landmarks?: string;                         // Ориентиры
  accessNotes?: string;                       // Заметки о доступе
}

// Заявитель
export interface FireIncidentReporter {
  name: string;                               // Имя
  phone: string;                              // Телефон
  relationship?: string;                      // Отношение к месту
  isWitness: boolean;                         // Является ли свидетелем
  statement?: string;                         // Показания
}

// Пожарное подразделение
export interface FireIncidentUnit {
  id: string;                                 // ID подразделения
  unitNumber: string;                         // Номер подразделения
  type: FireUnitType;                         // Тип подразделения
  status: FireUnitStatus;                     // Статус подразделения
  dispatchedAt?: string;                      // Время отправки
  arrivedAt?: string;                         // Время прибытия
  departedAt?: string;                        // Время отбытия
  personnel: FireUnitPersonnel[];             // Личный состав
  equipment: FireUnitEquipment[];             // Оборудование
  notes?: string;                             // Заметки
}

// Личный состав подразделения
export interface FireUnitPersonnel {
  id: string;                                 // ID сотрудника
  name: string;                               // Имя
  rank: string;                               // Звание
  role: string;                               // Роль в операции
  isCommander: boolean;                       // Является ли командиром
  arrivalTime?: string;                       // Время прибытия
  departureTime?: string;                     // Время отбытия
}

// Оборудование подразделения
export interface FireUnitEquipment {
  id: string;                                 // ID оборудования
  name: string;                               // Название
  type: string;                               // Тип
  quantity: number;                           // Количество
  isUsed: boolean;                            // Использовано ли
  usageNotes?: string;                        // Заметки об использовании
}

// Гражданское лицо
export interface FireIncidentCivilian {
  id: string;                                 // ID лица
  name: string;                               // Имя
  age?: number;                               // Возраст
  gender?: string;                            // Пол
  role: 'victim' | 'witness' | 'evacuee' | 'other'; // Роль
  injuries?: FireIncidentInjury[];            // Травмы
  evacuated: boolean;                         // Эвакуирован ли
  evacuationTime?: string;                    // Время эвакуации
  medicalAttention?: boolean;                 // Требуется ли медпомощь
  notes?: string;                             // Заметки
}

// Травма
export interface FireIncidentInjury {
  id: string;                                 // ID травмы
  type: string;                               // Тип травмы
  severity: 'minor' | 'moderate' | 'severe' | 'critical'; // Серьезность
  location: string;                           // Локализация
  treatment?: string;                         // Лечение
  transported: boolean;                       // Транспортирован ли
  hospital?: string;                          // Больница
  notes?: string;                             // Заметки
}

// Повреждение
export interface FireIncidentDamage {
  id: string;                                 // ID повреждения
  type: 'structural' | 'electrical' | 'water' | 'smoke' | 'other'; // Тип
  description: string;                        // Описание
  severity: 'minor' | 'moderate' | 'severe' | 'total'; // Серьезность
  estimatedCost?: number;                     // Оценочная стоимость
  location: string;                           // Локализация
  photos?: string[];                          // Фотографии
  notes?: string;                             // Заметки
}

// Погодные условия
export interface WeatherConditions {
  temperature?: number;                       // Температура (°C)
  humidity?: number;                          // Влажность (%)
  windSpeed?: number;                         // Скорость ветра (км/ч)
  windDirection?: WindDirection;              // Направление ветра
  condition: WeatherCondition;                // Погодное условие
  visibility?: number;                        // Видимость (км)
  pressure?: number;                          // Давление (мм рт.ст.)
  notes?: string;                             // Заметки
}

// ============================================================================
// API TYPES - Типы для API
// ============================================================================

// Параметры поиска пожарных инцидентов
export interface FireIncidentSearchParams {
  type?: FireIncidentType[];                  // Типы инцидентов
  status?: FireIncidentStatus[];              // Статусы
  priority?: FireIncidentPriority[];          // Приоритеты
  severity?: FireIncidentSeverity[];          // Серьезность
  category?: FireIncidentCategory[];          // Категории
  city?: string;                              // Город
  address?: string;                           // Адрес
  reportedAfter?: string;                     // Заявлен после
  reportedBefore?: string;                    // Заявлен до
  isActive?: boolean;                         // Активен ли
  isFalseAlarm?: boolean;                     // Ложная тревога
  requiresEvacuation?: boolean;               // Требуется эвакуация
  limit?: number;                             // Лимит результатов
  offset?: number;                            // Смещение
  sortBy?: 'reportedAt' | 'priority' | 'severity' | 'status'; // Сортировка
  sortOrder?: 'asc' | 'desc';                 // Порядок сортировки
}

// Параметры создания пожарного инцидента
export interface CreateFireIncidentParams {
  type: FireIncidentType;
  priority: FireIncidentPriority;
  severity: FireIncidentSeverity;
  category: FireIncidentCategory;
  location: FireIncidentLocation;
  description: string;
  reporter?: FireIncidentReporter;
  notes?: string;
  weather?: WeatherConditions;
  requiresEvacuation?: boolean;
  evacuationRadius?: number;
}

// Параметры обновления пожарного инцидента
export interface UpdateFireIncidentParams {
  type?: FireIncidentType;
  status?: FireIncidentStatus;
  priority?: FireIncidentPriority;
  severity?: FireIncidentSeverity;
  category?: FireIncidentCategory;
  location?: FireIncidentLocation;
  description?: string;
  notes?: string;
  weather?: WeatherConditions;
  requiresEvacuation?: boolean;
  evacuationRadius?: number;
  isActive?: boolean;
  isFalseAlarm?: boolean;
}

// Параметры добавления подразделения
export interface AddFireUnitParams {
  unitNumber: string;
  type: FireUnitType;
  personnel: Omit<FireUnitPersonnel, 'id'>[];
  equipment?: Omit<FireUnitEquipment, 'id'>[];
  notes?: string;
}

// Параметры добавления гражданского лица
export interface AddCivilianParams {
  name: string;
  age?: number;
  gender?: string;
  role: 'victim' | 'witness' | 'evacuee' | 'other';
  injuries?: Omit<FireIncidentInjury, 'id'>[];
  evacuated?: boolean;
  medicalAttention?: boolean;
  notes?: string;
}

// Параметры добавления повреждения
export interface AddDamageParams {
  type: 'structural' | 'electrical' | 'water' | 'smoke' | 'other';
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'total';
  location: string;
  estimatedCost?: number;
  photos?: string[];
  notes?: string;
}

// ============================================================================
// RESPONSE TYPES - Типы ответов API
// ============================================================================

// Ответ с пожарным инцидентом
export interface FireIncidentResponse {
  success: boolean;
  data: FireIncident;
  message?: string;
}

// Ответ со списком пожарных инцидентов
export interface FireIncidentListResponse {
  success: boolean;
  data: {
    incidents: FireIncident[];
    total: number;
    limit: number;
    offset: number;
  };
  message?: string;
}

// Ответ со статистикой
export interface FireIncidentStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: Record<FireIncidentType, number>;
    byStatus: Record<FireIncidentStatus, number>;
    byPriority: Record<FireIncidentPriority, number>;
    bySeverity: Record<FireIncidentSeverity, number>;
    byCategory: Record<FireIncidentCategory, number>;
    falseAlarms: number;
    evacuations: number;
    averageResponseTime: number;
    averageResolutionTime: number;
  };
  message?: string;
}

// Ответ с экспортом
export interface FireIncidentExportResponse {
  success: boolean;
  data: {
    format: 'csv' | 'json' | 'pdf' | 'excel';
    url: string;
    filename: string;
    size: number;
  };
  message?: string;
}

// ============================================================================
// UTILITY TYPES - Утилитарные типы
// ============================================================================

// Фильтры для UI
export interface FireIncidentFilters {
  type: FireIncidentType[];
  status: FireIncidentStatus[];
  priority: FireIncidentPriority[];
  severity: FireIncidentSeverity[];
  category: FireIncidentCategory[];
  dateRange: {
    start: string;
    end: string;
  };
  isActive: boolean;
  isFalseAlarm: boolean;
  requiresEvacuation: boolean;
}

// Опции для селектов
export interface FireIncidentOptions {
  types: { value: FireIncidentType; label: string }[];
  statuses: { value: FireIncidentStatus; label: string }[];
  priorities: { value: FireIncidentPriority; label: string }[];
  severities: { value: FireIncidentSeverity; label: string }[];
  categories: { value: FireIncidentCategory; label: string }[];
  unitTypes: { value: FireUnitType; label: string }[];
  unitStatuses: { value: FireUnitStatus; label: string }[];
  weatherConditions: { value: WeatherCondition; label: string }[];
  windDirections: { value: WindDirection; label: string }[];
} 