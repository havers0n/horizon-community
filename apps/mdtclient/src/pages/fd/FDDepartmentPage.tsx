import React from 'react';
import { Flame, FileText, Users, Activity, AlertTriangle } from 'lucide-react';

export const FDDepartmentPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">FD Департамент</h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <FileText className="w-6 h-6 text-blue-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">Создать отчет FD</h3>
            <p className="text-sm text-slate-400">Пожарный отчет</p>
          </div>
        </button>

        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <Users className="w-6 h-6 text-green-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">Сотрудники</h3>
            <p className="text-sm text-slate-400">Управление персоналом</p>
          </div>
        </button>

        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <Activity className="w-6 h-6 text-yellow-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">Журнал смен</h3>
            <p className="text-sm text-slate-400">История смен</p>
          </div>
        </button>

        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <Flame className="w-6 h-6 text-red-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">История вызовов</h3>
            <p className="text-sm text-slate-400">Архив вызовов</p>
          </div>
        </button>

        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <AlertTriangle className="w-6 h-6 text-orange-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">Активные пожары</h3>
            <p className="text-sm text-slate-400">Текущие инциденты</p>
          </div>
        </button>

        <button className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
          <Users className="w-6 h-6 text-purple-400 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-white">Управление юнитами</h3>
            <p className="text-sm text-slate-400">Статусы пожарных</p>
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <Flame className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-slate-400">Активных пожарных</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm text-slate-400">Отчетов сегодня</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-sm text-slate-400">Активных пожаров</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-sm text-slate-400">Юнитов на смене</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Последние пожары</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
              <div>
                <p className="font-medium text-white">Пожар в жилом доме</p>
                <p className="text-sm text-slate-400">123 Main St</p>
                <p className="text-xs text-slate-500">19:15</p>
              </div>
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Критично</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
              <div>
                <p className="font-medium text-white">ДТП с возгоранием</p>
                <p className="text-sm text-slate-400">Highway 101</p>
                <p className="text-xs text-slate-500">18:30</p>
              </div>
              <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">Средне</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Активные пожарные</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-white">Engine 1</p>
                  <p className="text-sm text-slate-400">Доступен</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-white">Engine 2</p>
                  <p className="text-sm text-slate-400">На пожаре</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-white">Ladder 1</p>
                  <p className="text-sm text-slate-400">В пути</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Status */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Статус оборудования</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <Flame className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">4</p>
            <p className="text-sm text-slate-400">Пожарные машины</p>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">2</p>
            <p className="text-sm text-slate-400">Лестницы</p>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">1</p>
            <p className="text-sm text-slate-400">Спецтехника</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 
