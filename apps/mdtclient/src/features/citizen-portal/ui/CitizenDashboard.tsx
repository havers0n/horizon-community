import React from 'react';
import { Card, CardHeader, CardContent } from '@/shared/ui/atoms';
import { 
  User, 
  Car, 
  Building, 
  Phone, 
  Shield, 
  Truck,
  Heart,
  BookOpen,
  LayoutDashboard,
  Users,
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useCitizenPortalStore } from '../model/store';

export const CitizenDashboard: React.FC = () => {
  const { activeCharacter, setCurrentView } = useCitizenPortalStore();

  if (!activeCharacter) return null;

  const dashboardItems = [
    {
      id: 'profile',
      title: 'Профиль гражданина',
      description: 'Просмотр и редактирование профиля',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      status: 'active',
    },
    {
      id: 'property',
      title: 'Собственность и связи',
      description: 'Управление транспортом, оружием и компаниями',
      icon: Building,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      status: 'active',
    },
    {
      id: 'mdt',
      title: 'MDT/CAD',
      description: 'Доступ к системам правоохранительных органов',
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      status: 'pending',
    },
    {
      id: 'reference',
      title: 'Справочники',
      description: 'Правовые кодексы и медицинские справочники',
      icon: BookOpen,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      status: 'active',
    },
  ];

  const quickActions = [
    {
      id: 'emergency-call',
      title: 'Экстренный вызов',
      description: 'Создать вызов 911',
      icon: Phone,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      id: 'vehicle-registration',
      title: 'Регистрация транспорта',
      description: 'Зарегистрировать новое ТС',
      icon: Car,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      id: 'weapon-registration',
      title: 'Регистрация оружия',
      description: 'Зарегистрировать оружие',
      icon: Shield,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'pending':
        return 'Ожидает';
      case 'error':
        return 'Ошибка';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg p-6 border border-primary-500/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Добро пожаловать, {activeCharacter.firstName} {activeCharacter.lastName}!
            </h1>
            <p className="text-slate-400">
              Управляйте своим профилем и доступными сервисами
            </p>
            {activeCharacter.ssn && (
              <p className="text-sm text-slate-500 mt-1">
                SSN: {activeCharacter.ssn}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Основные разделы */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Основные разделы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={item.id} 
                className="hover:bg-secondary-800 transition-colors cursor-pointer border-slate-700"
                onClick={() => setCurrentView(item.id as any)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${item.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${item.color}`} />
                    </div>
                    {getStatusIcon(item.status)}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-secondary-400 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {getStatusText(item.status)}
                    </span>
                    <Plus className="w-4 h-4 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Быстрые действия */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.id} 
                className="hover:bg-secondary-800 transition-colors cursor-pointer border-slate-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{action.title}</h4>
                      <p className="text-xs text-secondary-400">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Car className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Транспортные средства</p>
                <p className="text-lg font-semibold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Зарегистрированное оружие</p>
                <p className="text-lg font-semibold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-400">Активные лицензии</p>
                <p className="text-lg font-semibold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 