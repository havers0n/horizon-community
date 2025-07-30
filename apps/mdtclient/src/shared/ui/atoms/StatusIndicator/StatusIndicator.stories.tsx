import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from './StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Atoms/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['available', 'unavailable', 'busy', 'enroute', 'on-scene', 'offline', 'panic', 'custom'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    animated: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'available',
    size: 'md',
    children: 'Доступен',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatusIndicator variant="available" children="Доступен" />
        <StatusIndicator variant="unavailable" children="Недоступен" />
        <StatusIndicator variant="busy" children="Занят" />
        <StatusIndicator variant="enroute" children="В пути" />
        <StatusIndicator variant="on-scene" children="На месте" />
        <StatusIndicator variant="offline" children="Офлайн" />
        <StatusIndicator variant="panic" children="ПАНИКА" />
        <StatusIndicator variant="custom" customColor="#8B5CF6" children="Кастомный" />
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <StatusIndicator variant="available" size="sm" children="Маленький" />
        <StatusIndicator variant="available" size="md" children="Средний" />
        <StatusIndicator variant="available" size="lg" children="Большой" />
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatusIndicator variant="available" animated children="Анимированный" />
        <StatusIndicator variant="panic" children="Паника (автоанимация)" />
        <StatusIndicator variant="custom" customColor="#F59E0B" animated children="Кастомный анимированный" />
      </div>
    </div>
  ),
};

export const WithoutText: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        <StatusIndicator variant="available" size="sm" />
        <StatusIndicator variant="unavailable" size="sm" />
        <StatusIndicator variant="busy" size="sm" />
        <StatusIndicator variant="enroute" size="sm" />
        <StatusIndicator variant="on-scene" size="sm" />
        <StatusIndicator variant="offline" size="sm" />
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatusIndicator variant="custom" customColor="#10B981" children="Успех" />
        <StatusIndicator variant="custom" customColor="#F59E0B" children="Предупреждение" />
        <StatusIndicator variant="custom" customColor="#EF4444" children="Ошибка" />
        <StatusIndicator variant="custom" customColor="#8B5CF6" children="Информация" />
        <StatusIndicator variant="custom" customColor="#06B6D4" children="Внимание" />
        <StatusIndicator variant="custom" customColor="#84CC16" children="Готов" />
      </div>
    </div>
  ),
};
