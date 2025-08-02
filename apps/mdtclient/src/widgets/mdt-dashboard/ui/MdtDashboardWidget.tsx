import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Shield, Radio, Users, Phone, MapPin, Clock, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { useDashboardSelectors, useDashboardActions, useDashboardRealTime } from '../model';
import { UnitStatus } from '@/shared/types';

// Опции статусов для кнопок
const statusOptions = [
  { value: 'available', label: 'Доступен (10-8)', color: 'bg-green-500', icon: Shield },
  { value: 'busy', label: 'Занят (10-12)', color: 'bg-yellow-500', icon: AlertTriangle },
  { value: 'enRoute', label: 'В пути (10-31)', color: 'bg-blue-500', icon: Activity },
  { value: 'onScene', label: 'На месте (10-97)', color: 'bg-orange-500', icon: MapPin },
  { value: 'unavailable', label: 'Недоступен (10-7)', color: 'bg-red-500', icon: XCircle }
];

export const MdtDashboardWidget: React.FC = () => {
  // Подключаем Real-Time обновления
  useDashboardRealTime();

  // Получаем данные из стора
  const {
    currentOfficer,
    activeCalls,
    activeBolos,
    isLoading,
    error,
    stats,
    isInitialized
  } = useDashboardSelectors();

  // Получаем действия из стора
  const {
    initializeDashboard,
    changeOfficerStatus
  } = useDashboardActions();

  // Локальное состояние для текущего статуса
  const [currentStatus, setCurrentStatus] = useState<UnitStatus | null>(null);

  // Инициализация при монтировании
  useEffect(() => {
    if (!isInitialized) {
      initializeDashboard();
    }
  }, [isInitialized, initializeDashboard]);

  // Синхронизация локального статуса с данными офицера
  useEffect(() => {
    if (currentOfficer) {
      setCurrentStatus(currentOfficer.status);
    }
  }, [currentOfficer]);

  // Обработчик смены статуса
  const handleStatusChange = async (newStatus: UnitStatus) => {
    try {
      await changeOfficerStatus(newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  // Получение информации о текущем статусе
  const getStatusInfo = (status: UnitStatus) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const currentStatusInfo = currentStatus ? getStatusInfo(currentStatus) : statusOptions[0];

  // Функция для безопасного форматирования даты
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return '--:--';
    try {
      return new Date(timestamp).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '--:--';
    }
  };

  // Отображение состояния загрузки
  if (isLoading && !isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-secondary-300">Загрузка оперативного дашборда...</p>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-400 mb-2">Ошибка загрузки данных</p>
          <p className="text-secondary-400 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => initializeDashboard()}
          >
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      {/* Основная сетка дашборда */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        
        {/* Левая колонка - Статус и быстрые действия */}
        <div className="col-span-3 space-y-4">
          {/* Виджет статуса офицера */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Мой статус</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Информация об офицере */}
              {currentOfficer ? (
                <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded text-xs mt-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Radio className="h-3 w-3 text-blue-400" />
                    <span className="font-medium text-white">{currentOfficer.name}</span>
                  </div>
                  <div className="text-secondary-300 space-y-0.5">
                    <div>Департамент: <span className="text-white">{currentOfficer.department}</span></div>
                    <div>ID: <span className="text-white font-mono">{currentOfficer.id}</span></div>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-secondary-800/50 border border-secondary-700 rounded text-xs mt-2">
                  <div className="text-secondary-400 text-center">
                    Офицер не определен
                  </div>
                </div>
              )}

              {/* Текущий статус */}
              <div className="p-2 border border-secondary-700 rounded text-xs">
                <div className="flex items-center gap-1 mb-1">
                  <div className={`w-2 h-2 rounded-full ${currentStatusInfo.color}`}></div>
                  <span className="font-medium text-white">Текущий статус</span>
                </div>
                
                <div className="flex items-center gap-1 mb-1">
                  <currentStatusInfo.icon className="h-3 w-3 text-secondary-400" />
                  <span className="text-secondary-300">{currentStatusInfo.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-secondary-400" />
                  <span className="text-secondary-400">
                    Обновлено: {new Date().toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>

              {/* Кнопки смены статуса */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-white mb-2">Изменить статус</h4>
                {statusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant={currentStatus === status.value ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-start h-8 text-xs transition-all duration-200 ${
                      currentStatus === status.value 
                        ? 'bg-blue-600/80 border-blue-500 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50' 
                        : 'hover:bg-secondary-800/50'
                    }`}
                    onClick={() => handleStatusChange(status.value as UnitStatus)}
                    disabled={!currentOfficer || isLoading}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${status.color} mr-2`}></div>
                    <status.icon className="h-3 w-3 mr-2" />
                    {status.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Быстрые действия */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-white">Быстрые действия</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  Кнопка паники
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                  <Radio className="h-3 w-3 mr-2" />
                  Запрос подкрепления
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                  <Users className="h-3 w-3 mr-2" />
                  Отправить сигнал
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-medium text-white">Статистика</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-secondary-800/50 rounded">
                  <div className="text-secondary-400">Всего вызовов</div>
                  <div className="text-white font-medium">{stats?.totalCalls || 0}</div>
                </div>
                <div className="p-2 bg-secondary-800/50 rounded">
                  <div className="text-secondary-400">Активных</div>
                  <div className="text-white font-medium">{stats?.activeIncidents || 0}</div>
                </div>
                <div className="p-2 bg-secondary-800/50 rounded">
                  <div className="text-secondary-400">Доступных юнитов</div>
                  <div className="text-white font-medium">{stats?.availableUnits || 0}</div>
                </div>
                <div className="p-2 bg-secondary-800/50 rounded">
                  <div className="text-secondary-400">Ожидающих</div>
                  <div className="text-white font-medium">{stats?.pendingCalls || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Центральная колонка - Активные вызовы */}
        <div className="col-span-5">
          <Card className="h-full" variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <h3 className="text-sm font-medium text-white">Активные вызовы</h3>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    {activeCalls?.length || 0}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  Все вызовы
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="mt-3">
                {activeCalls && activeCalls.length > 0 ? (
                  activeCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-3 border border-secondary-700 rounded hover:bg-secondary-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-red-400" />
                          <span className="font-medium text-white">{call.id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-secondary-400" />
                          <span className="text-secondary-400 text-sm">
                            {formatTime(call.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3 text-secondary-400" />
                          <span className="text-white text-sm">{call.location}</span>
                        </div>
                        <p className="text-secondary-300 text-sm">{call.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                          {call.priority}
                        </span>
                        <span className="text-xs border border-secondary-600 px-2 py-1 rounded">
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-400">
                    <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет активных вызовов</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - BOLO и мини-карта */}
        <div className="col-span-4 space-y-4">
          {/* Активные BOLO */}
          <Card className="flex-1" variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <h3 className="text-sm font-medium text-white">Активные BOLO</h3>
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                    {activeBolos?.length || 0}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  Все BOLO
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                             {activeBolos && activeBolos.length > 0 ? (
                 activeBolos.map((bolo) => (
                   <div
                     key={bolo.id}
                     className="p-2 border border-secondary-700 rounded text-xs hover:bg-secondary-800/30 transition-colors cursor-pointer"
                   >
                     <div className="flex items-start justify-between mb-1">
                       <div className="flex items-center gap-1">
                         <Activity className="h-2 w-2 text-blue-400" />
                         <span className="font-medium text-white">{bolo.author || 'Неизвестный автор'}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Clock className="h-2 w-2 text-secondary-400" />
                         <span className="text-secondary-400">
                           {formatTime(bolo.createdAt)}
                         </span>
                       </div>
                     </div>
                     
                     <div className="mb-1">
                       <h5 className="text-white font-medium mb-1">{bolo.reason}</h5>
                       <p className="text-secondary-300 leading-tight">{bolo.reason}</p>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                         {bolo.priority}
                       </span>
                       <span className="text-xs border border-secondary-600 px-2 py-1 rounded">
                         {bolo.type}
                       </span>
                     </div>
                   </div>
                 ))
              ) : (
                <div className="text-center py-4 text-secondary-400">
                  <AlertTriangle className="h-4 w-4 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Нет активных BOLO</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Мини-карта */}
          <Card className="flex-1" variant="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-medium text-white">Оперативная карта</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary-800 rounded-lg h-32 flex items-center justify-center border border-secondary-700">
                <div className="text-center text-secondary-400">
                  <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Карта оперативной обстановки</p>
                  <p className="text-xs text-secondary-500">
                    {currentOfficer ? `Юнит: ${currentOfficer.name}` : 'Юнит не определен'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
