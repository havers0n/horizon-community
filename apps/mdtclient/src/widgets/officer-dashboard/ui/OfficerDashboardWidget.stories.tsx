import type { Meta, StoryObj } from '@storybook/react';
import { OfficerDashboardWidget } from './OfficerDashboardWidget';

const meta: Meta<typeof OfficerDashboardWidget> = {
  title: 'Widgets/OfficerDashboard/OfficerDashboardWidget',
  component: OfficerDashboardWidget,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CompactView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WideView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-8xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WithDarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 p-4">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WithLightTheme: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const MobileView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-2">
        <div className="max-w-sm mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const TabletView: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const WithSidebar: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 flex">
        <div className="w-64 bg-slate-800 p-4 border-r border-slate-700">
          <div className="text-white text-sm">
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li className="p-2 bg-slate-700 rounded">Дашборд</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Граждане</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Транспорт</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Инциденты</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Отчеты</li>
            </ul>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};

export const WithHeader: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-white text-xl font-semibold">MDT Система</h1>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Офицер Джон Смит</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            <Story />
          </div>
        </main>
      </div>
    ),
  ],
};

export const FullLayout: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 flex">
        <div className="w-64 bg-slate-800 p-4 border-r border-slate-700">
          <div className="text-white text-sm">
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li className="p-2 bg-slate-700 rounded">Дашборд</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Граждане</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Транспорт</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Инциденты</li>
              <li className="p-2 hover:bg-slate-700 rounded cursor-pointer">Отчеты</li>
            </ul>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <header className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-xl font-semibold">MDT Система</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">Офицер Джон Смит</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4">
            <Story />
          </main>
        </div>
      </div>
    ),
  ],
}; 