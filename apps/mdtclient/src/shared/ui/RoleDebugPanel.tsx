import React, { useState } from 'react';
import { Settings, Shield, Users } from 'lucide-react';
import { RoleDebugger } from '@/shared/utils/roleDebugger';
import { useUserRoles } from '@/shared/hooks/useUserRoles';
import { Button } from '@/shared/ui/atoms/Button';

export const RoleDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { roles, isEmergencyService, isCivilian } = useUserRoles();

  const handleSetRole = (roleType: keyof typeof RoleDebugger.testRoles) => {
    RoleDebugger.setTestRole(roleType);
  };

  const handleClearRole = () => {
    RoleDebugger.clearTestRole();
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* Кнопка открытия панели */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900/90 backdrop-blur-md border-slate-700/50 text-white"
      >
        <Settings className="h-4 w-4 mr-2" />
        Отладка ролей
      </Button>

      {/* Панель отладки */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl z-50 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Текущие роли</h3>
            <div className="text-xs text-slate-400 mb-2">
              {roles.length > 0 ? roles.join(', ') : 'Нет ролей'}
            </div>
            <div className="flex gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${isEmergencyService() ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {isEmergencyService() ? 'Экстренные службы' : 'Гражданский'}
              </span>
              <span className={`px-2 py-1 rounded ${isCivilian() ? 'bg-blue-600/20 text-blue-400' : 'bg-orange-600/20 text-orange-400'}`}>
                {isCivilian() ? 'Гражданский' : 'Служба'}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Установить тестовую роль</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('civilian')}
                className="text-xs h-8"
              >
                <Users className="h-3 w-3 mr-1" />
                Гражданский
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('leo')}
                className="text-xs h-8"
              >
                <Shield className="h-3 w-3 mr-1" />
                Полиция
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('dispatch')}
                className="text-xs h-8"
              >
                Диспетчер
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('ems')}
                className="text-xs h-8"
              >
                Скорая
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('fire')}
                className="text-xs h-8"
              >
                Пожарные
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetRole('admin')}
                className="text-xs h-8"
              >
                Админ
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearRole}
              className="flex-1 text-xs"
            >
              Очистить тестовую роль
            </Button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            <p>💡 Используйте для тестирования доступа к ядрам</p>
            <p>⚠️ Только для разработки</p>
          </div>
        </div>
      )}
    </div>
  );
}; 