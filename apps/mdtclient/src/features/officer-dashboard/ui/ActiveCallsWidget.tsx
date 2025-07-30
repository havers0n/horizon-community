import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Phone, MapPin, Clock, AlertTriangle } from 'lucide-react';

interface Call {
  id: string;
  type: 'emergency' | 'traffic' | 'medical' | 'fire';
  address: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  assignedUnits?: string[];
}

// Моковые данные активных вызовов для офицера
const mockActiveCalls: Call[] = [
  {
    id: '911-001',
    type: 'emergency',
    address: '123 Vinewood Blvd',
    description: 'Ограбление банка в процессе',
    time: '14:32',
    priority: 'high',
    assignedUnits: ['1-ADAM-12', '1-ADAM-14']
  },
  {
    id: '911-002',
    type: 'traffic',
    address: '789 Grove Street',
    description: 'Нарушение ПДД, превышение скорости',
    time: '14:25',
    priority: 'medium'
  }
];

const getPriorityColor = (priority: Call['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getTypeIcon = (type: Call['type']) => {
  switch (type) {
    case 'emergency': return <AlertTriangle className="h-3 w-3 text-red-400" />;
    case 'medical': return <Phone className="h-3 w-3 text-blue-400" />;
    case 'traffic': return <MapPin className="h-3 w-3 text-yellow-400" />;
    case 'fire': return <AlertTriangle className="h-3 w-3 text-orange-400" />;
    default: return <Phone className="h-3 w-3 text-gray-400" />;
  }
};

export const ActiveCallsWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-400" />
          <h4 className="text-sm font-medium text-white">Активные вызовы</h4>
          <Badge variant="secondary" className="ml-auto text-xs">
            {mockActiveCalls.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockActiveCalls.map((call) => (
          <div
            key={call.id}
            className="p-2 border border-secondary-700 rounded text-xs hover:bg-secondary-800/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1">
                {getTypeIcon(call.type)}
                <span className="font-medium text-white">{call.id}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(call.priority)}`} />
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-secondary-400" />
                <span className="text-secondary-400">{call.time}</span>
              </div>
            </div>
            
            <div className="mb-1">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-2.5 w-2.5 text-secondary-400" />
                <span className="text-white">{call.address}</span>
              </div>
              <p className="text-secondary-300 leading-tight">{call.description}</p>
            </div>
            
            {call.assignedUnits && call.assignedUnits.length > 0 && (
              <div className="flex gap-1">
                {call.assignedUnits.map((unit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {mockActiveCalls.length === 0 && (
          <div className="text-center py-4 text-secondary-400">
            <Phone className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Нет активных вызовов</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
