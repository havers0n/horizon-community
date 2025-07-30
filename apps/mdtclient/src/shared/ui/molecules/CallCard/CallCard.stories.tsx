import type { Meta, StoryObj } from '@storybook/react';
import { CallCard } from './CallCard';

const meta: Meta<typeof CallCard> = {
  title: 'Molecules/CallCard',
  component: CallCard,
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

const sampleCall = {
  id: '1',
  callNumber: '911-001',
  priority: 'high' as const,
  status: 'pending' as const,
  type: 'Traffic Stop',
  address: '123 Main St, Downtown LA',
  description: 'Подозрительный автомобиль, водитель ведет себя неадекватно',
  caller: 'Анонимный звонок',
  callerPhone: '+1 (555) 999-8888',
  units: ['1A-12', '1B-15'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:32:00Z',
  coordinates: { lat: 34.0522, lng: -118.2437 },
};

const sampleCalls = [
  {
    id: '1',
    callNumber: '911-001',
    priority: 'critical' as const,
    status: 'pending' as const,
    type: 'Armed Robbery',
    address: '456 Bank St, Downtown LA',
    description: 'Вооруженное ограбление банка, несколько подозреваемых',
    caller: 'Охранник банка',
    callerPhone: '+1 (555) 111-2222',
    units: ['1A-12', '1B-15', '1C-22'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:32:00Z',
  },
  {
    id: '2',
    callNumber: '911-002',
    priority: 'high' as const,
    status: 'dispatched' as const,
    type: 'Traffic Accident',
    address: '789 Highway 101, Hollywood',
    description: 'ДТП с участием трех автомобилей, есть пострадавшие',
    caller: 'Свидетель ДТП',
    callerPhone: '+1 (555) 333-4444',
    units: ['1D-33', 'EMS-01'],
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:37:00Z',
  },
  {
    id: '3',
    callNumber: '911-003',
    priority: 'medium' as const,
    status: 'enroute' as const,
    type: 'Domestic Disturbance',
    address: '321 Residential Ave, West LA',
    description: 'Семейный конфликт, слышны крики и шум',
    caller: 'Сосед',
    callerPhone: '+1 (555) 555-6666',
    units: ['1E-44'],
    createdAt: '2024-01-15T10:40:00Z',
    updatedAt: '2024-01-15T10:42:00Z',
  },
  {
    id: '4',
    callNumber: '911-004',
    priority: 'low' as const,
    status: 'onscene' as const,
    type: 'Noise Complaint',
    address: '654 Party St, East LA',
    description: 'Жалоба на шум, громкая музыка',
    caller: 'Житель дома',
    callerPhone: '+1 (555) 777-8888',
    units: ['1F-55'],
    createdAt: '2024-01-15T10:45:00Z',
    updatedAt: '2024-01-15T10:50:00Z',
  },
];

export const Default: Story = {
  args: {
    call: sampleCall,
  },
};

export const Compact: Story = {
  args: {
    call: sampleCall,
    compact: true,
  },
};

export const WithoutActions: Story = {
  args: {
    call: sampleCall,
    showActions: false,
  },
};

export const AllPriorities: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleCalls.map(call => (
        <CallCard
          key={call.id}
          call={call}
          onSelect={(call) => console.log('Selected call:', call.callNumber)}
          onAssign={(call) => console.log('Assigning call:', call.callNumber)}
          onUpdate={(call) => console.log('Updating call:', call.callNumber)}
        />
      ))}
    </div>
  ),
};

export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sampleCalls.map(call => (
        <CallCard
          key={call.id}
          call={call}
          compact={true}
          onSelect={(call) => console.log('Selected call:', call.callNumber)}
        />
      ))}
    </div>
  ),
};

export const WithoutCaller: Story = {
  args: {
    call: {
      ...sampleCall,
      caller: undefined,
      callerPhone: undefined,
    },
  },
};

export const WithoutUnits: Story = {
  args: {
    call: {
      ...sampleCall,
      units: undefined,
    },
  },
};

export const MinimalData: Story = {
  args: {
    call: {
      id: '5',
      callNumber: '911-005',
      priority: 'medium' as const,
      status: 'completed' as const,
      type: 'Information Call',
      address: '999 Info Blvd',
      description: 'Информационный звонок',
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:05:00Z',
    },
  },
};

export const DifferentCallTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CallCard
        call={{
          ...sampleCall,
          id: '6',
          callNumber: '911-006',
          type: 'Fire Alarm',
          description: 'Сработала пожарная сигнализация в здании',
        }}
      />
      <CallCard
        call={{
          ...sampleCall,
          id: '7',
          callNumber: '911-007',
          type: 'Medical Emergency',
          description: 'Человек потерял сознание на улице',
        }}
      />
      <CallCard
        call={{
          ...sampleCall,
          id: '8',
          callNumber: '911-008',
          type: 'Suspicious Activity',
          description: 'Подозрительная активность в парке',
        }}
      />
      <CallCard
        call={{
          ...sampleCall,
          id: '9',
          callNumber: '911-009',
          type: 'Vehicle Theft',
          description: 'Кража автомобиля с парковки',
        }}
      />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    call: sampleCall,
  },
  parameters: {
    docs: {
      description: {
        story: 'Карточка с обработчиками событий. Проверьте консоль для логов.',
      },
    },
  },
};
