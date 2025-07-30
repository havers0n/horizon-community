import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table';

const meta: Meta<typeof Table> = {
  title: 'Atoms/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  {
    id: '1',
    callsign: '1A-12',
    name: 'Иван Петров',
    status: 'available',
    department: 'LAPD',
    division: 'Patrol',
    location: 'Downtown LA',
  },
  {
    id: '2',
    callsign: '1B-15',
    name: 'Мария Сидорова',
    status: 'busy',
    department: 'LAPD',
    division: 'Traffic',
    location: 'Hollywood',
  },
  {
    id: '3',
    callsign: '1C-22',
    name: 'Алексей Козлов',
    status: 'enroute',
    department: 'LASD',
    division: 'SEB',
    location: 'East LA',
  },
  {
    id: '4',
    callsign: '1D-33',
    name: 'Елена Волкова',
    status: 'unavailable',
    department: 'LAPD',
    division: 'Detective',
    location: 'West LA',
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Позывной</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Департамент</TableHead>
          <TableHead>Подразделение</TableHead>
          <TableHead>Местоположение</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell className="font-medium">{unit.callsign}</TableCell>
            <TableCell>{unit.name}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                unit.status === 'available' ? 'bg-green-500/20 text-green-300' :
                unit.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                unit.status === 'enroute' ? 'bg-blue-500/20 text-blue-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {unit.status === 'available' ? 'Доступен' :
                 unit.status === 'busy' ? 'Занят' :
                 unit.status === 'enroute' ? 'В пути' : 'Недоступен'}
              </span>
            </TableCell>
            <TableCell>{unit.department}</TableCell>
            <TableCell>{unit.division}</TableCell>
            <TableCell>{unit.location}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Список активных юнитов на смене</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Позывной</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Департамент</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((unit) => (
          <TableRow key={unit.id}>
            <TableCell className="font-medium">{unit.callsign}</TableCell>
            <TableCell>{unit.name}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                unit.status === 'available' ? 'bg-green-500/20 text-green-300' :
                unit.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {unit.status === 'available' ? 'Доступен' :
                 unit.status === 'busy' ? 'Занят' : 'В пути'}
              </span>
            </TableCell>
            <TableCell>{unit.department}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Позывной</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Департамент</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell className="font-medium">{unit.callsign}</TableCell>
            <TableCell>{unit.name}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                unit.status === 'available' ? 'bg-green-500/20 text-green-300' :
                unit.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                unit.status === 'enroute' ? 'bg-blue-500/20 text-blue-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {unit.status === 'available' ? 'Доступен' :
                 unit.status === 'busy' ? 'Занят' :
                 unit.status === 'enroute' ? 'В пути' : 'Недоступен'}
              </span>
            </TableCell>
            <TableCell>{unit.department}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="font-medium">Всего юнитов:</TableCell>
          <TableCell colSpan={2}>{sampleData.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Позывной</TableHead>
          <TableHead>Имя</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Департамент</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((unit) => (
          <TableRow 
            key={unit.id}
            onClick={() => console.log('Clicked unit:', unit.callsign)}
            className="cursor-pointer hover:bg-secondary-800/50"
          >
            <TableCell className="font-medium">{unit.callsign}</TableCell>
            <TableCell>{unit.name}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                unit.status === 'available' ? 'bg-green-500/20 text-green-300' :
                unit.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                unit.status === 'enroute' ? 'bg-blue-500/20 text-blue-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {unit.status === 'available' ? 'Доступен' :
                 unit.status === 'busy' ? 'Занят' :
                 unit.status === 'enroute' ? 'В пути' : 'Недоступен'}
              </span>
            </TableCell>
            <TableCell>{unit.department}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
