
import type { Citizen, Vehicle, Bolo, MDTUnit, MDTCall911, Incident, PenalCode, MedicalInfo, MDTReport, ReportTemplate, Weapon, Pet, NotebookNote, Signal, SignalNotification, ImpoundLot, ImpoundedVehicle, EmsFdReport, DispatchUnit, Warrant, GameZone, Call911 } from './types';
import { UserRole, UnitStatus, DispatchStatus } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Building, 
  Newspaper, 
  Siren, 
  Gavel, 
  FileText, 
  Handshake, 
  Ambulance, 
  Radio, 
  ClipboardList, 
  Cog,
  Truck,
  Heart,
  BookOpen,
  Shield,
  Calendar,
  Warehouse,
  Map
} from 'lucide-react';

export const MOCK_CITIZENS: Citizen[] = [
  { 
    id: 'cit_1', 
    userId: 'user_1', 
    firstName: 'John', 
    lastName: 'Doe', 
    address: '123 Main St, Los Santos', 
    dateOfBirth: '1990-05-15', 
    imageUrl: 'https://picsum.photos/seed/john/200', 
    gender: 'Male', 
    height: "6'1\"", 
    weight: "190 lbs", 
    occupation: 'Mechanic',
    medicalInfo: {
        bloodType: 'O+',
        allergies: ['Penicillin'],
        conditions: ['Asthma'],
        medications: ['Albuterol Inhaler'],
        notes: 'Slightly anxious around needles.'
    }
  },
  { 
    id: 'cit_2', 
    userId: 'user_1', 
    firstName: 'Jane', 
    lastName: 'Smith', 
    address: '456 Vespucci Blvd, Los Santos', 
    dateOfBirth: '1992-08-22', 
    imageUrl: 'https://picsum.photos/seed/jane/200', 
    gender: 'Female', 
    height: "5'7\"", 
    weight: "140 lbs", 
    occupation: 'Lawyer',
    medicalInfo: {
        bloodType: 'A-',
        allergies: [],
        conditions: [],
        medications: ['Prenatal Vitamins'],
        notes: 'Patient is 6 months pregnant.'
    }
  },
];

// Обновляем Vehicle интерфейс для MDT Client (используем string ID)
export const MOCK_VEHICLES: Array<Vehicle & { stolen?: boolean }> = [
  { 
    id: 'veh_1', 
    ownerId: 'cit_1', 
    plate: '88ABC123', 
    vin: '1HGBH41JXMN109186',
    model: 'Obey Tailgater', 
    color: 'Black', 
    registration: 'valid',
    insurance: 'valid',
    stolen: false 
  },
  { 
    id: 'veh_2', 
    ownerId: 'cit_2', 
    plate: '46PQR789', 
    vin: '2T1BURHE0JC123456',
    model: 'Bravado Buffalo', 
    color: 'White', 
    registration: 'valid',
    insurance: 'valid',
    stolen: true 
  },
];

export const MOCK_BOLOS: Bolo[] = [
  {
    id: 'bolo_1',
    title: 'Подозреваемый в краже со взломом',
    description: 'Мужчина средних лет, рост 180см, одет в черную куртку',
    type: 'PERSON',
    targetName: 'Неизвестный подозреваемый',
    authorId: 'dispatcher_1',
    authorName: 'Диспетчер Иванов',
    priority: 'high',
    isActive: true,
    createdAt: '2023-12-15T10:30:00Z',
    location: 'Центральный район',
    notes: 'Последний раз замечен в районе торгового центра'
  },
  {
    id: 'bolo_2',
    title: 'Похищенный автомобиль BMW X5',
    description: 'Черный BMW X5, номер ABC-123',
    type: 'VEHICLE',
    targetVehicle: 'ABC-123',
    authorId: 'dispatcher_1',
    authorName: 'Диспетчер Иванов',
    priority: 'medium',
    isActive: true,
    createdAt: '2023-12-15T09:15:00Z',
    location: 'Весь город',
    notes: 'Похищен из парковки торгового центра'
  }
];

export const MOCK_UNITS: any[] = [
  { 
    id: 'unit_1', 
    characterId: 1,
    unitNumber: '1-ADAM-12', 
    departmentId: 1,
    status: 'available',
    isPanic: false,
    lastUpdate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    characterName: 'John Doe',
    callsign: '1-ADAM-12'
  },
  { 
    id: 'unit_2', 
    characterId: 2,
    unitNumber: '2-LINCOLN-5', 
    departmentId: 2,
    status: 'enRoute', 
    currentCallId: 1,
    isPanic: false,
    lastUpdate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    characterName: 'Jane Smith',
    callsign: '2-LINCOLN-5'
  },
  { 
    id: 'unit_3', 
    characterId: 3,
    unitNumber: 'E-15', 
    departmentId: 3,
    status: 'onScene', 
    currentCallId: 2,
    isPanic: false,
    lastUpdate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    characterName: 'Mike Johnson',
    callsign: 'E-15'
  },
  { 
    id: 'unit_4', 
    characterId: 4,
    unitNumber: 'A-3', 
    departmentId: 3,
    status: 'available',
    isPanic: false,
    lastUpdate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    characterName: 'Sarah Wilson',
    callsign: 'A-3'
  },
];

// Моковые данные для диспетчерского модуля
export const MOCK_DISPATCH_UNITS: DispatchUnit[] = [
  {
    id: 'dispatch_1',
    name: 'Диспетчер Иванов',
    status: DispatchStatus.OPERATOR,
    isOnline: true,
    lastActivity: new Date().toISOString(),
    currentZone: 'Центральный район'
  },
  {
    id: 'dispatch_2',
    name: 'Диспетчер Петров',
    status: DispatchStatus.TRAFFIC_DISPATCHER,
    isOnline: true,
    lastActivity: new Date(Date.now() - 300000).toISOString(),
    currentZone: 'Северный район'
  },
  {
    id: 'dispatch_3',
    name: 'Диспетчер Сидоров',
    status: DispatchStatus.UNAVAILABLE,
    isOnline: false,
    lastActivity: new Date(Date.now() - 1800000).toISOString()
  }
];

export const MOCK_WARRANTS: Warrant[] = [
  {
    id: 'warrant_1',
    targetName: 'Иван Петров',
    type: 'SEARCH',
    address: 'ул. Ленина, 15, кв. 23',
    reason: 'Подозрение в хранении наркотических веществ',
    authorId: 'officer_1',
    authorName: 'Офицер Сидоров',
    status: 'ACTIVE',
    createdAt: '2023-12-15T08:00:00Z',
    expiresAt: '2023-12-22T08:00:00Z',
    notes: 'Ордер выдан на основании показаний свидетелей'
  },
  {
    id: 'warrant_2',
    targetName: 'Мария Козлова',
    type: 'ARREST',
    reason: 'Нарушение условий условно-досрочного освобождения',
    authorId: 'officer_2',
    authorName: 'Офицер Иванов',
    status: 'ACTIVE',
    createdAt: '2023-12-14T16:30:00Z',
    expiresAt: '2023-12-21T16:30:00Z'
  }
];

