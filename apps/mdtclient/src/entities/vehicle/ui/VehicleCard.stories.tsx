import type { Meta, StoryObj } from '@storybook/react';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '@/shared/types';

const meta: Meta<typeof VehicleCard> = {
  title: 'Entities/Vehicle/VehicleCard',
  component: VehicleCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Моковые данные для Vehicle
const mockVehicle: Vehicle = {
  id: '1',
  ownerId: '1',
  plate: 'А123БВ77',
  vin: '1HGBH41JXMN109186',
  model: 'Civic',
  color: 'Синий',
  registration: 'valid',
  insurance: 'valid',
  // Дополнительные поля для совместимости с компонентом
  plateNumber: 'А123БВ77',
  make: 'Honda',
  year: 2020,
  bodyType: 'Седан',
  mileage: 45000,
  engineSize: '2.0L',
  registrationStatus: 'active',
  insuranceStatus: 'active',
  registrationExpiry: '2025-12-31',
  stolen: false,
  owner: {
    name: 'Иван Петров',
    phone: '+7 (999) 123-45-67',
  },
};

const mockStolenVehicle: Vehicle = {
  ...mockVehicle,
  id: '2',
  plate: 'В456ГД77',
  plateNumber: 'В456ГД77',
  make: 'Toyota',
  model: 'Camry',
  stolen: true,
  registrationStatus: 'suspended',
  owner: {
    name: 'Алексей Сидоров',
    phone: '+7 (999) 987-65-43',
  },
};

const mockExpiredVehicle: Vehicle = {
  ...mockVehicle,
  id: '3',
  plate: 'Е789ЖЗ77',
  plateNumber: 'Е789ЖЗ77',
  make: 'Ford',
  model: 'Focus',
  registrationStatus: 'expired',
  insuranceStatus: 'expired',
  registrationExpiry: '2023-06-15',
  owner: {
    name: 'Елена Козлова',
    phone: '+7 (999) 555-44-33',
  },
};

const mockLuxuryVehicle: Vehicle = {
  ...mockVehicle,
  id: '4',
  plate: 'И012КЛ77',
  plateNumber: 'И012КЛ77',
  make: 'BMW',
  model: 'X5',
  year: 2023,
  bodyType: 'Внедорожник',
  mileage: 15000,
  engineSize: '3.0L',
  color: 'Черный',
  owner: {
    name: 'Дмитрий Волков',
    phone: '+7 (999) 111-22-33',
  },
};

export const Default: Story = {
  args: {
    vehicle: mockVehicle,
  },
};

export const Compact: Story = {
  args: {
    vehicle: mockVehicle,
    variant: 'compact',
  },
};

export const StolenVehicle: Story = {
  args: {
    vehicle: mockStolenVehicle,
  },
};

export const ExpiredRegistration: Story = {
  args: {
    vehicle: mockExpiredVehicle,
  },
};

export const LuxuryVehicle: Story = {
  args: {
    vehicle: mockLuxuryVehicle,
  },
};

export const WithActions: Story = {
  args: {
    vehicle: mockVehicle,
    onViewDetails: (vehicle) => {
      console.log('View details:', vehicle);
      alert(`Просмотр деталей: ${vehicle.make} ${vehicle.model}`);
    },
    onEdit: (vehicle) => {
      console.log('Edit vehicle:', vehicle);
      alert(`Редактирование: ${vehicle.make} ${vehicle.model}`);
    },
  },
};

export const CompactWithActions: Story = {
  args: {
    vehicle: mockVehicle,
    variant: 'compact',
    onViewDetails: (vehicle) => {
      console.log('View details:', vehicle);
      alert(`Просмотр деталей: ${vehicle.make} ${vehicle.model}`);
    },
  },
};

export const MultipleVehicles: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
      <VehicleCard vehicle={mockVehicle} />
      <VehicleCard vehicle={mockStolenVehicle} />
      <VehicleCard vehicle={mockExpiredVehicle} />
      <VehicleCard vehicle={mockLuxuryVehicle} />
    </div>
  ),
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-6xl">
      <VehicleCard vehicle={mockVehicle} variant="compact" />
      <VehicleCard vehicle={mockStolenVehicle} variant="compact" />
      <VehicleCard vehicle={mockExpiredVehicle} variant="compact" />
      <VehicleCard vehicle={mockLuxuryVehicle} variant="compact" />
    </div>
  ),
};

export const InteractiveCard: Story = {
  args: {
    vehicle: mockVehicle,
    onViewDetails: (vehicle) => {
      console.log('Vehicle clicked:', vehicle);
      alert(`Выбрано транспортное средство: ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`);
    },
  },
};

export const DifferentStatuses: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-2xl">
      <VehicleCard 
        vehicle={{
          ...mockVehicle,
          registrationStatus: 'active',
          insuranceStatus: 'active',
        }} 
      />
      <VehicleCard 
        vehicle={{
          ...mockVehicle,
          plateNumber: 'П456РС77',
          registrationStatus: 'expired',
          insuranceStatus: 'expired',
        }} 
      />
      <VehicleCard 
        vehicle={{
          ...mockVehicle,
          plateNumber: 'С789ТУ77',
          registrationStatus: 'suspended',
          insuranceStatus: 'none',
        }} 
      />
    </div>
  ),
}; 