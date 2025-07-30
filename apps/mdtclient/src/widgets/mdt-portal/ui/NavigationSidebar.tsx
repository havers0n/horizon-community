import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '@/shared/contexts/LocaleContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Bell, 
  FileText, 
  Users, 
  Car, 
  Building, 
  Map, 
  Phone, 
  Heart, 
  Flame, 
  LogOut 
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  department?: string;
}

export const NavigationSidebar: React.FC = () => {
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/', icon: <LayoutDashboard className="w-5 h-5" />, label: t('dashboard') },
    { path: '/civil', icon: <Users className="w-5 h-5" />, label: 'Гражданский департамент', department: 'civil' },
    { path: '/leo', icon: <FileText className="w-5 h-5" />, label: 'Полицейский департамент', department: 'leo' },
    { path: '/dispatch', icon: <Phone className="w-5 h-5" />, label: 'Диспетчерский департамент', department: 'dispatch' },
    { path: '/ems', icon: <Heart className="w-5 h-5" />, label: 'EMS департамент', department: 'ems' },
    { path: '/fd', icon: <Flame className="w-5 h-5" />, label: 'FD департамент', department: 'fd' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-600/50 flex flex-col shadow-2xl shadow-slate-900/50">
      {/* Navigation items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out rounded-lg transform hover:scale-105 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 glow-primary'
                    : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-md'
                }`}
              >
                <span className={`mr-3 transition-all duration-200 ${isActive(item.path) ? 'glow' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-600/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 hover:text-white transition-all duration-200 ease-in-out rounded-lg transform hover:scale-105 hover:shadow-md"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}; 