export const MOCK_GAME_ZONES: GameZone[] = [
  {
    id: 'zone_1',
    name: 'Центральный район',
    description: 'Основная игровая зона в центре города',
    isActive: true,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2023-12-15T10:00:00Z'
  },
  {
    id: 'zone_2',
    name: 'Северный район',
    description: 'Промышленная зона на севере',
    isActive: true,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2023-12-15T09:30:00Z'
  },
  {
    id: 'zone_3',
    name: 'Южный район',
    description: 'Жилой район на юге города',
    isActive: false,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2023-12-15T08:00:00Z'
  }
];

export const MOCK_CALLS_911: Call911[] = [
  {
    id: 'call_911_1',
    callerId: 'citizen_1',
    callerName: 'Анна Сидорова',
    callerPhone: '+7-999-123-45-67',
    location: 'ул. Пушкина, 10',
    description: 'Слышны выстрелы в соседней квартире',
    priority: 'high',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: 'call_911_2',
    callerId: 'citizen_2',
    callerName: 'Петр Иванов',
    callerPhone: '+7-999-987-65-43',
    location: 'пр. Мира, 25',
    description: 'ДТП с участием двух автомобилей',
    priority: 'medium',
    status: 'ACCEPTED',
    assignedDispatcher: 'dispatch_1',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    answeredAt: new Date(Date.now() - 240000).toISOString()
  }
];

