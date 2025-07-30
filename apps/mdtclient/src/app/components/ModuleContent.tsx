import React from 'react';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { PersonSearchWidget } from '@/features/law-enforcement/features/citizen-search/ui/PersonSearchWidget';
import { DispatchPortal } from '@/widgets/dispatch-portal';
import { MdtPortal } from '@/widgets/mdt-portal';
import { 
  Shield, 
  Phone, 
  AlertTriangle, 
  MapPin, 
  BarChart3, 
  Zap,
  User,
  Car,
  Radio,
  Signal,
  Home
} from 'lucide-react';

export const ModuleContent: React.FC = () => {
  const { activeModuleId, getActiveModule } = useNavigationStore();
  const activeModule = getActiveModule();

  // Если модуль не выбран, показываем оперативный дашборд
  if (!activeModuleId || !activeModule) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Мой статус */}
        <div className="dashboard-card">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-glow">Мой статус</h3>
          </div>
          <div className="space-y-4">
            <div className="card-inner">
              <p className="text-blue-400 text-sm">1-ADAM-12</p>
              <p className="text-slate-300 text-sm">Офицер: Джон Смит</p>
              <p className="text-slate-400 text-xs">Жетон: 12345</p>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-2">Текущий статус</p>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm">Доступен (10-8)</span>
              </div>
              <p className="text-slate-400 text-xs mb-1">Круизер LSPD #12</p>
              <p className="text-slate-500 text-xs">Обновлено: 14:35</p>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-3">Изменить статус</p>
              <div className="space-y-2">
                {[
                  { status: 'Доступен (10-8)', color: 'bg-green-400', selected: true },
                  { status: 'Занят (10-12)', color: 'bg-orange-400', selected: false },
                  { status: 'В пути (10-31)', color: 'bg-blue-400', selected: false },
                  { status: 'На месте (10-97)', color: 'bg-red-400', selected: false },
                  { status: 'Недоступен (10-7)', color: 'bg-slate-400', selected: false }
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg status-button ${
                      item.selected ? 'active' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                    <span className={`text-xs ${item.selected ? 'text-white' : 'text-slate-300'}`}>{item.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Активные вызовы */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-glow">Активные вызовы 2</h3>
            </div>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              Все вызовы
            </button>
          </div>
          <div className="space-y-3">
            {/* Вызов 1 */}
            <div className="card-inner border-red-500/20 bg-red-600/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm">911-001</span>
                  <span className="text-slate-400 text-xs">14:32</span>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-white text-sm mb-1">123 Vinewood Blvd</p>
              <p className="text-slate-300 text-xs mb-2">Ограбление банка в процессе</p>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-xs">Юниты:</span>
                <span className="text-blue-400 text-xs">1-ADAM-12</span>
                <span className="text-blue-400 text-xs">1-ADAM-14</span>
              </div>
            </div>
            
            {/* Вызов 2 */}
            <div className="card-inner border-yellow-500/20 bg-yellow-600/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 text-sm">911-002</span>
                  <span className="text-slate-400 text-xs">14:25</span>
                </div>
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-white text-sm mb-1">789 Grove Street</p>
              <p className="text-slate-300 text-xs">Нарушение ПДД, превышение скорости</p>
            </div>
          </div>
        </div>

        {/* Активные BOLO */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-glow">Активные BOLO 2</h3>
            </div>
            <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              Все BOLO
            </button>
          </div>
          <div className="space-y-3">
            {/* BOLO 1 */}
            <div className="card-inner border-red-500/20 bg-red-600/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm">BOLO-001</span>
                  <span className="text-slate-400 text-xs">14:15</span>
                </div>
                <Car className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-white text-sm mb-1">Подозрительный автомобиль</p>
              <p className="text-slate-300 text-xs mb-2">Красный Sultan RS, номер ABC-123</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Приоритет:</span>
                <span className="priority-badge high">Высокий</span>
              </div>
            </div>
            
            {/* BOLO 2 */}
            <div className="card-inner border-yellow-500/20 bg-yellow-600/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 text-sm">BOLO-002</span>
                  <span className="text-slate-400 text-xs">13:45</span>
                </div>
                <User className="h-4 w-4 text-yellow-400" />
              </div>
              <p className="text-white text-sm mb-1">Подозреваемый в краже</p>
              <p className="text-slate-300 text-xs mb-2">Мужчина, 30-35 лет, черная куртка</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Приоритет:</span>
                <span className="priority-badge medium">Средний</span>
              </div>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="dashboard-card">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-glow">Быстрые действия</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full panic-button py-3 px-4 rounded-lg text-sm flex items-center justify-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Кнопка паники</span>
            </button>
            <button className="w-full status-button py-3 px-4 rounded-lg text-sm flex items-center justify-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>Запрос подкрепления</span>
            </button>
            <button className="w-full status-button py-3 px-4 rounded-lg text-sm flex items-center justify-center space-x-2">
              <Signal className="h-4 w-4" />
              <span>Отправить сигнал</span>
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="dashboard-card">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-glow">Статистика</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 card-inner">
              <span className="text-slate-300 text-sm">Всего вызовов</span>
              <span className="text-white font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center p-2 card-inner">
              <span className="text-slate-300 text-sm">Активных</span>
              <span className="text-green-400 font-semibold">2</span>
            </div>
            <div className="flex justify-between items-center p-2 card-inner">
              <span className="text-slate-300 text-sm">Доступных юнитов</span>
              <span className="text-blue-400 font-semibold">8</span>
            </div>
            <div className="flex justify-between items-center p-2 card-inner">
              <span className="text-slate-300 text-sm">Ожидающих</span>
              <span className="text-yellow-400 font-semibold">3</span>
            </div>
          </div>
        </div>

        {/* Оперативная карта */}
        <div className="dashboard-card">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-glow">Оперативная карта</h3>
          </div>
          <div className="text-center py-8">
            <div className="card-inner mb-4">
              <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-2">Карта оперативной обстановки</p>
              <p className="text-slate-500 text-xs">Позиция: Центральный участок</p>
            </div>
            <div className="card-inner border-blue-500/20 bg-blue-600/10">
              <p className="text-blue-400 text-xs">GPS: 34.0522° N, 118.2437° W</p>
              <p className="text-slate-400 text-xs">Последнее обновление: 14:35:42</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Рендерим содержимое в зависимости от выбранного модуля
  const renderModuleContent = () => {
    switch (activeModuleId) {
      case 'person-search':
        return (
          <div className="dashboard-card">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-glow mb-2">
                {activeModule.name}
              </h1>
              <p className="text-slate-400">
                {activeModule.description}
              </p>
            </div>
            <PersonSearchWidget />
          </div>
        );

      case 'mdt-portal':
        return (
          <div className="dashboard-card">
            <MdtPortal onBackToModules={() => {}} />
          </div>
        );

      case 'dispatch-portal':
        return (
          <div className="dashboard-card">
            <DispatchPortal onBackToModules={() => {}} />
          </div>
        );

      // Для остальных модулей показываем заглушку
      default:
        return (
          <div className="dashboard-card">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-glow mb-4">
                {activeModule.name}
              </h1>
              <p className="text-slate-300 mb-6">
                {activeModule.description}
              </p>
              <div className="card-inner">
                <p className="text-slate-400">
                  Модуль находится в разработке. Скоро здесь появится полнофункциональный интерфейс.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderModuleContent();
}; 
