import type { Meta, StoryObj } from '@storybook/react';
import { UnitList } from './UnitList';

const meta: Meta<typeof UnitList> = {
  title: 'Organisms/UnitList',
  component: UnitList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: { type: 'boolean' },
    },
    showFilters: {
      control: { type: 'boolean' },
    },
    showViewToggle: {
      control: { type: 'boolean' },
    },
    compact: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUnits = [
  {
    id: '1',
    callsign: '1A-12',
    name: 'Иван Петров',
    status: 'available' as const,
    department: 'LAPD',
    division: 'Patrol Division',
    location: 'Downtown LA',
    lastSeen: '2 мин назад',
    phone: '+1 (555) 123-4567',
    vehicle: 'Ford Crown Victoria #1234',
    qualifications: ['TU', 'K-9'],
  },
  {
    id: '2',
    callsign: '1B-15',
    name: 'Мария Сидорова',
    status: 'busy' as const,
    department: 'LAPD',
    division: 'Traffic Division',
    location: 'Hollywood',
    lastSeen: '5 мин назад',
    phone: '+1 (555) 234-5678',
    vehicle: 'Chevrolet Tahoe #5678',
    qualifications: ['ASD'],
  },
  {
    id: '3',
    callsign: '1C-22',
    name: 'Алексей Козлов',
    status: 'enroute' as const,
    department: 'LASD',
    division: 'SEB',
    location: 'East LA',
    lastSeen: '1 мин назад',
    phone: '+1 (555) 345-6789',
    vehicle: 'Dodge Charger #9012',
    qualifications: ['TU', 'ASD', 'K-9'],
  },
  {
    id: '4',
    callsign: '1D-33',
    name: 'Елена Волкова',
    status: 'unavailable' as const,
    department: 'LAPD',
    division: 'Detective Bureau',
    location: 'West LA',
    lastSeen: '15 мин назад',
    phone: '+1 (555) 456-7890',
    vehicle: 'Unmarked #3456',
    qualifications: ['Detective'],
  },
  {
    id: '5',
    callsign: '1E-44',
    name: 'Дмитрий Соколов',
    status: 'available' as const,
    department: 'LASD',
    division: 'Patrol',
    location: 'South LA',
    lastSeen: '3 мин назад',
    phone: '+1 (555) 567-8901',
    vehicle: 'Ford Explorer #7890',
    qualifications: ['TU'],
  },
  {
    id: '6',
    callsign: '1F-55',
    name: 'Анна Морозова',
    status: 'on-scene' as const,
    department: 'LAPD',
    division: 'SWAT',
    location: 'North LA',
    lastSeen: '10 мин назад',
    phone: '+1 (555) 678-9012',
    vehicle: 'SWAT Truck #3456',
    qualifications: ['SWAT', 'TU'],
  },
];

export const Default: Story = {
  args: {
    units: sampleUnits,
  },
};

export const Loading: Story = {
  args: {
    units: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    units: [],
    loading: false,
  },
};

export const WithoutFilters: Story = {
  args: {
    units: sampleUnits,
    showFilters: false,
  },
};

export const WithoutViewToggle: Story = {
  args: {
    units: sampleUnits,
    showViewToggle: false,
  },
};

export const Compact: Story = {
  args: {
    units: sampleUnits,
    compact: true,
  },
};

export const Interactive: Story = {
  args: {
    units: sampleUnits,
  },
  parameters: {
    docs: {
      description: {
        story: 'Список с обработчиками событий. Проверьте консоль для логов.',
      },
    },
  },
};

export const LargeDataset: Story = {
  args: {
    units: [
      ...sampleUnits,
      ...sampleUnits.map((unit, index) => ({
        ...unit,
        id: `${unit.id}-copy-${index}`,
        callsign: `${unit.callsign}-${index + 1}`,
        name: `${unit.name} (${index + 1})`,
      })),
    ],
  },
};

export const DifferentDepartments: Story = {
  args: {
    units: [
      ...sampleUnits,
      {
        id: '7',
        callsign: 'EMS-01',
        name: 'Сергей Иванов',
        status: 'available' as const,
        department: 'EMS',
        division: 'Emergency Medical',
        location: 'Central LA',
        lastSeen: '1 мин назад',
        phone: '+1 (555) 789-0123',
        vehicle: 'Ambulance #1234',
        qualifications: ['Paramedic'],
      },
      {
        id: '8',
        callsign: 'FD-01',
        name: 'Ольга Петрова',
        status: 'busy' as const,
        department: 'Fire Department',
        division: 'Fire Suppression',
        location: 'West LA',
        lastSeen: '8 мин назад',
        phone: '+1 (555) 890-1234',
        vehicle: 'Fire Engine #5678',
        qualifications: ['Firefighter'],
      },
    ],
  },
};