export const MOCK_CALLS: any[] = [
  { 
    id: 'call_1', 
    callerName: 'Unknown', 
    location: 'Intersection of Power St and Innocence Blvd', 
    description: 'Reports of shots fired.', 
    type: 'shots_fired',
    priority: 1,
    status: 'pending',
    assignedUnits: [2],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 'call_2', 
    callerName: 'Maria Rodriguez', 
    location: '247 Vespucci Canals', 
    description: 'Structure fire, possible entrapment.', 
    type: 'structure_fire',
    priority: 2,
    status: 'dispatched',
    assignedUnits: [3],
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString()
  },
  { 
    id: 'call_3', 
    callerName: 'Anonymous', 
    location: 'Del Perro Pier', 
    description: 'Suspicious person looking into cars.', 
    type: 'suspicious_person',
    priority: 3,
    status: 'pending',
    assignedUnits: [],
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
];

export const MOCK_INCIDENT: Incident = {
  id: 'inc_123',
  title: 'Robbery at 24/7 Supermarket',
  involvedUnits: ['unit_1', 'unit_2'],
  involvedCitizens: ['cit_1'],
  events: [
    { id: 'ev_1', timestamp: new Date(Date.now() - 300000).toISOString(), description: 'Call received for a panic alarm at 24/7 on Innocence Blvd.' },
    { id: 'ev_2', timestamp: new Date(Date.now() - 240000).toISOString(), description: 'Units 1-ADAM-12 and 2-LINCOLN-5 dispatched.' },
    { id: 'ev_3', timestamp: new Date(Date.now() - 180000).toISOString(), description: '1-ADAM-12 arrived on scene.' },
    { id: 'ev_4', timestamp: new Date(Date.now() - 120000).toISOString(), description: 'Suspect vehicle, a black Obey Tailgater, fled the scene.' },
    { id: 'ev_5', timestamp: new Date(Date.now() - 60000).toISOString(), description: 'Suspect John Doe apprehended after a short pursuit. Vehicle recovered.' },
  ]
};

export const MOCK_INCIDENTS: Incident[] = [MOCK_INCIDENT];

export const MOCK_PENAL_CODES: PenalCode[] = [
    { id: '1', title: '1-1. Grand Theft Auto', description: 'Theft of an automobile.', fine: 5000, jailTime: 30 },
    { id: '2', title: '2-5. Reckless Driving', description: 'Driving with willful or wanton disregard for the safety of persons or property.', fine: 1500, jailTime: 5 },
    { id: '3', title: '3-2. Resisting Arrest', description: 'Willfully resisting, delaying, or obstructing a public officer.', fine: 2000, jailTime: 10 },
    { id: '4', title: '4-1. Possession of a Controlled Substance', description: 'Unlawful possession of a controlled substance.', fine: 3000, jailTime: 15 },
    { id: '5', title: '5-8. Assault with a Deadly Weapon', description: 'An assault that is committed with a weapon or by any means of force likely to produce great bodily injury.', fine: 10000, jailTime: 60 },
];

export const MOCK_REPORTS: MDTReport[] = [
    {
        id: 'rep_1',
        title: 'Arrest of John Doe',
        author: '1-ADAM-12',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'Arrest',
        content: `On the date of... suspect John Doe was arrested following a traffic stop. Suspect was non-compliant... Charges include reckless driving and resisting arrest. Suspect transported to MRPD for processing.`
    },
    {
        id: 'rep_2',
        title: 'Patient Care Report - Jane Smith',
        author: 'A-3',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        type: 'Medical',
        content: `Patient Jane Smith, female, approx 30 years of age, found conscious and alert. Chief complaint of abdominal pain. Vitals taken... Patient states she is 6 months pregnant. Transported to Pillbox Hill Medical Center for further evaluation.`
    },
    {
        id: 'rep_3',
        title: 'Incident Report - Robbery 24/7',
        author: '1-ADAM-12',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        type: 'Incident',
        content: `Units responded to a panic alarm at the 24/7 Supermarket on Innocence Blvd. A pursuit was initiated on a black Obey Tailgater...`
    }
];

// Моковые данные для отчетов EMS/FD
export const MOCK_EMS_FD_REPORTS: EmsFdReport[] = [
    {
        id: 'ems_rep_1',
        type: 'medical',
        author: 'Джон Смит',
        authorId: 'user_1',
        callId: 'call_1',
        patientName: 'Роберт Уилсон',
        incidentLocation: 'ул. Мэйн, 123',
        incidentTime: '2024-01-15T10:30:00Z',
        incidentType: 'cardiac_arrest',
        description: 'Пациент жалуется на боль в груди. Прибыли на место через 5 минут после вызова.',
        treatmentProvided: 'Проведена оценка жизненных показателей, введен кислород, мониторинг ЭКГ.',
        medications: ['Аспирин', 'Нитроглицерин'],
        vitalSigns: {
            heartRate: 95,
            bloodPressure: '140/90',
            temperature: 37.2,
            oxygenSaturation: 98
        },
        outcome: 'Пациент стабилизирован и транспортирован в больницу.',
        disposition: 'hospital',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'fd_rep_1',
        type: 'fire',
        author: 'Майк Браун',
        authorId: 'user_2',
        callId: 'call_2',
        incidentLocation: 'ул. Оук, 456',
        incidentTime: '2024-01-15T14:20:00Z',
        incidentType: 'structure_fire',
        description: 'Пожар в жилом доме. Прибыли на место через 3 минуты после вызова.',
        outcome: 'Пожар локализован и потушен.',
        fireDetails: {
            structureType: 'residential',
            fireOrigin: 'Кухня',
            damage: 'Умеренный ущерб кухне и прилегающим комнатам',
            cause: 'Неисправность электроприбора'
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 'fd_rep_2',
        type: 'rescue',
        author: 'Лиза Дэвис',
        authorId: 'user_3',
        callId: 'call_3',
        incidentLocation: 'ул. Пайн, 789',
        incidentTime: '2024-01-15T16:45:00Z',
        incidentType: 'rescue',
        description: 'Спасательная операция - человек застрял в автомобиле после ДТП.',
        outcome: 'Пострадавший извлечен и транспортирован в больницу.',
        fireDetails: {
            structureType: 'vehicle',
            fireOrigin: 'N/A',
            damage: 'Тяжелые повреждения автомобиля',
            cause: 'Дорожно-транспортное происшествие'
        },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
    }
];

// Моковые данные для сигналов
export const MOCK_SIGNALS: any[] = [
  {
    id: 'signal_1',
    title: 'Briefing on block 761',
    description: 'Important briefing for all units in the area',
    type: 'LEO',
    authorId: 1,
    authorName: '9W22',
    createdAt: new Date().toISOString(),
    isActive: true,
    priority: 'high',
    location: 'Block 761, Los Santos'
  },
  {
    id: 'signal_2',
    title: 'Medical emergency at hospital',
    description: 'All EMS units required at central hospital',
    type: 'EMS_FD',
    authorId: 2,
    authorName: 'EMS-1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isActive: true,
    priority: 'critical',
    location: 'Central Hospital'
  }
];

export const MOCK_SIGNAL_NOTIFICATIONS: any[] = [
  {
    id: 'notif_1',
    signalId: 'signal_1',
    recipientId: 1,
    createdAt: new Date().toISOString(),
    isRead: false
  }
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
    {
        id: 'arrest_template',
        name: 'Arrest Report Template',
        type: 'Arrest',
        title: 'Рапорт об аресте: [Имя Фамилия]',
        content: `**1. ДЕТАЛИ АРЕСТА**\nДата: \nВремя: \nМесто: \n\n**2. ИНФОРМАЦИЯ О ЗАДЕРЖАННОМ**\nИмя: \nФамилия: \nДата рождения: \n\n**3. ОБВИНЕНИЯ**\n- \n- \n\n**4. ОПИСАНИЕ ИНЦИДЕНТА**\n[Подробное описание событий, приведших к аресту.]\n\n**5. ИЗЪЯТЫЕ ПРЕДМЕТЫ**\n- \n\n**6. ЗАЯВЛЕНИЕ ОФИЦЕРА**\n[Имя офицера]`,
        fields: ['date', 'time', 'location', 'suspectName', 'charges', 'description', 'evidence', 'officerName']
    },
    {
        id: 'incident_template',
        name: 'Incident Report Template',
        type: 'Incident',
        title: 'Рапорт об инциденте: [Тип инцидента]',
        content: `**1. ТИП ИНЦИДЕНТА:** \n**2. ДАТА/ВРЕМЯ:** \n**3. МЕСТО:** \n\n**4. УЧАСТВУЮЩИЕ ЮНИТЫ:**\n- \n\n**5. ВОВЛЕЧЕННЫЕ ЛИЦА:**\n- \n\n**6. ХРОНОЛОГИЯ СОБЫТИЙ:**\n[Подробное описание инцидента от начала до конца.]\n\n**7. РЕЗУЛЬТАТ:**\n[Чем завершился инцидент.]`,
        fields: ['incidentType', 'dateTime', 'location', 'units', 'involvedPersons', 'chronology', 'outcome']
    },
    {
        id: 'medical_template',
        name: 'Medical Report Template',
        type: 'Medical',
        title: 'Медицинский рапорт (PCR): [Имя пациента]',
        content: `**PATIENT CARE REPORT**\n\n**1. PATIENT INFORMATION**\nName: \nDOB: \nAge: \nGender: \n\n**2. DISPATCH INFORMATION**\nCall Location: \nChief Complaint: \n\n**3. ASSESSMENT (S.O.A.P.)**\n**S (Subjective):**\n[What the patient tells you.]\n\n**O (Objective):**\n- Vitals (HR, BP, RR, SpO2): \n- GCS: \n- Physical Findings: \n\n**A (Assessment):**\n[Your professional assessment of the patient's condition.]\n\n**P (Plan):**\n- Treatment Provided: \n- Transport Decision: \n\n**4. NARRATIVE**\n[A detailed, chronological account of the call from dispatch to transfer of care.]\n\n**5. CREW**\n[Responding unit and personnel.]`,
        fields: ['patientName', 'dob', 'age', 'gender', 'location', 'complaint', 'vitals', 'assessment', 'treatment', 'narrative', 'crew']
    }
];

// Список компаний из GTA
export const MOCK_COMPANIES = [
    {
        id: '1',
        companyName: 'Ammu‑Nation',
        companyType: 'corporation',
        industry: 'security',
        description: 'Сеть оружейных магазинов',
        address: 'Los Santos',
        phone: '+1-555-AMMU',
        email: 'info@ammunation.com',
        website: 'www.ammunation.com',
        dateCreated: '2024-01-01T00:00:00',
        employees: []
    },
    {
        id: '2',
        companyName: 'Gruppe Sechs',
        companyType: 'corporation',
        industry: 'security',
        description: 'Частная охранная компания',
        address: 'Los Santos',
        phone: '+1-555-GRUP',
        email: 'contact@gruppesechs.com',
        website: 'www.gruppesechs.com',
        dateCreated: '2024-01-02T00:00:00',
        employees: []
    },
    {
        id: '3',
        companyName: 'Merryweather Security',
        companyType: 'corporation',
        industry: 'security',
        description: 'Частная военная компания (PMC)',
        address: 'Los Santos',
        phone: '+1-555-MERRY',
        email: 'info@merryweather.com',
        website: 'www.merryweather.com',
        dateCreated: '2024-01-03T00:00:00',
        employees: []
    },
    {
        id: '4',
        companyName: 'Mors Mutual Insurance',
        companyType: 'corporation',
        industry: 'finance',
        description: 'Автострахование (в GTA Online)',
        address: 'Los Santos',
        phone: '+1-555-MORS',
        email: 'claims@morsmutual.com',
        website: 'www.morsmutual.com',
        dateCreated: '2024-01-04T00:00:00',
        employees: []
    },
    {
        id: '5',
        companyName: 'Augury Insurance',
        companyType: 'corporation',
        industry: 'finance',
        description: 'Страховая компания',
        address: 'Los Santos',
        phone: '+1-555-AUGU',
        email: 'info@augury.com',
        website: 'www.augury.com',
        dateCreated: '2024-01-05T00:00:00',
        employees: []
    },
    {
        id: '6',
        companyName: 'Maze Bank',
        companyType: 'corporation',
        industry: 'finance',
        description: 'Крупнейший банк штата',
        address: 'Los Santos',
        phone: '+1-555-MAZE',
        email: 'banking@mazebank.com',
        website: 'www.mazebank.com',
        dateCreated: '2024-01-06T00:00:00',
        employees: []
    },
    {
        id: '7',
        companyName: 'Bank of Liberty',
        companyType: 'corporation',
        industry: 'finance',
        description: 'Банк, присутствует в штате',
        address: 'Liberty City',
        phone: '+1-555-LIBE',
        email: 'contact@bankofliberty.com',
        website: 'www.bankofliberty.com',
        dateCreated: '2024-01-07T00:00:00',
        employees: []
    },
    {
        id: '8',
        companyName: 'Richards Majestic',
        companyType: 'corporation',
        industry: 'finance',
        description: 'Медиа-студия и инвестиции',
        address: 'Los Santos',
        phone: '+1-555-RICH',
        email: 'info@richardsmajestic.com',
        website: 'www.richardsmajestic.com',
        dateCreated: '2024-01-08T00:00:00',
        employees: []
    },
    {
        id: '9',
        companyName: 'Lifeinvader',
        companyType: 'corporation',
        industry: 'technology',
        description: 'Соцсеть и технологическая компания',
        address: 'Los Santos',
        phone: '+1-555-LIFE',
        email: 'support@lifeinvader.com',
        website: 'www.lifeinvader.com',
        dateCreated: '2024-01-09T00:00:00',
        employees: []
    },
    {
        id: '10',
        companyName: 'Fruit Computers / Genic',
        companyType: 'corporation',
        industry: 'technology',
        description: 'Производители электроники',
        address: 'Los Santos',
        phone: '+1-555-FRUI',
        email: 'sales@fruitcomputers.com',
        website: 'www.fruitcomputers.com',
        dateCreated: '2024-01-10T00:00:00',
        employees: []
    },
    {
        id: '11',
        companyName: 'Whiz Wireless / Tinkle Telecom',
        companyType: 'corporation',
        industry: 'technology',
        description: 'Телекоммуникационные компании',
        address: 'Los Santos',
        phone: '+1-555-WHIZ',
        email: 'info@whizwireless.com',
        website: 'www.whizwireless.com',
        dateCreated: '2024-01-11T00:00:00',
        employees: []
    },
    {
        id: '12',
        companyName: 'Radio Los Santos / Worldwide FM',
        companyType: 'corporation',
        industry: 'technology',
        description: 'Радиостанции и СМИ',
        address: 'Los Santos',
        phone: '+1-555-RADIO',
        email: 'contact@radiolossantos.com',
        website: 'www.radiolossantos.com',
        dateCreated: '2024-01-12T00:00:00',
        employees: []
    },
    {
        id: '13',
        companyName: 'Darnell Bros.',
        companyType: 'corporation',
        industry: 'transportation',
        description: 'Логистика и грузоперевозки',
        address: 'Los Santos',
        phone: '+1-555-DARN',
        email: 'shipping@darnellbros.com',
        website: 'www.darnellbros.com',
        dateCreated: '2024-01-13T00:00:00',
        employees: []
    },
    {
        id: '14',
        companyName: 'Camel Towing',
        companyType: 'corporation',
        industry: 'transportation',
        description: 'Эвакуаторная служба',
        address: 'Los Santos',
        phone: '+1-555-CAME',
        email: 'towing@cameltowing.com',
        website: 'www.cameltowing.com',
        dateCreated: '2024-01-14T00:00:00',
        employees: []
    },
    {
        id: '15',
        companyName: 'Caesars Auto Parking',
        companyType: 'corporation',
        industry: 'transportation',
        description: 'Автостоянка и сервис',
        address: 'Los Santos',
        phone: '+1-555-CAES',
        email: 'parking@caesarsauto.com',
        website: 'www.caesarsauto.com',
        dateCreated: '2024-01-15T00:00:00',
        employees: []
    },
    {
        id: '16',
        companyName: 'GoPostal / PostOP',
        companyType: 'corporation',
        industry: 'transportation',
        description: 'Почтовые и курьерские компании',
        address: 'Los Santos',
        phone: '+1-555-GOPO',
        email: 'delivery@gopostal.com',
        website: 'www.gopostal.com',
        dateCreated: '2024-01-16T00:00:00',
        employees: []
    },
    {
        id: '17',
        companyName: 'FlyUS / AirEmu',
        companyType: 'corporation',
        industry: 'transportation',
        description: 'Авиакомпании-конкуренты',
        address: 'Los Santos',
        phone: '+1-555-FLYU',
        email: 'flights@flyus.com',
        website: 'www.flyus.com',
        dateCreated: '2024-01-17T00:00:00',
        employees: []
    },
    {
        id: '18',
        companyName: 'Cluckin\' Bell / Burger Shot',
        companyType: 'corporation',
        industry: 'food',
        description: 'Сети ресторанов быстрого питания',
        address: 'Los Santos',
        phone: '+1-555-CLUC',
        email: 'orders@cluckinbell.com',
        website: 'www.cluckinbell.com',
        dateCreated: '2024-01-18T00:00:00',
        employees: []
    },
    {
        id: '19',
        companyName: 'eCola / Sprunk',
        companyType: 'corporation',
        industry: 'food',
        description: 'Газированные напитки',
        address: 'Los Santos',
        phone: '+1-555-ECOL',
        email: 'info@ecola.com',
        website: 'www.ecola.com',
        dateCreated: '2024-01-19T00:00:00',
        employees: []
    },
    {
        id: '20',
        companyName: 'Logger Beer / Pißwasser',
        companyType: 'corporation',
        industry: 'food',
        description: 'Пивные бренды',
        address: 'Los Santos',
        phone: '+1-555-LOGG',
        email: 'beer@loggerbeer.com',
        website: 'www.loggerbeer.com',
        dateCreated: '2024-01-20T00:00:00',
        employees: []
    },
    {
        id: '21',
        companyName: 'Binco',
        companyType: 'corporation',
        industry: 'retail',
        description: 'Сеть одежды (low-end)',
        address: 'Los Santos',
        phone: '+1-555-BINC',
        email: 'fashion@binco.com',
        website: 'www.binco.com',
        dateCreated: '2024-01-21T00:00:00',
        employees: []
    },
    {
        id: '22',
        companyName: 'Vangelico',
        companyType: 'corporation',
        industry: 'retail',
        description: 'Бутик ювелирных изделий',
        address: 'Los Santos',
        phone: '+1-555-VANG',
        email: 'jewelry@vangelico.com',
        website: 'www.vangelico.com',
        dateCreated: '2024-01-22T00:00:00',
        employees: []
    },
    {
        id: '23',
        companyName: 'Bert\'s Tool Supply Co.',
        companyType: 'corporation',
        industry: 'manufacturing',
        description: 'Поставщик строительных инструментов',
        address: 'Los Santos',
        phone: '+1-555-BERT',
        email: 'tools@bertstools.com',
        website: 'www.bertstools.com',
        dateCreated: '2024-01-23T00:00:00',
        employees: []
    },
    {
        id: '24',
        companyName: 'Blaine County Depot',
        companyType: 'government',
        industry: 'manufacturing',
        description: 'Государственное логистическое подразделение',
        address: 'Blaine County',
        phone: '+1-555-BLAI',
        email: 'logistics@blainecountydepot.gov',
        website: 'www.blainecountydepot.gov',
        dateCreated: '2024-01-24T00:00:00',
        employees: []
    },
    {
        id: '25',
        companyName: 'Blitzkrieg Mop',
        companyType: 'corporation',
        industry: 'services',
        description: 'Коммерческая уборка и сервисы',
        address: 'Los Santos',
        phone: '+1-555-BLIT',
        email: 'cleaning@blitzkriegmop.com',
        website: 'www.blitzkriegmop.com',
        dateCreated: '2024-01-25T00:00:00',
        employees: []
    },
    {
        id: '26',
        companyName: 'Dollar Pills / Eugenics Inc.',
        companyType: 'corporation',
        industry: 'healthcare',
        description: 'Аптеки и фармацевтика',
        address: 'Los Santos',
        phone: '+1-555-DOLL',
        email: 'pharmacy@dollarpills.com',
        website: 'www.dollarpills.com',
        dateCreated: '2024-01-26T00:00:00',
        employees: []
    }
];

// Функция для создания навигации с поддержкой локализации
export const createNavigationMap = (t: (key: string) => string) => ({
  [UserRole.CITIZEN]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.citizens'), icon: Users, href: '#' },
    { name: t('navigation.createOfficer'), icon: Shield, href: '#' },
    { name: t('navigation.cargoLog'), icon: Truck, href: '#' },
    { name: t('navigation.companies'), icon: Building, href: '#' },
    { name: t('navigation.pets'), icon: Heart, href: '#' },
    { name: t('navigation.codes'), icon: BookOpen, href: '#' },
  ],
  [UserRole.LEO]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.officers'), icon: Users, href: '#' },
    { name: t('navigation.shiftLog'), icon: Calendar, href: '#' },
    { name: t('navigation.activeIncidents'), icon: Siren, href: '#' },
    { name: t('navigation.penalCodes'), icon: Gavel, href: '#' },
    { name: t('navigation.reports'), icon: FileText, href: '#' },
    { name: t('navigation.impound'), icon: Warehouse, href: '#' },
    { name: t('navigation.map'), icon: Map, href: '#' },
  ],
  [UserRole.EMS_FD]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.patientSearch'), icon: Handshake, href: '#' },
    { name: t('navigation.activeCalls'), icon: Ambulance, href: '#' },
    { name: t('navigation.personnel'), icon: Users, href: '#' },
    { name: t('navigation.shiftLog'), icon: Calendar, href: '#' },
    { name: t('navigation.reports'), icon: FileText, href: '#' },
  ],
  [UserRole.DISPATCH]: [
    { name: t('navigation.controlCenter'), icon: Radio, href: '#' },
    { name: t('navigation.map'), icon: Map, href: '#' },
  ],
  [UserRole.ADMIN]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.userManagement'), icon: Users, href: '#' },
    { name: t('navigation.cadSettings'), icon: Cog, href: '#' },
    { name: t('navigation.valueManager'), icon: ClipboardList, href: '#' },
  ]
});

