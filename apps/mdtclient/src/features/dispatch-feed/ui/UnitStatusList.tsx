import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useRealTime } from '../../../../hooks/useRealTime';
import { DispatchFeedApi, ActiveUnit } from '../api/dispatchFeedApi';
import { Shield, Radio, MapPin, Clock, Activity } from 'lucide-react';

export const UnitStatusList: React.FC = () => {
  const [units, setUnits] = useState<ActiveUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealTime(['units']);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const activeUnits = await DispatchFeedApi.getActiveUnits();
        setUnits(activeUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchUnits, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'enroute': return 'bg-blue-500';
      case 'onscene': return 'bg-purple-500';
      case 'unavailable': return 'bg-gray-500';
      case 'panic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'Доступен';
      case 'busy': return 'Занят';
      case 'enroute': return 'В пути';
      case 'onscene': return 'На месте';
      case 'unavailable': return 'Недоступен';
      case 'panic': return 'Паника';
      default: return status;
    }
  };

  const getDepartmentText = (departmentId: number) => {
    switch (departmentId) {
      case 1: return 'LSPD';
      case 2: return 'BCSO';
      case 3: return 'LSFD';
      case 4: return 'EMS';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Статус юнитов</h3>
            <Badge variant="secondary" className="ml-auto">Загрузка...</Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-secondary-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-2">Загрузка юнитов...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableUnits = units.filter(unit => unit.status.toLowerCase() === 'available');
  const busyUnits = units.filter(unit => unit.status.toLowerCase() !== 'available');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Статус юнитов</h3>
          <Badge variant="secondary" className="ml-auto">{units.length}</Badge>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Доступные юниты */}
          <div>
            <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Доступные ({availableUnits.length})
            </h4>
            <div className="space-y-2">
              {availableUnits.length === 0 ? (
                <p className="text-sm text-secondary-400 text-center py-2">Нет доступных юнитов</p>
              ) : (
                availableUnits.map((unit) => (
                  <div key={unit.id} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white">{unit.callsign}</span>
                        {unit.unitNumber && (
                          <Badge variant="outline" className="text-xs">
                            {unit.unitNumber}
                          </Badge>
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(unit.status)} text-white text-xs`}
                      >
                        {getStatusText(unit.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary-400">
                      <span>{getDepartmentText(unit.departmentId)}</span>
                      <span>{new Date(unit.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Занятые юниты */}
          <div>
            <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Занятые ({busyUnits.length})
            </h4>
            <div className="space-y-2">
              {busyUnits.length === 0 ? (
                <p className="text-sm text-secondary-400 text-center py-2">Нет занятых юнитов</p>
              ) : (
                busyUnits.map((unit) => (
                  <div key={unit.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-white">{unit.callsign}</span>
                        {unit.unitNumber && (
                          <Badge variant="outline" className="text-xs">
                            {unit.unitNumber}
                          </Badge>
                        )}
                        {unit.isPanic && (
                          <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                            ПАНИКА
                          </Badge>
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(unit.status)} text-white text-xs`}
                      >
                        {getStatusText(unit.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary-400">
                      <span>{getDepartmentText(unit.departmentId)}</span>
                      <span>{new Date(unit.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
