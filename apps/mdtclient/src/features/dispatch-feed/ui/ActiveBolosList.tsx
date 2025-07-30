import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useRealTime } from '../../../../hooks/useRealTime';
import { DispatchFeedApi, ActiveBolo } from '../api/dispatchFeedApi';
import { AlertTriangle, Car, User, Clock, MapPin } from 'lucide-react';

export const ActiveBolosList: React.FC = () => {
  const [bolos, setBolos] = useState<ActiveBolo[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealTime(['alerts']);

  useEffect(() => {
    const fetchActiveBolos = async () => {
      try {
        setLoading(true);
        const activeBolos = await DispatchFeedApi.getActiveBolos();
        setBolos(activeBolos);
      } catch (error) {
        console.error('Error fetching active BOLOs:', error);
        setBolos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveBolos();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchActiveBolos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'critical': return 'Критический';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vehicle': return <Car className="h-4 w-4 text-blue-400" />;
      case 'person': return <User className="h-4 w-4 text-green-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vehicle': return 'Транспорт';
      case 'person': return 'Личность';
      case 'general': return 'Общий';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Активные BOLO</h3>
            <Badge variant="secondary" className="ml-auto">Загрузка...</Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-secondary-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
            <p className="mt-2">Загрузка BOLO...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeBolos = bolos.filter(bolo => bolo.isActive);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Активные BOLO</h3>
          <Badge variant="secondary" className="ml-auto">{activeBolos.length}</Badge>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeBolos.length === 0 ? (
            <div className="text-center py-8 text-secondary-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет активных BOLO</p>
            </div>
          ) : (
            activeBolos.map((bolo) => (
              <div key={bolo.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(bolo.type)}
                    <Badge 
                      variant="secondary" 
                      className={`${getPriorityColor(bolo.priority)} text-white`}
                    >
                      {getPriorityText(bolo.priority)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTypeText(bolo.type)}
                    </Badge>
                  </div>
                  <span className="text-xs text-secondary-400">
                    #{bolo.id}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">
                    {bolo.title}
                  </h4>
                  
                  <p className="text-sm text-secondary-300 line-clamp-2">
                    {bolo.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-secondary-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(bolo.createdAt).toLocaleTimeString()}
                    </span>
                    {bolo.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Истекает: {new Date(bolo.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
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