// Устаревший NAVIGATION_MAP для обратной совместимости
export const NAVIGATION_MAP = createNavigationMap((key: string) => key);

// Моковые данные для LAW панели управления
export const MOCK_WEAPONS: Weapon[] = [
  {
    id: 'weapon_1',
    serialNumber: 'SN123456789',
    model: 'Glock 17',
    type: 'Pistol',
    caliber: '9mm',
    ownerId: 'cit_1',
    ownerName: 'John Doe',
    registrationDate: '2023-01-15',
    status: 'registered',
    notes: 'Стандартная лицензия на оружие'
  },
  {
    id: 'weapon_2',
    serialNumber: 'SN987654321',
    model: 'Remington 870',
    type: 'Shotgun',
    caliber: '12 Gauge',
    ownerId: 'cit_2',
    ownerName: 'Jane Smith',
    registrationDate: '2023-03-20',
    status: 'registered',
    notes: 'Охотничье ружье'
  },
  {
    id: 'weapon_3',
    serialNumber: 'SN555666777',
    model: 'AR-15',
    type: 'Rifle',
    caliber: '5.56mm',
    ownerId: 'cit_3',
    ownerName: 'Mike Johnson',
    registrationDate: '2023-06-10',
    status: 'stolen',
    notes: 'Похищено 15.12.2023'
  }
];

