import type { Meta, StoryObj } from '@storybook/react';
import { CitizenCard } from './CitizenCard';
import type { Citizen } from '@/shared/types';

const meta: Meta<typeof CitizenCard> = {
  title: 'Entities/Citizen/CitizenCard',
  component: CitizenCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showActions: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Моковые данные для Citizen
const mockCitizen: Citizen = {
  id: '1',
  name: 'Иван',
  surname: 'Петров',
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: 'Сергеевич',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  address: 'ул. Ленина, 123, Москва, Московская область, 123456',
  phoneNumber: '+7 (999) 123-45-67',
  occupation: 'Инженер',
  photoUrl: 'https://via.placeholder.com/150',
  ssn: '123-45-6789',
  flags: ['VIP', 'Verified'],
  addressFlags: ['Residential'],
  // Дополнительные поля для совместимости с компонентом
  phone: '+7 (999) 123-45-67',
  email: 'ivan.petrov@email.com',
  licenseNumber: 'ABC123456',
  licenseStatus: 'valid',
  criminalRecord: [],
  medicalInfo: {
    id: '1',
    citizenId: '1',
    bloodType: 'A+',
    allergies: ['Пенициллин', 'Пыльца'],
    conditions: ['Астма'],
    medications: ['Ингалятор'],
  },
  emergencyContacts: [
    {
      id: '1',
      citizenId: '1',
      name: 'Мария Петрова',
      relationship: 'Жена',
      phone: '+7 (999) 987-65-43',
      address: 'ул. Ленина, 123, Москва',
    },
    {
      id: '2',
      citizenId: '1',
      name: 'Сергей Петров',
      relationship: 'Отец',
      phone: '+7 (999) 111-22-33',
      address: 'ул. Пушкина, 45, Москва',
    },
  ],
  employment: {
    id: '1',
    citizenId: '1',
    employer: 'ООО "Технологии будущего"',
    position: 'Старший инженер',
    startDate: '2020-01-15',
    salary: 120000,
  },
};

const mockCitizenWithCriminalRecord: Citizen = {
  ...mockCitizen,
  id: '2',
  name: 'Алексей',
  surname: 'Сидоров',
  firstName: 'Алексей',
  lastName: 'Сидоров',
  licenseStatus: 'suspended',
  criminalRecord: [
    {
      id: '1',
      citizenId: '2',
      offense: 'Нарушение ПДД',
      date: '2023-03-15',
      severity: 'misdemeanor',
      status: 'active',
    },
  ],
};

const mockCitizenWithMedicalIssues: Citizen = {
  ...mockCitizen,
  id: '3',
  name: 'Елена',
  surname: 'Козлова',
  firstName: 'Елена',
  lastName: 'Козлова',
  gender: 'female',
  medicalInfo: {
    id: '3',
    citizenId: '3',
    bloodType: 'O-',
    allergies: ['Орехи', 'Молоко', 'Пыльца', 'Шерсть животных'],
    conditions: ['Диабет', 'Гипертония', 'Астма'],
    medications: ['Инсулин', 'Аспирин', 'Ингалятор'],
  },
};

export const Default: Story = {
  args: {
    citizen: mockCitizen,
  },
};

export const WithActions: Story = {
  args: {
    citizen: mockCitizen,
    showActions: true,
    onEdit: (citizen) => console.log('Edit citizen:', citizen),
    onDelete: (citizen) => console.log('Delete citizen:', citizen),
  },
};

export const WithoutActions: Story = {
  args: {
    citizen: mockCitizen,
    showActions: false,
  },
};

export const WithCriminalRecord: Story = {
  args: {
    citizen: mockCitizenWithCriminalRecord,
  },
};

export const WithMedicalIssues: Story = {
  args: {
    citizen: mockCitizenWithMedicalIssues,
  },
};

export const WithExpiredLicense: Story = {
  args: {
    citizen: {
      ...mockCitizen,
      id: '4',
      name: 'Дмитрий',
      surname: 'Волков',
      firstName: 'Дмитрий',
      lastName: 'Волков',
      licenseStatus: 'expired',
    },
  },
};

export const WithRevokedLicense: Story = {
  args: {
    citizen: {
      ...mockCitizen,
      id: '5',
      name: 'Анна',
      surname: 'Морозова',
      firstName: 'Анна',
      lastName: 'Морозова',
      gender: 'female',
      licenseStatus: 'revoked',
    },
  },
};

export const InteractiveCard: Story = {
  args: {
    citizen: mockCitizen,
    onClick: (citizen) => {
      console.log('Citizen clicked:', citizen);
      alert(`Выбран гражданин: ${citizen.name} ${citizen.surname}`);
    },
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
      <CitizenCard citizen={mockCitizen} />
      <CitizenCard citizen={mockCitizenWithCriminalRecord} />
      <CitizenCard citizen={mockCitizenWithMedicalIssues} />
    </div>
  ),
};

export const CompactView: Story = {
  args: {
    citizen: mockCitizen,
    className: 'max-w-sm',
  },
};

export const LargeView: Story = {
  args: {
    citizen: mockCitizen,
    className: 'max-w-2xl',
  },
}; 