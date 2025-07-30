import type { Meta, StoryObj } from '@storybook/react';
import { UnitCard } from './UnitCard';

const meta: Meta<typeof UnitCard> = {
  title: 'Molecules/UnitCard',
  component: UnitCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: { type: 'boolean' },
    },
    showActions: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUnit = {
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
  qualifications: ['TU', 'K-9', 'ASD'],
};

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
];

export const Default: Story = {
  args: {
    unit: sampleUnit,
  },
};

export const Compact: Story = {
  args: {
    unit: sampleUnit,
    compact: true,
  },
};

export const WithoutActions: Story = {
  args: {
    unit: sampleUnit,
    showActions: false,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleUnits.map(unit => (
        <UnitCard
          key={unit.id}
          unit={unit}
          onSelect={(unit) => console.log('Selected unit:', unit.callsign)}
          onCall={(unit) => console.log('Calling unit:', unit.callsign)}
          onTrack={(unit) => console.log('Tracking unit:', unit.callsign)}
        />
      ))}
    </div>
  ),
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sampleUnits.map(unit => (
        <UnitCard
          key={unit.id}
          unit={unit}
          compact={true}
          onSelect={(unit) => console.log('Selected unit:', unit.callsign)}
        />
      ))}
    </div>
  ),
};

export const WithoutPhone: Story = {
  args: {
    unit: {
      ...sampleUnit,
      phone: undefined,
    },
  },
};

export const WithoutVehicle: Story = {
  args: {
    unit: {
      ...sampleUnit,
      vehicle: undefined,
    },
  },
};

export const WithoutQualifications: Story = {
  args: {
    unit: {
      ...sampleUnit,
      qualifications: undefined,
    },
  },
};

export const MinimalData: Story = {
  args: {
    unit: {
      id: '5',
      callsign: '1E-44',
      name: 'Минимальные данные',
      status: 'offline' as const,
      department: 'LAPD',
      division: 'Patrol',
    },
  },
};

export const Interactive: Story = {
  args: {
    unit: sampleUnit,
  },
  parameters: {
    docs: {
      description: {
        story: 'Карточка с обработчиками событий. Проверьте консоль для логов.',
      },
    },
  },
};
