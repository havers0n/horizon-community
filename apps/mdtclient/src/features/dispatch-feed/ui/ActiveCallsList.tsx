import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useRealTime } from '../../../../hooks/useRealTime';
import { DispatchFeedApi, ActiveCall } from '../api/dispatchFeedApi';
import { Phone, MapPin, Clock, AlertTriangle } from 'lucide-react';

export const ActiveCallsList: React.FC = () => {
  const [calls, setCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealTime(['calls']);

  useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        setLoading(true);
        const activeCalls = await DispatchFeedApi.getActiveCalls();
        setCalls(activeCalls);
      } catch (error) {
        console.error('Error fetching active calls:', error);
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCalls();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchActiveCalls, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      case 5: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return 'Низкий';
      case 2: return 'Средний';
      case 3: return 'Высокий';
      case 4: return 'Критический';
      case 5: return 'Экстренный';
      default: return 'Неизвестно';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'police': return 'Полиция';
      case 'fire': return 'Пожарная';
      case 'ems': return 'Скорая';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Активные вызовы 911</h3>
            <Badge variant="secondary" className="ml-auto">Загрузка...</Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-secondary-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-2">Загрузка вызовов...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Активные вызовы 911</h3>
          <Badge variant="secondary" className="ml-auto">{calls.length}</Badge>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {calls.length === 0 ? (
            <div className="text-center py-8 text-secondary-400">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет активных вызовов</p>
            </div>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getPriorityColor(call.priority)} text-white`}
                    >
                      {getPriorityText(call.priority)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTypeText(call.type)}
                    </Badge>
                  </div>
                  <span className="text-xs text-secondary-400">
                    #{call.id}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span className="text-white">{call.location}</span>
                  </div>
                  
                  <p className="text-sm text-secondary-300 line-clamp-2">
                    {call.description}
                  </p>
                  
                  {call.callerName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-green-400" />
                      <span className="text-secondary-400">
                        {call.callerName}
                        {call.callerPhone && ` - ${call.callerPhone}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-secondary-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(call.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
