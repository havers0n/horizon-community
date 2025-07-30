import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Search, Plus, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Кнопка',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Кнопка',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Удалить',
    variant: 'danger',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Кнопка',
    variant: 'ghost',
  },
};

export const Outline: Story = {
  args: {
    children: 'Кнопка',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    children: 'Маленькая',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Большая',
    size: 'lg',
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Добавить',
    leftIcon: <Plus className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Удалить',
    rightIcon: <Trash2 className="h-4 w-4" />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Загрузка...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Отключена',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}; 
