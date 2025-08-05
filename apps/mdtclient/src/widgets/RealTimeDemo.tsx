import type { Calls911, Units } from '@roleplay-identity/db-types';
import React, { useEffect, useState } from 'react';
import { useAlertUpdates, useCallUpdates, useRealTime, useUnitUpdates } from '../../hooks/useRealTime';
import { Badge } from '../shared/ui/atoms/Badge';
import { Button } from '../shared/ui/atoms/Button';
import { Card } from '../shared/ui/atoms/Card';
import { Notification } from '../shared/ui/atoms/Notification';
import { StatusIndicator } from '../shared/ui/atoms/StatusIndicator';

interface NotificationType {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

// TODO: Define a proper type for alerts
type AlertType = any;

export const RealTimeDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Используем real-time хуки
  const realTime = useRealTime(['all']);
  const units = useUnitUpdates();
  const calls = useCallUpdates();
  const alerts = useAlertUpdates();

  // Добавление уведомления
  const addNotification = (type: NotificationType['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // Обработка событий
  useEffect(() => {
    if (realTime.lastEvent) {
      addNotification('info', `Получено событие: ${realTime.lastEvent.type}`);
    }
  }, [realTime.lastEvent]);

  // Обработка ошибок
  useEffect(() => {
    if (realTime.error) {
      addNotification('error', `Ошибка: ${realTime.error}`);
    }
  }, [realTime.error]);

  // Обработка подключения
  useEffect(() => {
    if (realTime.isConnected) {
      addNotification('success', 'Подключено к real-time серверу');
    } else if (!realTime.isConnecting) {
      addNotification('warning', 'Отключено от real-time сервера');
    }
  }, [realTime.isConnected, realTime.isConnecting]);

  // Тестовые функции
  const sendTestEvent = () => {
    realTime.sendEvent('test_event', {
      message: 'Тестовое событие',
      timestamp: Date.now(),
    });
  };

  const toggleConnection = () => {
    if (realTime.isConnected) {
      realTime.disconnect();
    } else {
      realTime.connect();
    }
  };

  const changeChannels = () => {
    const newChannels = ['units', 'calls'];
    realTime.subscribe(newChannels);
    addNotification('info', `Подписка изменена на: ${newChannels.join(', ')}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Real-Time Demo</h1>
        <div className="flex items-center space-x-2">
          <StatusIndicator
            status={realTime.isConnected ? 'available' : 'unavailable'}
            size="sm"
          />
          <span className="text-sm text-gray-300">
            {realTime.isConnected ? 'Подключено' : 'Отключено'}
          </span>
        </div>
      </div>

      {/* Статус подключения */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Статус подключения</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{realTime.stats.totalEvents}</div>
            <div className="text-sm text-gray-400">Всего событий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {realTime.stats.connectedClients}
            </div>
            <div className="text-sm text-gray-400">Подключенных клиентов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{realTime.stats.cacheSize}</div>
            <div className="text-sm text-gray-400">Размер кэша</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{units.size}</div>
            <div className="text-sm text-gray-400">Активных юнитов</div>
          </div>
        </div>
      </Card>

      {/* Управление */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Управление</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={toggleConnection}
            variant={realTime.isConnected ? 'destructive' : 'default'}
          >
            {realTime.isConnected ? 'Отключиться' : 'Подключиться'}
          </Button>
          <Button onClick={sendTestEvent} variant="outline">
            Отправить тестовое событие
          </Button>
          <Button onClick={changeChannels} variant="outline">
            Изменить каналы
          </Button>
        </div>
      </Card>

      {/* Юниты */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Активные юниты ({units.size})</h2>
        <div className="space-y-2">
          {Array.from(units.values()).map((unit: Units) => (
            <div key={unit.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex items-center space-x-2">
                <StatusIndicator status={unit.status} size="sm" />
                <span className="text-white">Юнит {unit.id}</span>
              </div>
              <Badge variant="outline">{unit.status}</Badge>
            </div>
          ))}
          {units.size === 0 && (
            <div className="text-gray-400 text-center py-4">Нет активных юнитов</div>
          )}
        </div>
      </Card>

      {/* Вызовы */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Активные вызовы ({calls.size})</h2>
        <div className="space-y-2">
          {Array.from(calls.values()).map((call: Calls911) => (
            <div key={call.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div>
                <div className="text-white font-medium">{call.description}</div>
                <div className="text-sm text-gray-400">{call.location}</div>
              </div>
              <Badge variant={call.priority === 'high' ? 'destructive' : 'default'}>
                {call.status}
              </Badge>
            </div>
          ))}
          {calls.size === 0 && (
            <div className="text-gray-400 text-center py-4">Нет активных вызовов</div>
          )}
        </div>
      </Card>

      {/* Тревоги */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Тревоги ({alerts.length})</h2>
        <div className="space-y-2">
          {alerts.map((alert: AlertType) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/30 rounded"
            >
              <div>
                <div className="text-red-400 font-medium">{alert.type}</div>
                <div className="text-sm text-gray-400">
                  {alert.data.unitId ? `Юнит ${alert.data.unitId}` : alert.data.vehiclePlate}
                </div>
              </div>
              <Badge variant="destructive">ТРЕВОГА</Badge>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-gray-400 text-center py-4">Нет активных тревог</div>
          )}
        </div>
      </Card>

      {/* Последнее событие */}
      {realTime.lastEvent && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Последнее событие</h2>
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400">Тип: {realTime.lastEvent.type}</div>
            <div className="text-sm text-gray-400">
              Время: {new Date(realTime.lastEvent.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-400">
              Каналы: {realTime.lastEvent.channels.join(', ')}
            </div>
            <pre className="text-xs text-gray-300 mt-2 overflow-auto">
              {JSON.stringify(realTime.lastEvent.data, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Уведомления */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            title={notification.message}
            onClose={() => {
              setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
            }}
          />
        ))}
      </div>
    </div>
  );
};
