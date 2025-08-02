import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { CreateBoloModal } from '../organisms/CreateBoloModal';
import { useBoloManagementStore } from '../../model/store';
import { BOLO } from '../../model/store';
import { Plus, AlertTriangle, Car, User, Info, Clock, MapPin, Edit, Trash2, Eye } from 'lucide-react';

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Средний', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  high: { label: 'Высокий', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  critical: { label: 'Критический', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

const typeConfig = {
  vehicle: { label: 'Транспорт', icon: Car, color: 'text-blue-400' },
  person: { label: 'Человек', icon: User, color: 'text-green-400' },
  general: { label: 'Общий', icon: Info, color: 'text-purple-400' }
};

const BoloCard: React.FC<{ bolo: BOLO }> = ({ bolo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTypeConfig = (type: string) => {
    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) {
      console.warn(`Unknown BOLO type: ${type}`);
      return { label: 'Неизвестный', icon: AlertTriangle, color: 'text-gray-400' };
    }
    return config;
  };
  
  const typeConfigItem = getTypeConfig(bolo.type);
  const TypeIcon = typeConfigItem.icon;
  
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-700/50 ${typeConfigItem.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className={`${priorityConfig[bolo.priority]?.color} border`}>
                  {priorityConfig[bolo.priority]?.label || 'Неизвестный'}
                </Badge>
                <Badge variant={bolo.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {bolo.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{new Date(bolo.timestamp).toLocaleString('ru-RU', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Compact View */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-white mb-1">Описание</h4>
              <p className="text-sm text-slate-300 line-clamp-2">{bolo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{bolo.location || 'Местоположение не указано'}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{bolo.issuedBy || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-700/50 space-y-3">
            {bolo.vehicle && (
              <div>
                <h4 className="font-medium text-sm text-white mb-1">Транспортное средство</h4>
                <p className="text-sm text-slate-300">
                  {bolo.vehicle} {bolo.plate && `(${bolo.plate})`}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-white mb-1">Причина</h4>
              <p className="text-sm text-slate-300">{bolo.reason}</p>
            </div>
            
            {bolo.additionalInfo && (
              <div>
                <h4 className="font-medium text-sm text-white mb-1">Дополнительная информация</h4>
                <p className="text-sm text-slate-300">{bolo.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const BoloManagementWidget: React.FC = () => {
  const { bolos, isLoading, error, fetchBOLOs } = useBoloManagementStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBOLOs();
  }, [fetchBOLOs]);

  const activeBolos = bolos.filter(bolo => bolo.status === 'active');
  const vehicleBolos = bolos.filter(bolo => bolo.type === 'vehicle');
  const personBolos = bolos.filter(bolo => bolo.type === 'person');
  const generalBolos = bolos.filter(bolo => bolo.type === 'general');

  const handleCreateSuccess = () => {
    fetchBOLOs();
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'all': return activeBolos.length;
      case 'vehicle': return vehicleBolos.length;
      case 'person': return personBolos.length;
      case 'general': return generalBolos.length;
      default: return 0;
    }
  };

  const getTabBolos = (tab: string) => {
    switch (tab) {
      case 'all': return activeBolos;
      case 'vehicle': return vehicleBolos;
      case 'person': return personBolos;
      case 'general': return generalBolos;
      default: return [];
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-400">Загрузка BOLO...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
            <p className="mt-2 text-sm text-red-400">Ошибка загрузки: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBOLOs}
              className="mt-2 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Управление BOLO</h3>
          <p className="text-sm text-slate-400">Всего активных ориентировок: {activeBolos.length}</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать BOLO
        </Button>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
          >
            <AlertTriangle className="h-4 w-4" />
            Все ({getTabCount('all')})
          </TabsTrigger>
          <TabsTrigger 
            value="vehicle" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
          >
            <Car className="h-4 w-4" />
            Транспорт ({getTabCount('vehicle')})
          </TabsTrigger>
          <TabsTrigger 
            value="person" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
          >
            <User className="h-4 w-4" />
            Люди ({getTabCount('person')})
          </TabsTrigger>
          <TabsTrigger 
            value="general" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500/30"
          >
            <Info className="h-4 w-4" />
            Общие ({getTabCount('general')})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-4">
          {['all', 'vehicle', 'person', 'general'].map(tab => (
            <TabsContent key={tab} value={tab} className="h-full m-0">
              <div className="h-full overflow-y-auto space-y-3 pr-2">
                {getTabBolos(tab).length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto" />
                      <p className="mt-2 text-sm text-slate-500">Нет активных BOLO в этой категории</p>
                    </div>
                  </div>
                ) : (
                  getTabBolos(tab).map(bolo => (
                    <BoloCard key={bolo.id} bolo={bolo} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <CreateBoloModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}; 