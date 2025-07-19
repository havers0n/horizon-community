import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Shield, 
  Bell, 
  ChevronDown, 
  Users, 
  FileText, 
  Building, 
  Headphones, 
  Radio, 
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Calendar
} from "lucide-react";
import LanguageDropdown from "@/components/ui/LanguageDropdown";
import { NotificationsModal } from "@/components/NotificationsModal";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  
  console.log('Layout render - user:', !!user);
  
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDiscordClick = () => {
    window.open('https://discord.gg/your-server', '_blank');
  };

  const handleVKClick = () => {
    window.open('https://vk.com/your-group', '_blank');
  };

  const navItems = [
    { path: '/dashboard', label: 'Личный кабинет', icon: Shield },
    { path: '/departments', label: 'Департаменты', icon: Building },
    { path: '/applications', label: 'Заявки', icon: FileText },
    { path: '/joint-positions', label: 'Совмещения', icon: Users },
    { path: '/leave-management', label: 'Отпуска', icon: Calendar },
    { path: '/reports', label: 'Рапорты', icon: FileText },
    { path: '/support', label: 'Поддержка', icon: Headphones },
    { path: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  // Проверяем роль пользователя из user_metadata или app_metadata
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  if (userRole === 'supervisor' || userRole === 'admin') {
    navItems.push({ path: '/admin', label: 'Админ панель', icon: Users });
    navItems.push({ path: '/admin-leave-management', label: 'Управление отпусками', icon: Calendar });
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.email?.substring(0, user.email.indexOf('@')) || 'User';
  };

  const getUserRoleDisplay = () => {
    switch (userRole) {
      case 'candidate': return 'Кандидат';
      case 'member': return 'Участник';
      case 'supervisor': return 'Супервайзер';
      case 'admin': return 'Администратор';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="text-primary text-2xl mr-3" />
                <span className="text-xl font-bold text-gray-900">Los Santos RP</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex space-x-8">
                {navItems.map((item) => {
                  const isActive = location.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`py-4 px-1 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-primary border-b-2 border-primary' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Social Media Links */}
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDiscordClick}
                  className="text-[#5865F2] hover:bg-[#5865F2] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVKClick}
                  className="text-[#4C75A3] hover:bg-[#4C75A3] hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Notifications */}
              <NotificationsModal />

              {/* Language Dropdown */}
              <LanguageDropdown />

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white text-sm font-medium">
                        {user ? getUserInitials(user.email || '') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {getUserRoleDisplay()}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLogout}>
                    {/* {t('navigation.logout', 'Выйти из аккаунта')} */}
                    Выйти из аккаунта
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
