import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import type { Bolo as BOLO } from '@/entities/dispatch/model/types';
import { FileText, AlertTriangle, Clock, User, Car } from 'lucide-react';

interface BoloWidgetProps {
  bolos: BOLO[];
  onBoloClick: (bolo: BOLO) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'person':
      return <User className="h-4 w-4" />;
    case 'vehicle':
      return <Car className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const BoloWidget: React.FC<BoloWidgetProps> = ({
  bolos,
  onBoloClick
}) => {
  const activeBolos = bolos.filter(bolo => bolo.status === 'active');
  
  const priorityCounts = activeBolos.reduce((acc, bolo) => {
    acc[bolo.priority] = (acc[bolo.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = activeBolos.reduce((acc, bolo) => {
    acc[bolo.type] = (acc[bolo.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedBolos = [...activeBolos].sort((a, b) => {
    // Сортируем по приоритету, затем по времени создания
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">BOLO</h3>
          <Badge variant="secondary">{activeBolos.length} активных</Badge>
        </div>
        
        {/* Статистика по приоритетам */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Высокие: {priorityCounts.high || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Средние: {priorityCounts.medium || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Низкие: {priorityCounts.low || 0}</span>
          </div>
        </div>

        {/* Статистика по типам */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-400" />
            <span>Личности: {typeCounts.person || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3 text-gray-400" />
            <span>Транспорт: {typeCounts.vehicle || 0}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {sortedBolos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Нет активных BOLO</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedBolos.slice(0, 8).map((bolo) => (
              <div
                key={bolo.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-orange-300 cursor-pointer transition-colors"
                onClick={() => onBoloClick(bolo)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(bolo.type)}
                    <Badge className={`text-xs ${getPriorityColor(bolo.priority)}`}>
                      {bolo.priority.toUpperCase()}
                    </Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      {bolo.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(bolo.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {bolo.description}
                  </p>

                  {bolo.person && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {bolo.person.name}
                      </span>
                    </div>
                  )}

                  {bolo.vehicle && (
                    <div className="flex items-center gap-2">
                      <Car className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {bolo.vehicle.plate} - {bolo.vehicle.model} ({bolo.vehicle.color})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">
                      Автор: {bolo.author}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {sortedBolos.length > 8 && (
              <div className="text-center text-xs text-gray-500 py-2">
                И еще {sortedBolos.length - 8} BOLO...
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}; 