import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigationStore } from '@/shared/model/navigationStore';
import { LanguageSwitcher } from '@/features/language-switcher';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';

export const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const { 
    getActiveDepartment, 
    getAvailableDepartments, 
    selectDepartment 
  } = useNavigationStore();
  const [time, setTime] = useState(new Date());
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);

  const activeDepartment = getActiveDepartment();
  const availableDepartments = getAvailableDepartments();

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleDepartmentSelect = (departmentId: string) => {
    selectDepartment(departmentId);
    setIsDepartmentDropdownOpen(false);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-secondary-700/50 p-3 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-grow">
        <h1 className="text-xl font-bold text-white flex-shrink-0">SC-MDT</h1>
        
        {activeDepartment && (
          <div className="hidden md:flex items-center gap-3 border-l-2 border-secondary-700/50 pl-4">
            {/* Переключатель департаментов */}
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50"
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
              >
                <Building2 className="h-4 w-4" />
                <span className="font-semibold text-white">
                  {activeDepartment.name}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Выпадающий список департаментов */}
              {isDepartmentDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <div className="text-xs text-slate-400 px-3 py-2 border-b border-slate-600/30">
                      Выберите департамент
                    </div>
                    <div className="space-y-1 mt-2">
                      {availableDepartments.map(department => (
                        <Button
                          key={department.id}
                          variant={department.id === activeDepartment.id ? 'default' : 'ghost'}
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() => handleDepartmentSelect(department.id)}
                        >
                          <div className="flex items-center gap-3">
                            {department.modules[0]?.icon && React.createElement(department.modules[0].icon, {
                              className: "h-4 w-4 flex-shrink-0"
                            })}
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{department.name}</div>
                              <div className="text-xs text-slate-400">
                                {department.modules.length} модулей
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-xs text-secondary-400 leading-tight">
                {user?.username || 'Пользователь'}
              </p>
            </div>
          </div>
        )}
        
        <div className="ml-auto font-mono font-bold text-primary-400 text-lg bg-secondary-950/50 backdrop-blur-sm px-3 py-1 rounded-md border border-secondary-700/50">
          {time.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })}
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        <LanguageSwitcher />
        
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-300">{user.username}</span>
            <img 
              src={`https://picsum.photos/seed/${user.username}/40`}
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-primary-500" 
            />
          </div>
        )}
      </div>
      
      {/* Оверлей для закрытия выпадающего списка */}
      {isDepartmentDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsDepartmentDropdownOpen(false)}
        />
      )}
    </header>
  );
}; 