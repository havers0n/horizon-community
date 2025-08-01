import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select placeholder="Выберите опцию">
      <SelectTrigger>
        <SelectValue placeholder="Выберите опцию" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Опция 1</SelectItem>
        <SelectItem value="option2">Опция 2</SelectItem>
        <SelectItem value="option3">Опция 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <Select value="option2" placeholder="Выберите опцию">
      <SelectTrigger>
        <SelectValue placeholder="Выберите опцию" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Опция 1</SelectItem>
        <SelectItem value="option2">Опция 2</SelectItem>
        <SelectItem value="option3">Опция 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled placeholder="Выберите опцию">
      <SelectTrigger>
        <SelectValue placeholder="Выберите опцию" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Опция 1</SelectItem>
        <SelectItem value="option2">Опция 2</SelectItem>
        <SelectItem value="option3">Опция 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Departments: Story = {
  render: () => (
    <Select placeholder="Выберите отдел">
      <SelectTrigger>
        <SelectValue placeholder="Выберите отдел" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="police">Полиция</SelectItem>
        <SelectItem value="ems">Скорая помощь</SelectItem>
        <SelectItem value="fire">Пожарная служба</SelectItem>
        <SelectItem value="dispatch">Диспетчерская</SelectItem>
        <SelectItem value="civilian">Гражданские</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const StatusOptions: Story = {
  render: () => (
    <Select placeholder="Выберите статус">
      <SelectTrigger>
        <SelectValue placeholder="Выберите статус" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">Доступен</SelectItem>
        <SelectItem value="busy">Занят</SelectItem>
        <SelectItem value="en-route">В пути</SelectItem>
        <SelectItem value="on-scene">На месте</SelectItem>
        <SelectItem value="unavailable">Недоступен</SelectItem>
        <SelectItem value="panic">Паника</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const MultipleSelects: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Отдел</label>
        <Select placeholder="Выберите отдел">
          <SelectTrigger>
            <SelectValue placeholder="Выберите отдел" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="police">Полиция</SelectItem>
            <SelectItem value="ems">Скорая помощь</SelectItem>
            <SelectItem value="fire">Пожарная служба</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Статус</label>
        <Select placeholder="Выберите статус">
          <SelectTrigger>
            <SelectValue placeholder="Выберите статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Доступен</SelectItem>
            <SelectItem value="busy">Занят</SelectItem>
            <SelectItem value="en-route">В пути</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Приоритет</label>
        <Select placeholder="Выберите приоритет">
          <SelectTrigger>
            <SelectValue placeholder="Выберите приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="emergency">Экстренный</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

export const InteractiveSelect: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    
    return (
      <div className="space-y-4 w-80">
        <Select value={value} onValueChange={setValue} placeholder="Выберите опцию">
          <SelectTrigger>
            <SelectValue placeholder="Выберите опцию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Опция 1</SelectItem>
            <SelectItem value="option2">Опция 2</SelectItem>
            <SelectItem value="option3">Опция 3</SelectItem>
          </SelectContent>
        </Select>
        
        {value && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-300">
              Выбрано: <span className="font-medium text-blue-400">{value}</span>
            </p>
          </div>
        )}
      </div>
    );
  },
}; 