export const MOCK_PETS: Pet[] = [
  {
    id: 'pet_1',
    name: 'Rex',
    breed: 'German Shepherd',
    color: 'Black and Tan',
    weight: '35 kg',
    ownerId: 'cit_1',
    ownerName: 'John Doe',
    medicalRecords: ['Вакцинация от бешенства - 2023', 'Чипирование - 2023'],
    notes: 'Служебная собака, обучена командам',
    registrationDate: '2023-02-01'
  },
  {
    id: 'pet_2',
    name: 'Fluffy',
    breed: 'Persian Cat',
    color: 'White',
    weight: '4 kg',
    ownerId: 'cit_2',
    ownerName: 'Jane Smith',
    medicalRecords: ['Стерилизация - 2022', 'Вакцинация - 2023'],
    notes: 'Домашний питомец',
    registrationDate: '2022-08-15'
  },
  {
    id: 'pet_3',
    name: 'Buddy',
    breed: 'Golden Retriever',
    color: 'Golden',
    weight: '28 kg',
    ownerId: 'cit_4',
    ownerName: 'Sarah Wilson',
    medicalRecords: ['Вакцинация - 2023', 'Лечение от аллергии - 2023'],
    notes: 'Аллергия на курицу',
    registrationDate: '2022-11-20'
  }
];

