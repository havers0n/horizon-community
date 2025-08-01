import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default', 'secondary', 'destructive', 'outline', 'success', 
        'warning', 'error', 'info', 'glass', 'neon', 'tactical',
        'tacticalSuccess', 'tacticalWarning', 'tacticalDanger', 'tacticalInfo'
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Бейдж',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Вторичный',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Успех',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Предупреждение',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Ошибка',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Информация',
    variant: 'info',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Удалить',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Контур',
    variant: 'outline',
  },
};

export const Glass: Story = {
  args: {
    children: 'Стекло',
    variant: 'glass',
  },
};

export const Neon: Story = {
  args: {
    children: 'Неон',
    variant: 'neon',
  },
};

export const Small: Story = {
  args: {
    children: 'Маленький',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Большой',
    size: 'lg',
  },
};

export const TacticalVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="tactical">Тактический</Badge>
      <Badge variant="tacticalSuccess">Успех</Badge>
      <Badge variant="tacticalWarning">Предупреждение</Badge>
      <Badge variant="tacticalDanger">Опасность</Badge>
      <Badge variant="tacticalInfo">Информация</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">По умолчанию</Badge>
      <Badge variant="secondary">Вторичный</Badge>
      <Badge variant="success">Успех</Badge>
      <Badge variant="warning">Предупреждение</Badge>
      <Badge variant="error">Ошибка</Badge>
      <Badge variant="info">Информация</Badge>
      <Badge variant="destructive">Удалить</Badge>
      <Badge variant="outline">Контур</Badge>
      <Badge variant="glass">Стекло</Badge>
      <Badge variant="neon">Неон</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Маленький</Badge>
      <Badge size="md">Средний</Badge>
      <Badge size="lg">Большой</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Доступен</Badge>
      <Badge variant="warning">Занят</Badge>
      <Badge variant="info">В пути</Badge>
      <Badge variant="secondary">На месте</Badge>
      <Badge variant="error">Недоступен</Badge>
      <Badge variant="destructive">Паника</Badge>
    </div>
  ),
};

export const PriorityBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Низкий</Badge>
      <Badge variant="warning">Средний</Badge>
      <Badge variant="error">Высокий</Badge>
      <Badge variant="destructive">Экстренный</Badge>
    </div>
  ),
};

export const DepartmentBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="info">Полиция</Badge>
      <Badge variant="success">Скорая помощь</Badge>
      <Badge variant="error">Пожарная служба</Badge>
      <Badge variant="secondary">Диспетчерская</Badge>
      <Badge variant="outline">Гражданские</Badge>
    </div>
  ),
}; 