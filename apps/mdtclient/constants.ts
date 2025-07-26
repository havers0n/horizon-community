
import type { Citizen, Vehicle, Bolo, MDTUnit, MDTCall911, Incident, PenalCode, MedicalInfo, MDTReport, ReportTemplate } from './types';
import { UserRole, UnitStatus } from './types';
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
  BookOpen
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
    { id: 'bolo_1', type: 'VEHICLE', description: 'White Bravado Buffalo, Plate: 46PQR789, involved in a robbery.', timestamp: new Date().toISOString() },
    { id: 'bolo_2', type: 'PERSON', description: 'Male, approx 6ft, wearing a red hoodie, last seen near Grove Street.', timestamp: new Date(Date.now() - 3600000).toISOString() },
];

export const MOCK_UNITS: MDTUnit[] = [
  { id: 'unit_1', name: '1-ADAM-12', department: 'LSPD', status: UnitStatus.AVAILABLE },
  { id: 'unit_2', name: '2-LINCOLN-5', department: 'BCSO', status: UnitStatus.EN_ROUTE, callId: 'call_1' },
  { id: 'unit_3', name: 'E-15', department: 'LSFD', status: UnitStatus.ON_SCENE, callId: 'call_2' },
  { id: 'unit_4', name: 'A-3', department: 'LSFD', status: UnitStatus.AVAILABLE },
];

export const MOCK_CALLS: MDTCall911[] = [
  { id: 'call_1', caller: 'Unknown', location: 'Intersection of Power St and Innocence Blvd', description: 'Reports of shots fired.', timestamp: new Date().toISOString(), assignedUnits: ['unit_2'] },
  { id: 'call_2', caller: 'Maria Rodriguez', location: '247 Vespucci Canals', description: 'Structure fire, possible entrapment.', timestamp: new Date(Date.now() - 600000).toISOString(), assignedUnits: ['unit_3'] },
  { id: 'call_3', caller: 'Anonymous', location: 'Del Perro Pier', description: 'Suspicious person looking into cars.', timestamp: new Date(Date.now() - 1200000).toISOString(), assignedUnits: [] },
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

export const REPORT_TEMPLATES: ReportTemplate[] = [
    {
        type: 'Arrest',
        title: 'Рапорт об аресте: [Имя Фамилия]',
        content: `**1. ДЕТАЛИ АРЕСТА**\nДата: \nВремя: \nМесто: \n\n**2. ИНФОРМАЦИЯ О ЗАДЕРЖАННОМ**\nИмя: \nФамилия: \nДата рождения: \n\n**3. ОБВИНЕНИЯ**\n- \n- \n\n**4. ОПИСАНИЕ ИНЦИДЕНТА**\n[Подробное описание событий, приведших к аресту.]\n\n**5. ИЗЪЯТЫЕ ПРЕДМЕТЫ**\n- \n\n**6. ЗАЯВЛЕНИЕ ОФИЦЕРА**\n[Имя офицера]`
    },
    {
        type: 'Incident',
        title: 'Рапорт об инциденте: [Тип инцидента]',
        content: `**1. ТИП ИНЦИДЕНТА:** \n**2. ДАТА/ВРЕМЯ:** \n**3. МЕСТО:** \n\n**4. УЧАСТВУЮЩИЕ ЮНИТЫ:**\n- \n\n**5. ВОВЛЕЧЕННЫЕ ЛИЦА:**\n- \n\n**6. ХРОНОЛОГИЯ СОБЫТИЙ:**\n[Подробное описание инцидента от начала до конца.]\n\n**7. РЕЗУЛЬТАТ:**\n[Чем завершился инцидент.]`
    },
    {
        type: 'Medical',
        title: 'Медицинский рапорт (PCR): [Имя пациента]',
        content: `**PATIENT CARE REPORT**\n\n**1. PATIENT INFORMATION**\nName: \nDOB: \nAge: \nGender: \n\n**2. DISPATCH INFORMATION**\nCall Location: \nChief Complaint: \n\n**3. ASSESSMENT (S.O.A.P.)**\n**S (Subjective):**\n[What the patient tells you.]\n\n**O (Objective):**\n- Vitals (HR, BP, RR, SpO2): \n- GCS: \n- Physical Findings: \n\n**A (Assessment):**\n[Your professional assessment of the patient's condition.]\n\n**P (Plan):**\n- Treatment Provided: \n- Transport Decision: \n\n**4. NARRATIVE**\n[A detailed, chronological account of the call from dispatch to transfer of care.]\n\n**5. CREW**\n[Responding unit and personnel.]`
    }
];


// Функция для создания навигации с поддержкой локализации
export const createNavigationMap = (t: (key: string) => string) => ({
  [UserRole.CITIZEN]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.citizens'), icon: Users, href: '#' },
    { name: t('navigation.cargoLog'), icon: Truck, href: '#' },
    { name: t('navigation.companies'), icon: Building, href: '#' },
    { name: t('navigation.pets'), icon: Heart, href: '#' },
    { name: t('navigation.codes'), icon: BookOpen, href: '#' },
  ],
  [UserRole.LEO]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.activeIncidents'), icon: Siren, href: '#' },
    { name: t('navigation.penalCodes'), icon: Gavel, href: '#' },
    { name: t('navigation.reports'), icon: FileText, href: '#' },
  ],
  [UserRole.EMS_FD]: [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, href: '#' },
    { name: t('navigation.patientSearch'), icon: Handshake, href: '#' },
    { name: t('navigation.activeCalls'), icon: Ambulance, href: '#' },
    { name: t('navigation.reports'), icon: FileText, href: '#' },
  ],
  [UserRole.DISPATCH]: [
    { name: t('navigation.controlCenter'), icon: Radio, href: '#' },
    { name: t('navigation.activeIncidents'), icon: Siren, href: '#' },
    { name: t('navigation.manageBolos'), icon: ClipboardList, href: '#' },
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