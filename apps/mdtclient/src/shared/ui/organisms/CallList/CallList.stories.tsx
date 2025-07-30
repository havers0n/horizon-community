import type { Meta, StoryObj } from '@storybook/react';
import { CallList } from './CallList';

const meta: Meta<typeof CallList> = {
  title: 'Organisms/CallList',
  component: CallList,
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
  {
    id: '5',
    callNumber: '911-005',
    priority: 'high' as const,
    status: 'completed' as const,
    type: 'Fire Alarm',
    address: '123 Business Blvd, Downtown LA',
    description: 'Сработала пожарная сигнализация в офисном здании',
    caller: 'Система безопасности',
    callerPhone: '+1 (555) 999-0000',
    units: ['FD-01', 'FD-02'],
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '6',
    callNumber: '911-006',
    priority: 'medium' as const,
    status: 'cancelled' as const,
    type: 'Medical Emergency',
    address: '456 Health St, West LA',
    description: 'Человек потерял сознание на улице',
    caller: 'Прохожий',
    callerPhone: '+1 (555) 111-3333',
    units: ['EMS-01'],
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
  },
];

export const Default: Story = {
  args: {
    calls: sampleCalls,
  },
};

export const Loading: Story = {
  args: {
    calls: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    calls: [],
    loading: false,
  },
};

export const WithoutFilters: Story = {
  args: {
    calls: sampleCalls,
    showFilters: false,
  },
};

export const WithoutViewToggle: Story = {
  args: {
    calls: sampleCalls,
    showViewToggle: false,
  },
};

export const Compact: Story = {
  args: {
    calls: sampleCalls,
    compact: true,
  },
};

export const Interactive: Story = {
  args: {
    calls: sampleCalls,
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
    calls: [
      ...sampleCalls,
      ...sampleCalls.map((call, index) => ({
        ...call,
        id: `${call.id}-copy-${index}`,
        callNumber: `${call.callNumber}-${index + 1}`,
        address: `${call.address} (${index + 1})`,
      })),
    ],
  },
};

export const DifferentCallTypes: Story = {
  args: {
    calls: [
      ...sampleCalls,
      {
        id: '7',
        callNumber: '911-007',
        priority: 'high' as const,
        status: 'pending' as const,
        type: 'Suspicious Activity',
        address: '789 Park Ave, Central LA',
        description: 'Подозрительная активность в парке, группа людей',
        caller: 'Анонимный звонок',
        callerPhone: undefined,
        units: ['1A-12'],
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
      },
      {
        id: '8',
        callNumber: '911-008',
        priority: 'medium' as const,
        status: 'dispatched' as const,
        type: 'Vehicle Theft',
        address: '321 Parking Lot, Downtown LA',
        description: 'Кража автомобиля с парковки торгового центра',
        caller: 'Владелец автомобиля',
        callerPhone: '+1 (555) 222-4444',
        units: ['1B-15'],
        createdAt: '2024-01-15T11:05:00Z',
        updatedAt: '2024-01-15T11:07:00Z',
      },
      {
        id: '9',
        callNumber: '911-009',
        priority: 'low' as const,
        status: 'enroute' as const,
        type: 'Information Call',
        address: '999 Info Blvd, East LA',
        description: 'Информационный звонок о подозрительном пакете',
        caller: 'Сотрудник магазина',
        callerPhone: '+1 (555) 333-5555',
        units: ['1C-22'],
        createdAt: '2024-01-15T11:10:00Z',
        updatedAt: '2024-01-15T11:12:00Z',
      },
    ],
  },
};
