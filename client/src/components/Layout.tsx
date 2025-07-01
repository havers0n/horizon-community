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
import { getAuthState, clearAuthState } from "@/lib/auth";
import { Shield, Bell, ChevronDown, Users, FileText, Building, Headphones } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = getAuthState();
  
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    clearAuthState();
    setLocation('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Shield },
    { path: '/departments', label: 'Departments', icon: Building },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/support', label: 'Support', icon: Headphones },
  ];

  if (user?.role === 'supervisor' || user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: Users });
  }

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
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
                <span className="text-xl font-bold text-gray-900">CAD System</span>
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
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5 text-gray-400" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white text-sm font-medium">
                        {user ? getUserInitials(user.username) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
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
