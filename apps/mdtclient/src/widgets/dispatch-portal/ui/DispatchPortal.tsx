import React, { useEffect, useState } from 'react';
import { GTAMap } from '@/features/gta-map';
import { DispatchFeed } from '@/features/dispatch-feed';
import { BoloManagementWidget } from '@/features/bolo-management';
import { Card } from '@/shared/ui/atoms/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { useRealTime } from '../../../../hooks/useRealTime';
import { DispatchFeedApi } from '../../../features/dispatch-feed/api/dispatchFeedApi';
import {
  MapPin,
  Radio,
  Activity,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Users
} from 'lucide-react';

interface DispatchPortalProps {
  onBackToModules: () => void;
}

export const DispatchPortal: React.FC<DispatchPortalProps> = ({ onBackToModules }) => {
  const { isConnected, stats, subscribe } = useRealTime(['units', 'calls', 'alerts']);

  const [activeUnitsCount, setActiveUnitsCount] = useState(0);
  const [activeCallsCount, setActiveCallsCount] = useState(0);
  const [activeBolosCount, setActiveBolosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscribe(['units', 'calls', 'alerts']);
  }, [subscribe]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await DispatchFeedApi.getDispatchStats();
        setActiveUnitsCount(stats.activeUnitsCount);
        setActiveCallsCount(stats.activeCallsCount);
        setActiveBolosCount(stats.activeBolosCount);
      } catch (error) {
        console.error('Error fetching dispatch stats:', error);
        // Fallback to default values
        setActiveUnitsCount(0);
        setActiveCallsCount(0);
        setActiveBolosCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-secondary-900 border-b border-secondary-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToModules}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к модулям
            </Button>

            <div className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Dispatch Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-secondary-400">
                {isConnected ? 'Система онлайн' : 'Система офлайн'}
              </span>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-secondary-400">
                  {loading ? 'Загрузка...' : `${activeUnitsCount} активных юнита`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-secondary-400">
                  {loading ? 'Загрузка...' : `${activeCallsCount} активных вызова`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-sm text-secondary-400">
                  {loading ? 'Загрузка...' : `${activeBolosCount} активных BOLO`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Column - Map (60%) */}
        <div className="w-3/5 p-4">
          <Card className="h-full">
            <GTAMap />
          </Card>
        </div>

        {/* Right Column - Tabs (40%) */}
        <div className="w-2/5 p-4">
          <Tabs defaultValue="dispatch" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dispatch" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Диспетчер
              </TabsTrigger>
              <TabsTrigger value="bolo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                BOLO
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Юниты
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dispatch" className="h-full mt-4">
              <DispatchFeed />
            </TabsContent>

            <TabsContent value="bolo" className="h-full mt-4 overflow-y-auto">
              <BoloManagementWidget />
            </TabsContent>

            <TabsContent value="units" className="h-full mt-4">
              <Card className="h-full">
                <div className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Управление юнитами</h3>
                  <p className="text-gray-500">Функция будет доступна в следующем обновлении</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}; 
