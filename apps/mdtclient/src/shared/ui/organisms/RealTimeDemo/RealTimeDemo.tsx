import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Wifi, WifiOff, Activity, Clock, Users, Database } from 'lucide-react';

interface RealTimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  channels: string[];
}

interface RealTimeDemoProps {
  className?: string;
}

export function RealTimeDemo({ className }: RealTimeDemoProps) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState<any>(null);

  // WebSocket соединение
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      console.log('🔌 WebSocket соединение установлено');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Аутентификация (в тестовом режиме)
      ws.send(JSON.stringify({
        type: 'authenticate',
        data: { token: 'test-token' }
      }));
      
      // Подписка на каналы
      ws.send(JSON.stringify({
        type: 'subscribe',
        data: { channels: ['all', 'test', 'units', 'calls', 'alerts'] }
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Получено WebSocket сообщение:', message);
        
        if (message.type === 'test_event' || message.type === 'unit_status_update' || message.type === 'new_call') {
          const newEvent: RealTimeEvent = {
            id: Date.now().toString(),
            type: message.type,
            data: message.data,
            timestamp: message.timestamp || Date.now(),
            channels: message.channels || ['all']
          };
          
          setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Ограничиваем 50 событиями
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга WebSocket сообщения:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket соединение закрыто');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket ошибка:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendTestEvent = () => {
    const testEvent = {
      type: 'test_event',
      data: {
        message: 'Тестовое событие',
        timestamp: Date.now()
      }
    };
    
    // Отправляем через WebSocket если подключены
    if (isConnected) {
      // В реальном приложении здесь будет отправка через WebSocket
      console.log('📤 Отправка тестового события:', testEvent);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'unit_status_update':
        return <Activity className="h-4 w-4 text-blue-400" />;
      case 'new_call':
        return <Clock className="h-4 w-4 text-green-400" />;
      case 'test_event':
        return <Database className="h-4 w-4 text-purple-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'unit_status_update':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'new_call':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'test_event':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Статус соединения */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <h3 className="text-sm font-medium text-white">Real-Time Status</h3>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className="ml-auto"
            >
              {connectionStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-slate-400" />
              <span className="text-slate-300">Событий: {events.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-slate-400" />
              <span className="text-slate-300">Каналы: 5</span>
            </div>
          </div>
          
          <Button 
            onClick={sendTestEvent}
            size="sm"
            variant="outline"
            className="w-full"
          >
            Отправить тестовое событие
          </Button>
        </CardContent>
      </Card>

      {/* Лента событий */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium text-white">Live Events</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ожидание событий...</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start gap-2">
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {event.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs opacity-90">
                        {JSON.stringify(event.data, null, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
