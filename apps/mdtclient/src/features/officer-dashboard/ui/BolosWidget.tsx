import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { AlertTriangle, Car, User, Clock } from 'lucide-react';

interface Bolo {
  id: string;
  type: 'person' | 'vehicle' | 'general';
  title: string;
  description: string;
  issuedAt: string;
  priority: 'high' | 'medium' | 'low';
}

// Моковые данные BOLO для офицера
const mockBolos: Bolo[] = [
  {
    id: 'BOLO-001',
    type: 'vehicle',
    title: 'Подозрительный автомобиль',
    description: 'Красный Sultan RS, номер ABC-123',
    issuedAt: '14:15',
    priority: 'high'
  },
  {
    id: 'BOLO-002',
    type: 'person',
    title: 'Подозреваемый в краже',
    description: 'Мужчина, 30-35 лет, черная куртка',
    issuedAt: '13:45',
    priority: 'medium'
  }
];

const getPriorityColor = (priority: Bolo['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getTypeIcon = (type: Bolo['type']) => {
  switch (type) {
    case 'vehicle': return <Car className="h-3 w-3 text-blue-400" />;
    case 'person': return <User className="h-3 w-3 text-green-400" />;
    case 'general': return <AlertTriangle className="h-3 w-3 text-orange-400" />;
    default: return <AlertTriangle className="h-3 w-3 text-gray-400" />;
  }
};

export const BolosWidget: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <h4 className="text-sm font-medium text-white">Активные BOLO</h4>
          <Badge variant="secondary" className="ml-auto text-xs">
            {mockBolos.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockBolos.map((bolo) => (
          <div
            key={bolo.id}
            className="p-2 border border-secondary-700 rounded text-xs hover:bg-secondary-800/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1">
                {getTypeIcon(bolo.type)}
                <span className="font-medium text-white">{bolo.id}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(bolo.priority)}`} />
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5 text-secondary-400" />
                <span className="text-secondary-400">{bolo.issuedAt}</span>
              </div>
            </div>
            
            <div className="mb-1">
              <h5 className="text-white font-medium mb-1">{bolo.title}</h5>
              <p className="text-secondary-300 leading-tight">{bolo.description}</p>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${getPriorityColor(bolo.priority)} border-current`}
            >
              {bolo.priority === 'high' && 'Высокий'}
              {bolo.priority === 'medium' && 'Средний'}
              {bolo.priority === 'low' && 'Низкий'}
            </Badge>
          </div>
        ))}
        
        {mockBolos.length === 0 && (
          <div className="text-center py-4 text-secondary-400">
            <AlertTriangle className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Нет активных BOLO</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
