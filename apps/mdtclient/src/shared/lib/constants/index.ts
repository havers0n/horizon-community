// @ts-nocheck - TODO: Remove after major refactoring is complete
import type { Unit, Citizen } from '@/shared/types';

export const MOCK_UNITS: Unit[] = [
  {
    id: '1',
    name: '1-ADAM-12',
    type: 'patrol',
    status: 'available',
    departmentId: 1,
    location: 'Downtown',
    lastUpdate: new Date().toISOString(),
    callsign: '1-ADAM-12'
  },
  {
    id: '2',
    name: '1-BOY-12',
    type: 'patrol',
    status: 'busy',
    departmentId: 1,
    location: 'Westside',
    lastUpdate: new Date().toISOString(),
    callsign: '1-BOY-12'
  },
  {
    id: '3',
    name: 'EMS-1',
    type: 'ems',
    status: 'available',
    departmentId: 2,
    location: 'Hospital',
    lastUpdate: new Date().toISOString(),
    callsign: 'EMS-1'
  }
];

export const MOCK_CITIZENS: Citizen[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    ssn: '123-45-6789',
    gender: 'male',
    ethnicity: 'Caucasian',
    hairColor: 'Brown',
    eyeColor: 'Blue',
    weight: 75,
    height: 180,
    address: '123 Main St',
    phoneNumber: '555-0123',
    occupation: 'Engineer',
    licenses: [],
    medicalRecord: {
      bloodType: 'A+',
      rhFactor: 'positive',
      allergies: [],
      chronicConditions: [],
      pastSurgeries: [],
      implants: []
    },
    legalRecords: [],
    vehicles: [],
    weapons: [],
    pets: [],
    ownerId: '1'
  }
];

export const MOCK_CITIZENS_EXTENDED = MOCK_CITIZENS;

export const DEPARTMENTS = [
  { id: 1, name: 'LSPD', fullName: 'Los Santos Police Department' },
  { id: 2, name: 'EMS', fullName: 'Emergency Medical Services' },
  { id: 3, name: 'LACoFD', fullName: 'Los Angeles County Fire Department' },
  { id: 4, name: 'Dispatch', fullName: 'Emergency Dispatch Center' }
];

export const UNIT_TYPES = [
  { value: 'patrol', label: 'Patrol' },
  { value: 'k9', label: 'K-9 Unit' },
  { value: 'swat', label: 'SWAT' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'detective', label: 'Detective' },
  { value: 'ems', label: 'EMS' },
  { value: 'fire', label: 'Fire' },
  { value: 'supervisor', label: 'Supervisor' }
];

export const UNIT_STATUSES = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'busy', label: 'Busy', color: 'yellow' },
  { value: 'enRoute', label: 'En Route', color: 'blue' },
  { value: 'onScene', label: 'On Scene', color: 'orange' },
  { value: 'unavailable', label: 'Unavailable', color: 'red' },
  { value: 'panic', label: 'Panic', color: 'red' }
];

export const CALL_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

export const CALL_TYPES = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'non-emergency', label: 'Non-Emergency' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'medical', label: 'Medical' },
  { value: 'fire', label: 'Fire' }
];

export function createNavigationMap() {
  return {
    police: [
      { id: 'dashboard', label: 'Dashboard', path: '/leo/dashboard' },
      { id: 'citizens', label: 'Citizens', path: '/leo/citizens' },
      { id: 'vehicles', label: 'Vehicles', path: '/leo/vehicles' },
      { id: 'weapons', label: 'Weapons', path: '/leo/weapons' },
      { id: 'reports', label: 'Reports', path: '/leo/reports' },
      { id: 'bolos', label: 'BOLOs', path: '/leo/bolos' }
    ],
    ems: [
      { id: 'dashboard', label: 'Dashboard', path: '/ems/dashboard' },
      { id: 'patients', label: 'Patients', path: '/ems/patients' },
      { id: 'calls', label: 'Calls', path: '/ems/calls' },
      { id: 'reports', label: 'Reports', path: '/ems/reports' }
    ],
    fire: [
      { id: 'dashboard', label: 'Dashboard', path: '/fd/dashboard' },
      { id: 'incidents', label: 'Incidents', path: '/fd/incidents' },
      { id: 'units', label: 'Units', path: '/fd/units' },
      { id: 'reports', label: 'Reports', path: '/fd/reports' }
    ],
    dispatch: [
      { id: 'dashboard', label: 'Dashboard', path: '/dispatch/dashboard' },
      { id: 'calls', label: 'Calls', path: '/dispatch/calls' },
      { id: 'units', label: 'Units', path: '/dispatch/units' },
      { id: 'bolos', label: 'BOLOs', path: '/dispatch/bolos' },
      { id: 'map', label: 'Map', path: '/dispatch/map' }
    ],
    civil: [
      { id: 'dashboard', label: 'Dashboard', path: '/civil/dashboard' },
      { id: 'citizens', label: 'Citizens', path: '/civil/citizens' },
      { id: 'vehicles', label: 'Vehicles', path: '/civil/vehicles' },
      { id: 'weapons', label: 'Weapons', path: '/civil/weapons' },
      { id: 'companies', label: 'Companies', path: '/civil/companies' },
      { id: 'cargo', label: 'Cargo', path: '/civil/cargo' }
    ]
  };
} 