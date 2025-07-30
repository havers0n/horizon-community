// Константы для правоохранительной деятельности

export const INCIDENT_TYPES = [
  'Нарушение ПДД',
  'Кража',
  'Нападение',
  'Наркотики',
  'Оружие',
  'ДТП',
  'Нарушение общественного порядка',
  'Другое'
];

export const MOCK_PENAL_CODES = [
  {
    id: '1',
    title: 'Превышение скорости',
    fine: 500,
    jailTime: 0,
    description: 'Превышение установленной скорости движения'
  },
  {
    id: '2',
    title: 'Проезд на красный свет',
    fine: 300,
    jailTime: 0,
    description: 'Проезд перекрестка на запрещающий сигнал светофора'
  },
  {
    id: '3',
    title: 'Кража',
    fine: 2000,
    jailTime: 30,
    description: 'Хищение чужого имущества'
  },
  {
    id: '4',
    title: 'Нападение',
    fine: 1500,
    jailTime: 45,
    description: 'Нападение на другого человека'
  },
  {
    id: '5',
    title: 'Хранение наркотиков',
    fine: 3000,
    jailTime: 60,
    description: 'Незаконное хранение наркотических веществ'
  },
  {
    id: '6',
    title: 'Незаконное хранение оружия',
    fine: 5000,
    jailTime: 90,
    description: 'Хранение оружия без соответствующего разрешения'
  }
];

export const MOCK_CITIZENS_EXTENDED = [
  {
    id: 'cit_1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    address: '123 Main St, Los Santos',
    imageUrl: 'https://picsum.photos/seed/john/200',
    gender: 'Male',
    weight: 'Brown',
    height: 'Blue',
    occupation: 'Mechanic',
    ssn: '123-45-6789',
    flags: ['VIP', 'Known Criminal'],
    addressFlags: ['High Crime Area']
  },
  {
    id: 'cit_2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1992-08-22',
    address: '456 Vespucci Blvd, Los Santos',
    imageUrl: 'https://picsum.photos/seed/jane/200',
    gender: 'Female',
    weight: 'Blonde',
    height: 'Green',
    occupation: 'Lawyer',
    ssn: '987-65-4321',
    flags: ['VIP'],
    addressFlags: []
  }
];

export const MOCK_VEHICLES = [
  {
    id: 'veh_1',
    ownerId: 'cit_1',
    plate: '88ABC123',
    vin: '1HGBH41JXMN109186',
    model: 'Obey Tailgater',
    color: 'Black',
    registration: 'valid',
    insurance: 'valid'
  },
  {
    id: 'veh_2',
    ownerId: 'cit_2',
    plate: '46PQR789',
    vin: '2T1BURHE0JC123456',
    model: 'Bravado Buffalo',
    color: 'White',
    registration: 'valid',
    insurance: 'valid'
  }
];

export const MOCK_WEAPONS = [
  {
    id: 'weapon_1',
    ownerId: 'cit_1',
    serialNumber: 'SN123456789',
    model: 'Glock 17',
    type: 'Pistol',
    caliber: '9mm',
    status: 'registered',
    registrationDate: '2023-01-15',
    notes: 'Valid license'
  },
  {
    id: 'weapon_2',
    ownerId: 'cit_2',
    serialNumber: 'SN987654321',
    model: 'Remington 870',
    type: 'Shotgun',
    caliber: '12 gauge',
    status: 'registered',
    registrationDate: '2023-03-20',
    notes: 'Hunting license'
  }
];

export const MOCK_PETS = [
  {
    id: 'pet_1',
    ownerId: 'cit_1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    color: 'Golden',
    weight: '70 lbs',
    ownerName: 'John Doe',
    registrationDate: '2022-06-10',
    medicalRecords: ['Vaccinated', 'Neutered'],
    notes: 'Friendly dog, good with children'
  },
  {
    id: 'pet_2',
    ownerId: 'cit_2',
    name: 'Whiskers',
    breed: 'Persian Cat',
    color: 'White',
    weight: '12 lbs',
    ownerName: 'Jane Smith',
    registrationDate: '2022-09-15',
    medicalRecords: ['Vaccinated', 'Spayed'],
    notes: 'Indoor cat, shy around strangers'
  }
];