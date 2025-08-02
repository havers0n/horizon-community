import React, { useEffect, useState } from 'react';
import { GTAMap } from '@/features/gta-map';
import { DispatchFeed } from '@/features/dispatch-feed';
import { BoloManagementWidget } from '@/features/bolo-management';
import { CallQueue } from '@/widgets/call-queue-widget/ui/CallQueue';
import { UnitList } from '@/widgets/unit-list-widget/ui/UnitList';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useRealTime } from '../../../../hooks/useRealTime';
import { DispatchApi } from '@/shared/api/dispatch';
import { Call911, Unit, CallStatus, UnitStatus } from '@/shared/types';
import {
  MapPin,
  Radio,
  Activity,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Users,
  Phone,
  Plus,
  Bell,
  Settings,
  Search,
  Filter,
  Grid3X3,
  Clock,
  User,
  Shield,
  Car,
  Building
} from 'lucide-react';

interface DispatchPortalProps {
  onBackToModules: () => void;
}

export const DispatchPortal: React.FC<DispatchPortalProps> = ({ onBackToModules }) => {
  const { isConnected, stats, subscribe } = useRealTime(['units', 'calls', 'alerts']);

  const [activeUnits, setActiveUnits] = useState<Unit[]>([]);
  const [activeCalls, setActiveCalls] = useState<Call911[]>([]);
  const [activeBolos, setActiveBolos] = useState<any[]>([]);
  const [activeUnitsCount, setActiveUnitsCount] = useState(0);
  const [activeCallsCount, setActiveCallsCount] = useState(0);
  const [activeBolosCount, setActiveBolosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<Call911 | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    subscribe(['units', 'calls', 'alerts']);
  }, [subscribe]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [units, calls, bolos, stats] = await Promise.all([
          DispatchApi.getActiveUnits(),
          DispatchApi.getActiveCalls(),
          DispatchApi.getActiveBolos(),
          DispatchApi.getDispatchStats()
        ]);

        setActiveUnits(units);
        setActiveCalls(calls);
        setActiveBolos(bolos);
        setActiveUnitsCount(stats.activeUnitsCount);
        setActiveCallsCount(stats.activeCallsCount);
        setActiveBolosCount(stats.activeBolosCount);
      } catch (error) {
        console.error('Error fetching dispatch data:', error);
        // Fallback to default values
        setActiveUnits([]);
        setActiveCalls([]);
        setActiveBolos([]);
        setActiveUnitsCount(0);
        setActiveCallsCount(0);
        setActiveBolosCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCallSelect = (call: Call911) => {
    setSelectedCall(call);
    // Можно добавить логику для выделения вызова на карте
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    // Можно добавить логику для выделения юнита на карте
  };

  // Преобразуем данные для карты
  const mapUnits = activeUnits.map(unit => ({
    id: unit.id,
    name: unit.name || unit.unitNumber || 'Неизвестный юнит',
    status: unit.status,
    location: { x: 50, y: 50 }, // Временные координаты, нужно заменить на реальные
    type: 'leo' as const // Временный тип, нужно определить по департаменту
  }));

  const mapCalls = activeCalls.map(call => ({
    id: call.id,
    description: call.description,
    location: { x: 30, y: 40 }, // Временные координаты, нужно заменить на реальные
    priority: 'medium' as const, // Временный приоритет, нужно определить по данным
    status: call.status
  }));

  const handleMapUnitClick = (unit: any) => {
    const realUnit = activeUnits.find(u => u.id === unit.id);
    if (realUnit) {
      handleUnitSelect(realUnit);
    }
  };

  const handleMapCallClick = (call: any) => {
    const realCall = activeCalls.find(c => c.id === call.id);
    if (realCall) {
      handleCallSelect(realCall);
    }
  };

  const handleAssignUnit = (callId: string, unitId: string) => {
    // Обновляем локальное состояние
    setActiveCalls(prev => prev.map(call => 
      call.id === callId 
        ? { ...call, assignedUnits: [...(call.assignedUnits || []), unitId] }
        : call
    ));
  };

  const handleUpdateCallStatus = (callId: string, status: CallStatus) => {
    setActiveCalls(prev => prev.map(call => 
      call.id === callId ? { ...call, status } : call
    ));
  };

  const handleUnitStatusChange = (unitId: string, status: UnitStatus) => {
    setActiveUnits(prev => prev.map(unit => 
      unit.id === unitId ? { ...unit, status } : unit
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToModules}
              className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к модулям
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                <Radio className="h-5 w-5 text-blue-400" />
                <h1 className="text-lg font-bold text-white">Dispatch Portal</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Enhanced System Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Система онлайн' : 'Система офлайн'}
                </span>
              </div>

              {/* Enhanced Statistics */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-slate-300 font-medium">
                    {loading ? '...' : `${activeUnitsCount}`}
                  </span>
                  <span className="text-xs text-slate-400">юнитов</span>
                </div>

                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-slate-300 font-medium">
                    {loading ? '...' : `${activeCallsCount}`}
                  </span>
                  <span className="text-xs text-slate-400">вызовов</span>
                </div>

                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  <MapPin className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-slate-300 font-medium">
                    {loading ? '...' : `${activeBolosCount}`}
                  </span>
                  <span className="text-xs text-slate-400">BOLO</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Быстрые действия
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              <AlertTriangle className="h-4 w-4" />
              Сигнал 100
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
            >
              <FileText className="h-4 w-4" />
              Создать BOLO
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
            >
              <Shield className="h-4 w-4" />
              Создать ордер
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            >
              <MapPin className="h-4 w-4" />
              Изменить зону
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Map (65%) */}
        <div className="w-2/3 p-4">
          <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden">
            <GTAMap 
              showHeader={false}
              className="h-full"
              units={mapUnits}
              calls={mapCalls}
              onUnitClick={handleMapUnitClick}
              onCallClick={handleMapCallClick}
            />
            
            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Management Panel (35%) */}
        <div className="w-1/3 p-4">
          <div className="h-full flex flex-col gap-4">
            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Обзор
                </TabsTrigger>
                <TabsTrigger 
                  value="dispatch" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
                >
                  <Radio className="h-4 w-4" />
                  Вызовы
                </TabsTrigger>
                <TabsTrigger 
                  value="bolo" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
                >
                  <FileText className="h-4 w-4" />
                  BOLO
                </TabsTrigger>
                <TabsTrigger 
                  value="units" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
                >
                  <Users className="h-4 w-4" />
                  Юниты
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full m-0">
                  <div className="h-full flex flex-col gap-4">
                    {/* Overview Dashboard */}
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Быстрый обзор</h3>
                        
                        {/* Critical Alerts */}
                        <div className="space-y-3">
                          {activeCalls.filter(call => call.priority === 'critical').map(call => (
                            <div key={call.id} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                  <span className="text-sm font-medium text-red-400">КРИТИЧЕСКИЙ ВЫЗОВ</span>
                                </div>
                                <Badge variant="destructive">ЭКСТРЕННО</Badge>
                              </div>
                              <p className="text-sm text-slate-300 mt-1">{call.description}</p>
                              <p className="text-xs text-slate-400 mt-1">{call.location}</p>
                            </div>
                          ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Последняя активность</h4>
                          <div className="space-y-2">
                            {activeUnits.slice(0, 3).map(unit => (
                              <div key={unit.id} className="flex items-center gap-2 text-sm text-slate-400">
                                <User className="h-3 w-3" />
                                <span>{unit.name}</span>
                                <Badge variant="outline" className="text-xs">{unit.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="dispatch" className="h-full m-0">
                  <CallQueue
                    calls={activeCalls}
                    onCallSelect={handleCallSelect}
                    onAssignUnit={handleAssignUnit}
                    onUpdateStatus={handleUpdateCallStatus}
                  />
                </TabsContent>

                <TabsContent value="bolo" className="h-full m-0 overflow-y-auto">
                  <BoloManagementWidget />
                </TabsContent>

                <TabsContent value="units" className="h-full m-0">
                  <UnitList
                    units={activeUnits}
                    onUnitSelect={handleUnitSelect}
                    onStatusChange={handleUnitStatusChange}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}; 
