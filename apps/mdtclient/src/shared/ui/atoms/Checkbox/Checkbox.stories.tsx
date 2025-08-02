import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    checked: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <Checkbox />
      <span className="text-sm text-slate-300">Согласен с условиями</span>
    </label>
  ),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Checkbox variant="default" />
        <span className="text-sm text-slate-300">Default</span>
      </div>
      <div className="flex items-center space-x-4">
        <Checkbox variant="outline" />
        <span className="text-sm text-slate-300">Outline</span>
      </div>
      <div className="flex items-center space-x-4">
        <Checkbox variant="ghost" />
        <span className="text-sm text-slate-300">Ghost</span>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Checkbox size="sm" />
        <span className="text-sm text-slate-300">Small</span>
      </div>
      <div className="flex items-center space-x-4">
        <Checkbox size="default" />
        <span className="text-sm text-slate-300">Default</span>
      </div>
      <div className="flex items-center space-x-4">
        <Checkbox size="lg" />
        <span className="text-sm text-slate-300">Large</span>
      </div>
    </div>
  ),
};

export const CheckboxGroup: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Выберите отделы:</h3>
      <label className="flex items-center space-x-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm text-slate-300">Полиция</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm text-slate-300">Скорая помощь</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm text-slate-300">Пожарная служба</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <Checkbox />
        <span className="text-sm text-slate-300">Диспетчерская</span>
      </label>
    </div>
  ),
};

export const InteractiveCheckbox: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    
    return (
      <div className="space-y-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <Checkbox 
            checked={checked} 
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="text-sm text-slate-300">
            {checked ? 'Отмечено' : 'Не отмечено'}
          </span>
        </label>
        
        {checked && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-300">
              Чекбокс отмечен!
            </p>
          </div>
        )}
      </div>
    );
  },
}; 