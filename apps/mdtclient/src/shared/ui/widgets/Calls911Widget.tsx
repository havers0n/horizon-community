// @ts-nocheck - TODO: Remove after major refactoring is complete
import React from 'react';
import { Card } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Call911 } from '@/shared/types';
import { Phone, MapPin, Clock, AlertTriangle } from 'lucide-react';

interface Calls911WidgetProps {
  calls: Call911[];
  onCallClick: (call: Call911) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    case 'en_route':
      return 'bg-purple-100 text-purple-800';
    case 'on_scene':
      return 'bg-green-100 text-green-800';
    case 'resolved':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const Calls911Widget: React.FC<Calls911WidgetProps> = ({
  calls,
  onCallClick
}) => {
  const priorityCounts = calls.reduce((acc, call) => {
    acc[call.priority] = (acc[call.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = calls.reduce((acc, call) => {
    acc[call.status] = (acc[call.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCalls = [...calls].sort((a, b) => {
    // Сортируем по приоритету, затем по времени создания
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(a.createdAt || a.timestamp).getTime() - 
           new Date(b.createdAt || b.timestamp).getTime();
  });

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Вызовы 911</h3>
          <Badge variant="secondary">{calls.length} активных</Badge>
        </div>
        
        {/* Статистика по приоритетам */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Критичные: {priorityCounts.critical || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Высокие: {priorityCounts.high || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Средние: {priorityCounts.medium || 0}</span>
          </div>
        </div>

        {/* Статистика по статусам */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Ожидают: {statusCounts.pending || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Назначены: {statusCounts.assigned || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>В пути: {statusCounts.en_route || 0}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {sortedCalls.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Phone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Нет активных вызовов</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedCalls.slice(0, 10).map((call) => (
              <div
                key={call.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => onCallClick(call)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getPriorityColor(call.priority)}`}>
                      {call.priority.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(call.status)}`}>
                      {call.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(call.createdAt || call.timestamp)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium">
                      {call.callerName || call.caller}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">
                      {call.location}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {call.description}
                  </p>

                  {call.assignedUnits && call.assignedUnits.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        Назначено: {call.assignedUnits.length} юнит(ов)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {sortedCalls.length > 10 && (
              <div className="text-center text-xs text-gray-500 py-2">
                И еще {sortedCalls.length - 10} вызовов...
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
