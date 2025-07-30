import React from 'react';
import { Card, CardHeader } from '@/shared/ui/atoms';
import { useMDTUnits, useMDTCalls } from '@/hooks/useMDT';
import { Shield, Phone, Radio, Clock } from 'lucide-react';

interface StatsWidgetProps {
  isCompact?: boolean;
  className?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ isCompact = false, className = '' }) => {
  const { units } = useMDTUnits();
  const { calls } = useMDTCalls();

  const activeUnits = units.filter(u => u.status !== 'unavailable').length;
  const activeCalls = calls.filter(c => c.status !== 'closed').length;
  const availableUnits = units.filter(u => u.status === 'available').length;
  const pendingCalls = calls.filter(c => c.status === 'pending').length;

  const stats = [
    {
      label: 'Активные единицы',
      value: activeUnits,
      icon: Shield,
      color: 'text-blue-400'
    },
    {
      label: 'Активные вызовы',
      value: activeCalls,
      icon: Phone,
      color: 'text-red-400'
    },
    {
      label: 'Доступные единицы',
      value: availableUnits,
      icon: Radio,
      color: 'text-green-400'
    },
    {
      label: 'Ожидающие вызовы',
      value: pendingCalls,
      icon: Clock,
      color: 'text-yellow-400'
    }
  ];

  if (isCompact) {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {stats.slice(0, 2).map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-secondary-400">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>Статистика</CardHeader>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-secondary-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
