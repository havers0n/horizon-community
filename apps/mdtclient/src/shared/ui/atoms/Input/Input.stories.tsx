import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Search, Mail, Lock, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@email.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Пароль',
    placeholder: 'Введите пароль',
    type: 'password',
    helperText: 'Минимум 8 символов',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@email.com',
    type: 'email',
    error: 'Неверный формат email',
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Поиск...',
    leftIcon: <Search className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: 'Введите email',
    rightIcon: <Mail className="h-4 w-4" />,
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Маленький инпут',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Большой инпут',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Отключенный инпут',
    disabled: true,
  },
};

export const Success: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@email.com',
    variant: 'success',
    helperText: 'Email подтвержден',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Default" placeholder="Default input" />
      <Input label="Error" placeholder="Error input" error="Ошибка валидации" />
      <Input label="Success" placeholder="Success input" variant="success" helperText="Успешно" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input placeholder="Small input" size="sm" />
      <Input placeholder="Medium input" size="md" />
      <Input placeholder="Large input" size="lg" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input placeholder="Поиск..." leftIcon={<Search className="h-4 w-4" />} />
      <Input placeholder="Email" leftIcon={<Mail className="h-4 w-4" />} />
      <Input placeholder="Пароль" leftIcon={<Lock className="h-4 w-4" />} type="password" />
      <Input placeholder="Имя пользователя" leftIcon={<User className="h-4 w-4" />} />
    </div>
  ),
}; 
