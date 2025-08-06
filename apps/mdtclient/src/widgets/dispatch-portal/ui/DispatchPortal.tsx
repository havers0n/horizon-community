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
import { Input } from '@/shared/ui/atoms/Input';
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
  Building,
  Zap,
  Target,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Volume2,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Timer,
  Star,
  Heart
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
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnitsOnMap, setShowUnitsOnMap] = useState(true);
  const [showCallsOnMap, setShowCallsOnMap] = useState(true);
  const [isRadioActive, setIsRadioActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);

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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCallSelect = (call: Call911) => {
    setSelectedCall(call);
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const mapUnits = activeUnits.map(unit => ({
    id: unit.id,
    name: unit.name || unit.unitNumber || 'Неизвестный юнит',
    status: unit.status,
    location: { x: 50, y: 50 },
    type: 'leo' as const
  }));

  const mapCalls = activeCalls.map(call => ({
    id: call.id,
    description: call.description,
    location: { x: 30, y: 40 },
    priority: 'medium' as const,
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

  const criticalCalls = activeCalls.filter(call => call.priority === 'critical' || call.priority === 'panic');
  const highPriorityCalls = activeCalls.filter(call => call.priority === 'high');
  const availableUnits = activeUnits.filter(unit => unit.status === 'available');
  const busyUnits = activeUnits.filter(unit => unit.status === 'busy' || unit.status === 'enRoute');

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Header with Glassmorphism */}
      <div className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToModules}
              className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к модулям
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Radio className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Диспетчерская служба</h1>
                  <p className="text-xs text-slate-400">Система управления экстренными вызовами</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Enhanced System Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300 font-medium">
                  {isConnected ? 'Система онлайн' : 'Система офлайн'}
                </span>
              </div>

              {/* Enhanced Statistics */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30 backdrop-blur-sm">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300 font-bold">
                    {loading ? '...' : `${activeUnitsCount}`}
                  </span>
                  <span className="text-xs text-slate-400">юнитов</span>
                </div>

                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-2 rounded-lg border border-orange-500/30 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-slate-300 font-bold">
                    {loading ? '...' : `${activeCallsCount}`}
                  </span>
                  <span className="text-xs text-slate-400">вызовов</span>
                </div>

                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-slate-300 font-bold">
                    {loading ? '...' : `${activeBolosCount}`}
                  </span>
                  <span className="text-xs text-slate-400">BOLO</span>
                </div>
              </div>
            </div>

            {/* Radio Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRadioActive(!isRadioActive)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isRadioActive 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isRadioActive ? <Volume2 className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMicActive(!isMicActive)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isMicActive 
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>

            {/* Quick Actions Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Быстрые действия
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 p-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            >
              <AlertTriangle className="h-4 w-4" />
              Сигнал 100
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              Создать BOLO
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              Создать ордер
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all duration-200"
            >
              <MapPin className="h-4 w-4" />
              Изменить зону
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить данные
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Map (70%) */}
        <div className={`${isMapFullscreen ? 'w-full' : 'w-[70%]'} p-4 transition-all duration-300`}>
          <div className="h-full bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden relative">
            <GTAMap 
              showHeader={false}
              className="h-full"
              units={showUnitsOnMap ? mapUnits : []}
              calls={showCallsOnMap ? mapCalls : []}
              onUnitClick={handleMapUnitClick}
              onCallClick={handleMapCallClick}
            />
            
            {/* Enhanced Map Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                className="bg-slate-800/80 backdrop-blur-xl border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200"
              >
                {isMapFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUnitsOnMap(!showUnitsOnMap)}
                className={`transition-all duration-200 ${
                  showUnitsOnMap 
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                    : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showUnitsOnMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCallsOnMap(!showCallsOnMap)}
                className={`transition-all duration-200 ${
                  showCallsOnMap 
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                    : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showCallsOnMap ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="bg-slate-800/80 backdrop-blur-xl border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-3 z-10">
              <h4 className="text-sm font-medium text-white mb-2">Легенда</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-300">Доступные юниты</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-slate-300">Занятые юниты</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-300">Критические вызовы</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">Обычные вызовы</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Management Panel (30%) */}
        {!isMapFullscreen && (
          <div className="w-[30%] p-4">
            <div className="h-full flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Поиск вызовов, юнитов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700/50 text-slate-300 placeholder:text-slate-400 focus:border-blue-500/50"
                />
              </div>

              {/* Enhanced Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-1">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30 data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Обзор
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dispatch" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30 data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
                  >
                    <Radio className="h-4 w-4" />
                    Вызовы
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bolo" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30 data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    BOLO
                  </TabsTrigger>
                  <TabsTrigger 
                    value="units" 
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30 data-[state=active]:text-blue-400 rounded-md transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    Юниты
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="overview" className="h-full m-0">
                    <div className="h-full flex flex-col gap-4 overflow-y-auto">
                      {/* Critical Alerts */}
                      {criticalCalls.length > 0 && (
                        <Card className="bg-red-500/10 backdrop-blur-xl border-red-500/30">
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-5 w-5 text-red-400" />
                              <h3 className="text-lg font-semibold text-red-400">КРИТИЧЕСКИЕ ВЫЗОВЫ</h3>
                              <Badge variant="destructive" className="ml-auto">{criticalCalls.length}</Badge>
                            </div>
                            
                            <div className="space-y-3">
                              {criticalCalls.slice(0, 3).map(call => (
                                <div key={call.id} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 cursor-pointer hover:bg-red-500/30 transition-all duration-200" onClick={() => handleCallSelect(call)}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <span className="text-sm font-medium text-red-400">КРИТИЧЕСКИЙ</span>
                                    </div>
                                    <Badge variant="destructive" className="text-xs">ЭКСТРЕННО</Badge>
                                  </div>
                                  <p className="text-sm text-slate-300 mt-1 line-clamp-2">{call.description}</p>
                                  <p className="text-xs text-slate-400 mt-1">{call.location}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* High Priority Calls */}
                      {highPriorityCalls.length > 0 && (
                        <Card className="bg-orange-500/10 backdrop-blur-xl border-orange-500/30">
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="h-5 w-5 text-orange-400" />
                              <h3 className="text-lg font-semibold text-orange-400">ВЫСОКИЙ ПРИОРИТЕТ</h3>
                              <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/30">{highPriorityCalls.length}</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {highPriorityCalls.slice(0, 2).map(call => (
                                <div key={call.id} className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 cursor-pointer hover:bg-orange-500/30 transition-all duration-200" onClick={() => handleCallSelect(call)}>
                                  <p className="text-sm text-slate-300 line-clamp-2">{call.description}</p>
                                  <p className="text-xs text-slate-400 mt-1">{call.location}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* Available Units */}
                      <Card className="bg-green-500/10 backdrop-blur-xl border-green-500/30">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <h3 className="text-lg font-semibold text-green-400">ДОСТУПНЫЕ ЮНИТЫ</h3>
                            <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">{availableUnits.length}</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {availableUnits.slice(0, 3).map(unit => (
                              <div key={unit.id} className="flex items-center gap-2 p-2 bg-green-500/20 rounded-lg cursor-pointer hover:bg-green-500/30 transition-all duration-200" onClick={() => handleUnitSelect(unit)}>
                                <User className="h-4 w-4 text-green-400" />
                                <span className="text-sm text-slate-300">{unit.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto bg-green-500/20 text-green-400 border-green-500/30">{unit.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {/* Busy Units */}
                      <Card className="bg-blue-500/10 backdrop-blur-xl border-blue-500/30">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Car className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-blue-400">ЗАНЯТЫЕ ЮНИТЫ</h3>
                            <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">{busyUnits.length}</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {busyUnits.slice(0, 3).map(unit => (
                              <div key={unit.id} className="flex items-center gap-2 p-2 bg-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/30 transition-all duration-200" onClick={() => handleUnitSelect(unit)}>
                                <User className="h-4 w-4 text-blue-400" />
                                <span className="text-sm text-slate-300">{unit.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">{unit.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {/* System Stats */}
                      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-300">СТАТИСТИКА СИСТЕМЫ</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-400">{activeUnitsCount}</div>
                              <div className="text-xs text-slate-400">Активных юнитов</div>
                            </div>
                            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="text-2xl font-bold text-orange-400">{activeCallsCount}</div>
                              <div className="text-xs text-slate-400">Активных вызовов</div>
                            </div>
                            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="text-2xl font-bold text-green-400">{availableUnits.length}</div>
                              <div className="text-xs text-slate-400">Доступных</div>
                            </div>
                            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                              <div className="text-2xl font-bold text-red-400">{criticalCalls.length}</div>
                              <div className="text-xs text-slate-400">Критических</div>
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
        )}
      </div>
    </div>
  );
}; 