// Расширенные данные граждан для поиска
export const MOCK_CITIZENS_EXTENDED: (Citizen & { ssn?: string; flags?: string[]; addressFlags?: string[] })[] = [
  {
    id: 'cit_1',
    userId: 'user_1',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main St, Los Santos',
    dateOfBirth: '1990-05-15',
    imageUrl: 'https://picsum.photos/seed/john/200',
    gender: 'Male',
    height: "6'1\"",
    weight: "190 lbs",
    occupation: 'Mechanic',
    ssn: '123-45-6789',
    flags: ['VIP'],
    addressFlags: ['Residential'],
    medicalInfo: {
      bloodType: 'O+',
      allergies: ['Penicillin'],
      conditions: ['Asthma'],
      medications: ['Albuterol Inhaler'],
      notes: 'Slightly anxious around needles.'
    }
  },
  {
    id: 'cit_2',
    userId: 'user_2',
    firstName: 'Jane',
    lastName: 'Smith',
    address: '456 Vespucci Blvd, Los Santos',
    dateOfBirth: '1992-08-22',
    imageUrl: 'https://picsum.photos/seed/jane/200',
    gender: 'Female',
    height: "5'7\"",
    weight: "140 lbs",
    occupation: 'Lawyer',
    ssn: '987-65-4321',
    flags: ['Attorney'],
    addressFlags: ['Commercial'],
    medicalInfo: {
      bloodType: 'A-',
      allergies: [],
      conditions: [],
      medications: ['Prenatal Vitamins'],
      notes: 'Patient is 6 months pregnant.'
    }
  },
  {
    id: 'cit_3',
    userId: 'user_3',
    firstName: 'Mike',
    lastName: 'Johnson',
    address: '789 Grove St, Los Santos',
    dateOfBirth: '1985-12-03',
    imageUrl: 'https://picsum.photos/seed/mike/200',
    gender: 'Male',
    height: "5'11\"",
    weight: "175 lbs",
    occupation: 'Construction Worker',
    ssn: '456-78-9012',
    flags: ['Criminal Record'],
    addressFlags: ['Residential'],
    medicalInfo: {
      bloodType: 'B+',
      allergies: ['Dust'],
      conditions: ['Back Pain'],
      medications: ['Ibuprofen'],
      notes: 'Previous back injury from work.'
    }
  },
  {
    id: 'cit_4',
    userId: 'user_4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    address: '321 Vinewood Hills, Los Santos',
    dateOfBirth: '1988-07-14',
    imageUrl: 'https://picsum.photos/seed/sarah/200',
    gender: 'Female',
    height: "5'6\"",
    weight: "130 lbs",
    occupation: 'Teacher',
    ssn: '789-01-2345',
    flags: ['Teacher License'],
    addressFlags: ['Residential'],
    medicalInfo: {
      bloodType: 'AB+',
      allergies: ['Peanuts'],
      conditions: [],
      medications: ['EpiPen'],
      notes: 'Severe peanut allergy.'
    }
  }
];

