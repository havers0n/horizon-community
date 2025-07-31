import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/atoms/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/atoms/Card';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { CreateBoloModal } from '../organisms/CreateBoloModal';
import { useBoloManagementStore } from '../../model/store';
import { BOLO } from '../../model/store';
import { Plus, AlertTriangle, Car, User, Info } from 'lucide-react';

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Критический', color: 'bg-red-100 text-red-800' }
};

const typeConfig = {
  vehicle: { label: 'Транспорт', icon: Car },
  person: { label: 'Человек', icon: User },
  general: { label: 'Общий', icon: Info }
};

const BoloCard: React.FC<{ bolo: BOLO }> = ({ bolo }) => {
  // Безопасный доступ к typeConfig с улучшенным fallback
  const getTypeConfig = (type: string) => {
    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) {
      console.warn(`Unknown BOLO type: ${type}`);
      return { label: 'Неизвестный', icon: AlertTriangle };
    }
    return config;
  };
  
  const typeConfigItem = getTypeConfig(bolo.type);
  const TypeIcon = typeConfigItem.icon;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="h-4 w-4 text-gray-500" />
            <Badge className={priorityConfig[bolo.priority]?.color || 'bg-gray-100 text-gray-800'}>
              {priorityConfig[bolo.priority]?.label || 'Неизвестный'}
            </Badge>
            <Badge variant={bolo.status === 'active' ? 'default' : 'secondary'}>
              {bolo.status === 'active' ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(bolo.timestamp).toLocaleString('ru-RU')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">Описание</h4>
          <p className="text-sm text-gray-600 mt-1">{bolo.description}</p>
        </div>
        
        {bolo.vehicle && (
          <div>
            <h4 className="font-medium text-sm">Транспортное средство</h4>
            <p className="text-sm text-gray-600 mt-1">
              {bolo.vehicle} {bolo.plate && `(${bolo.plate})`}
            </p>
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-sm">Причина</h4>
          <p className="text-sm text-gray-600 mt-1">{bolo.reason}</p>
        </div>
        
        {bolo.location && (
          <div>
            <h4 className="font-medium text-sm">Местоположение</h4>
            <p className="text-sm text-gray-600 mt-1">{bolo.location}</p>
          </div>
        )}
        
        {bolo.additionalInfo && (
          <div>
            <h4 className="font-medium text-sm">Дополнительная информация</h4>
            <p className="text-sm text-gray-600 mt-1">{bolo.additionalInfo}</p>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Создано: {bolo.issuedBy}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const BoloManagementWidget: React.FC = () => {
  const { bolos, isLoading, error, fetchBOLOs } = useBoloManagementStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Загрузка BOLO...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-sm text-red-500">Ошибка загрузки: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchBOLOs}
              className="mt-2"
            >
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление BOLO</h2>
          <p className="text-gray-600">
            Всего активных ориентировок: {activeBolos.length}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать BOLO
        </Button>
      </div>

      {/* Табы с категориями */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Все ({bolos.length})</TabsTrigger>
          <TabsTrigger value="vehicle">Транспорт ({vehicleBolos.length})</TabsTrigger>
          <TabsTrigger value="person">Люди ({personBolos.length})</TabsTrigger>
          <TabsTrigger value="general">Общие ({generalBolos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {bolos.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Info className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Нет активных BOLO</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bolos.map((bolo) => (
                <BoloCard key={bolo.id} bolo={bolo} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          {vehicleBolos.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Car className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Нет BOLO по транспортным средствам</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicleBolos.map((bolo) => (
                <BoloCard key={bolo.id} bolo={bolo} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="person" className="mt-6">
          {personBolos.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <User className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Нет BOLO по людям</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personBolos.map((bolo) => (
                <BoloCard key={bolo.id} bolo={bolo} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          {generalBolos.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Info className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Нет общих BOLO</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalBolos.map((bolo) => (
                <BoloCard key={bolo.id} bolo={bolo} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Модальное окно создания */}
      <CreateBoloModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}; 