// Моковые данные для блокнота записей
export const MOCK_NOTES: NotebookNote[] = [
  {
    id: 'note_1',
    title: 'Подозрительная активность на Grove Street',
    content: 'Замечена группа из 3-4 человек, которые регулярно собираются возле заброшенного здания на Grove Street. Возможная наркоторговля. Требуется дополнительное наблюдение.',
    author: 'Офицер Джонсон',
    category: 'surveillance',
    priority: 'medium',
    tags: ['grove street', 'наркоторговля', 'наблюдение'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'note_2',
    title: 'Расследование ограбления банка',
    content: 'Получена информация о планируемом ограблении банка Fleeca на Vinewood Blvd. Подозреваемые: 2-3 человека, вооружены. Требуется срочное расследование и подготовка к возможному инциденту.',
    author: 'Детектив Смит',
    category: 'investigation',
    priority: 'high',
    tags: ['ограбление', 'банк', 'fleeca', 'vinewood'],
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 'note_3',
    title: 'Арест подозреваемого в краже автомобиля',
    content: 'Арестован Майкл Родригес по подозрению в краже автомобиля Obey Tailgater. Автомобиль найден в гараже по адресу 123 Main St. Подозреваемый отрицает вину.',
    author: 'Офицер Уилсон',
    category: 'arrest',
    priority: 'medium',
    tags: ['арест', 'кража', 'автомобиль', 'obey tailgater'],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 'note_4',
    title: 'Предупреждение о превышении скорости',
    content: 'Выписано предупреждение водителю BMW M3 за превышение скорости на шоссе. Номер: 88ABC123. Водитель: Джейн Доу. Скорость: 85 mph в зоне 55 mph.',
    author: 'Офицер Браун',
    category: 'warning',
    priority: 'low',
    tags: ['превышение скорости', 'bmw m3', 'шоссе'],
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-12T11:30:00Z'
  },
  {
    id: 'note_5',
    title: 'Инцидент с подозрительным пакетом',
    content: 'Поступил звонок о подозрительном пакете возле торгового центра. Пакет оказался пустым, но инцидент потребовал эвакуации здания на 2 часа. Подозреваемый не найден.',
    author: 'Сержант Дэвис',
    category: 'incident',
    priority: 'high',
    tags: ['подозрительный пакет', 'эвакуация', 'торговый центр'],
    createdAt: '2024-01-11T16:45:00Z',
    updatedAt: '2024-01-11T18:20:00Z'
  }
];

// Типы инцидентов для LAW отчетов
export const INCIDENT_TYPES = [
  'Превышение скорости',
  'Нарушение ПДД',
  'Кража',
  'Грабеж',
  'Нападение',
  'Наркоторговля',
  'Незаконное хранение оружия',
  'Вандализм',
  'Нарушение общественного порядка',
  'Другие нарушения'
];

// Моковые данные для LAW отчетов
export const MOCK_LAW_REPORTS = [
  {
    id: 'law_report_1',
    citizenName: 'John Doe',
    incidentAddress: '123 Main St, Los Santos',
    incidentTime: '2024-01-15T14:30:00Z',
    incidentType: 'Превышение скорости',
    penalCode: '2-5. Reckless Driving',
    sanctionType: 'fine' as const,
    description: 'Водитель превысил скорость на 30 mph в зоне 55 mph. Остановлен на шоссе Del Perro.',
    suspectVehicle: {
      plate: '88ABC123',
      model: 'Obey Tailgater',
      color: 'Black',
      isImpounded: false,
      isStolen: false
    },
    seizedItems: [],
    suspectWeapon: undefined,
    createdAt: '2024-01-15T15:00:00Z',
    author: 'Офицер Джонсон'
  },
  {
    id: 'law_report_2',
    citizenName: 'Mike Johnson',
    incidentAddress: '456 Grove St, Los Santos',
    incidentTime: '2024-01-14T22:15:00Z',
    incidentType: 'Кража',
    penalCode: '1-1. Grand Theft Auto',
    sanctionType: 'arrest' as const,
    description: 'Подозреваемый похитил автомобиль BMW M3 с парковки торгового центра. Автомобиль найден через 2 часа.',
    suspectVehicle: {
      plate: '46PQR789',
      model: 'BMW M3',
      color: 'White',
      isImpounded: true,
      isStolen: true
    },
    seizedItems: ['Отмычки', 'Перчатки'],
    suspectWeapon: {
      serialNumber: 'SN123456789',
      model: 'Glock 17',
      type: 'Pistol',
      hasSerialNumber: true,
      isRegistered: false
    },
    createdAt: '2024-01-15T00:30:00Z',
    author: 'Детектив Смит'
  }
];

// Моковые данные для офицеров
export const MOCK_OFFICERS = [
  {
    id: 'officer_1',
    badgeNumber: '12345',
    callsign: '1-ADAM-12',
    firstName: 'Michael',
    lastName: 'Johnson',
    department: 'LSPD',
    subdivision: 'Patrol Division',
    rank: 'Police Officer I',
    qualifications: ['Patrol', 'Traffic', 'K-9'],
    status: 'active',
    hireDate: '2023-01-15',
    imageUrl: 'https://picsum.photos/seed/michael/200',
    phoneNumber: '+1-555-0123',
    email: 'michael.johnson@lspd.gov',
    supervisor: 'Sgt. Sarah Williams',
    notes: 'Excellent patrol officer, good communication skills.'
  },
  {
    id: 'officer_2',
    badgeNumber: '12346',
    callsign: '2-LINCOLN-5',
    firstName: 'Sarah',
    lastName: 'Williams',
    department: 'LSPD',
    subdivision: 'Patrol Division',
    rank: 'Sergeant',
    qualifications: ['Patrol', 'Supervisor', 'SWAT'],
    status: 'active',
    hireDate: '2020-03-22',
    imageUrl: 'https://picsum.photos/seed/sarah/200',
    phoneNumber: '+1-555-0124',
    email: 'sarah.williams@lspd.gov',
    supervisor: 'Lt. Robert Davis',
    notes: 'Experienced supervisor, leads by example.'
  },
  {
    id: 'officer_3',
    badgeNumber: '12347',
    callsign: '3-CHARLIE-7',
    firstName: 'David',
    lastName: 'Brown',
    department: 'BCSO',
    subdivision: 'Detective Division',
    rank: 'Detective',
    qualifications: ['Detective', 'Narcotics', 'Homicide'],
    status: 'active',
    hireDate: '2019-07-10',
    imageUrl: 'https://picsum.photos/seed/david/200',
    phoneNumber: '+1-555-0125',
    email: 'david.brown@bcso.gov',
    supervisor: 'Sgt. Jennifer Martinez',
    notes: 'Skilled detective, specializes in narcotics cases.'
  },
  {
    id: 'officer_4',
    badgeNumber: '12348',
    callsign: '4-DELTA-9',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    department: 'BCSO',
    subdivision: 'Detective Division',
    rank: 'Sergeant',
    qualifications: ['Detective', 'Supervisor', 'Internal Affairs'],
    status: 'active',
    hireDate: '2018-11-05',
    imageUrl: 'https://picsum.photos/seed/jennifer/200',
    phoneNumber: '+1-555-0126',
    email: 'jennifer.martinez@bcso.gov',
    supervisor: 'Lt. Thomas Wilson',
    notes: 'Experienced detective supervisor, handles complex cases.'
  },
  {
    id: 'officer_5',
    badgeNumber: '12349',
    callsign: '5-ECHO-3',
    firstName: 'Robert',
    lastName: 'Davis',
    department: 'LSPD',
    subdivision: 'Patrol Division',
    rank: 'Lieutenant',
    qualifications: ['Patrol', 'Supervisor', 'Administration'],
    status: 'active',
    hireDate: '2017-05-18',
    imageUrl: 'https://picsum.photos/seed/robert/200',
    phoneNumber: '+1-555-0127',
    email: 'robert.davis@lspd.gov',
    supervisor: 'Capt. Elizabeth Taylor',
    notes: 'Administrative lieutenant, oversees patrol operations.'
  },
  {
    id: 'officer_6',
    badgeNumber: '12350',
    callsign: '6-FOXTROT-1',
    firstName: 'Amanda',
    lastName: 'Garcia',
    department: 'LSPD',
    subdivision: 'SWAT Division',
    rank: 'Police Officer II',
    qualifications: ['SWAT', 'Patrol', 'Tactical'],
    status: 'active',
    hireDate: '2022-09-12',
    imageUrl: 'https://picsum.photos/seed/amanda/200',
    phoneNumber: '+1-555-0128',
    email: 'amanda.garcia@lspd.gov',
    supervisor: 'Sgt. Christopher Lee',
    notes: 'SWAT team member, excellent tactical skills.'
  },
  {
    id: 'officer_7',
    badgeNumber: '12351',
    callsign: '7-GOLF-4',
    firstName: 'Christopher',
    lastName: 'Lee',
    department: 'LSPD',
    subdivision: 'SWAT Division',
    rank: 'Sergeant',
    qualifications: ['SWAT', 'Supervisor', 'Tactical', 'K-9'],
    status: 'active',
    hireDate: '2019-12-03',
    imageUrl: 'https://picsum.photos/seed/christopher/200',
    phoneNumber: '+1-555-0129',
    email: 'christopher.lee@lspd.gov',
    supervisor: 'Lt. Robert Davis',
    notes: 'SWAT team leader, experienced in high-risk operations.'
  },
  {
    id: 'officer_8',
    badgeNumber: '12352',
    callsign: '8-HOTEL-6',
    firstName: 'Thomas',
    lastName: 'Wilson',
    department: 'BCSO',
    subdivision: 'Detective Division',
    rank: 'Lieutenant',
    qualifications: ['Detective', 'Supervisor', 'Administration'],
    status: 'active',
    hireDate: '2016-08-20',
    imageUrl: 'https://picsum.photos/seed/thomas/200',
    phoneNumber: '+1-555-0130',
    email: 'thomas.wilson@bcso.gov',
    supervisor: 'Capt. Richard Anderson',
    notes: 'Detective lieutenant, oversees major investigations.'
  }
];

// Моковые данные для журнала смен
export const MOCK_SHIFT_LOG = [
  {
    id: 'shift_1',
    officerId: 'officer_1',
    officerName: 'Michael Johnson',
    callsign: '1-ADAM-12',
    startTime: '2024-01-15T08:00:00Z',
    endTime: '2024-01-15T16:00:00Z',
    totalHours: 8,
    status: 'completed',
    notes: 'Regular patrol shift, no incidents.'
  },
  {
    id: 'shift_2',
    officerId: 'officer_2',
    officerName: 'Sarah Williams',
    callsign: '2-LINCOLN-5',
    startTime: '2024-01-15T16:00:00Z',
    endTime: '2024-01-16T00:00:00Z',
    totalHours: 8,
    status: 'completed',
    notes: 'Evening shift, handled traffic stop.'
  },
  {
    id: 'shift_3',
    officerId: 'officer_3',
    officerName: 'David Brown',
    callsign: '3-CHARLIE-7',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T17:00:00Z',
    totalHours: 8,
    status: 'completed',
    notes: 'Detective work, case investigation.'
  },
  {
    id: 'shift_4',
    officerId: 'officer_1',
    officerName: 'Michael Johnson',
    callsign: '1-ADAM-12',
    startTime: '2024-01-16T08:00:00Z',
    endTime: null,
    totalHours: 0,
    status: 'active',
    notes: 'Current shift in progress.'
  }
];

// Моковые данные для штрафстоянок
export const MOCK_IMPOUND_LOTS: ImpoundLot[] = [
  {
    id: 'lot_1',
    name: 'Los Santos Central Impound',
    address: '1234 Industrial Blvd, Los Santos',
    phone: '+1-555-0100',
    capacity: 150,
    currentVehicles: 87,
    manager: 'James Wilson',
    status: 'active'
  },
  {
    id: 'lot_2',
    name: 'Blaine County Impound',
    address: '5678 Sandy Shores Rd, Blaine County',
    phone: '+1-555-0200',
    capacity: 75,
    currentVehicles: 42,
    manager: 'Maria Rodriguez',
    status: 'active'
  },
  {
    id: 'lot_3',
    name: 'Vinewood Impound',
    address: '9012 Vinewood Blvd, Los Santos',
    phone: '+1-555-0300',
    capacity: 100,
    currentVehicles: 23,
    manager: 'Robert Davis',
    status: 'active'
  }
];

export const MOCK_IMPOUNDED_VEHICLES: ImpoundedVehicle[] = [
  {
    id: 'imp_1',
    plate: '88ABC123',
    vin: '1HGBH41JXMN109186',
    model: 'Obey Tailgater',
    color: 'Black',
    ownerName: 'John Doe',
    ownerId: 'cit_1',
    impoundLotId: 'lot_1',
    impoundLotName: 'Los Santos Central Impound',
    impoundDate: '2024-01-10T14:30:00Z',
    impoundReason: 'Illegal parking in restricted zone',
    impoundingOfficer: 'Michael Johnson',
    officerId: 'officer_1',
    fees: 250,
    status: 'impounded',
    location: '123 Main St, Los Santos',
    evidence: false,
    stolen: false,
    damage: 'Minor scratch on passenger door',
    notes: 'Vehicle was blocking emergency vehicle access'
  },
  {
    id: 'imp_2',
    plate: '46PQR789',
    vin: '2T1BURHE0JC123456',
    model: 'Bravado Buffalo',
    color: 'White',
    ownerName: 'Jane Smith',
    ownerId: 'cit_2',
    impoundLotId: 'lot_1',
    impoundLotName: 'Los Santos Central Impound',
    impoundDate: '2024-01-12T09:15:00Z',
    impoundReason: 'Stolen vehicle recovery',
    impoundingOfficer: 'Sarah Williams',
    officerId: 'officer_2',
    releaseDate: '2024-01-13T16:45:00Z',
    releaseOfficer: 'David Brown',
    releaseReason: 'Owner claimed vehicle',
    fees: 500,
    status: 'released',
    location: '456 Vespucci Blvd, Los Santos',
    evidence: true,
    stolen: true,
    damage: 'Severe damage to front end',
    notes: 'Vehicle was involved in robbery, evidence collected'
  },
  {
    id: 'imp_3',
    plate: 'XY1234Z',
    vin: '3VWDX7AJ5DM123789',
    model: 'Dinka Jester',
    color: 'Red',
    ownerName: 'Unknown',
    ownerId: 'unknown',
    impoundLotId: 'lot_2',
    impoundLotName: 'Blaine County Impound',
    impoundDate: '2024-01-14T22:00:00Z',
    impoundReason: 'Abandoned vehicle',
    impoundingOfficer: 'Christopher Lee',
    officerId: 'officer_7',
    fees: 300,
    status: 'impounded',
    location: 'Highway 68, Blaine County',
    evidence: false,
    stolen: false,
    damage: 'Engine failure',
    notes: 'Vehicle found abandoned on highway, no registration found'
  },
  {
    id: 'imp_4',
    plate: 'ABC567',
    vin: '4T1BF1FK5CU123456',
    model: 'Karin Sultan',
    color: 'Blue',
    ownerName: 'Mike Johnson',
    ownerId: 'cit_3',
    impoundLotId: 'lot_3',
    impoundLotName: 'Vinewood Impound',
    impoundDate: '2024-01-15T11:20:00Z',
    impoundReason: 'DUI arrest',
    impoundingOfficer: 'Thomas Wilson',
    officerId: 'officer_8',
    fees: 750,
    status: 'impounded',
    location: 'Vinewood Blvd & Hollywood Blvd',
    evidence: true,
    stolen: false,
    damage: 'Minor damage to driver side',
    notes: 'Driver arrested for DUI, vehicle impounded as evidence'
  }
];