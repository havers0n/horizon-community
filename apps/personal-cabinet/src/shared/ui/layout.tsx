import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./sheet";
import { 
  Bell, 
  Home, 
  Users, 
  FileText, 
  ClipboardList, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Menu, 
  User,
  Building2,
  BarChart3,
  MessageSquare,
  Shield
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useTheme } from "@/features/theme";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDiscordClick = () => {
    window.open("https://discord.gg/your-server", "_blank");
  };

  const handleVKClick = () => {
    window.open("https://vk.com/your-group", "_blank");
  };

  const navigation = [
    { name: "Главная", href: "/dashboard", icon: Home },
    { name: "Департаменты", href: "/departments", icon: Building2 },
    { name: "Заявки", href: "/applications", icon: ClipboardList },
    { name: "Отчеты", href: "/reports", icon: FileText },
    { name: "Тесты", href: "/tests", icon: BarChart3 },
    { name: "Поддержка", href: "/support", icon: HelpCircle },
    { name: "Админ панель", href: "/admin", icon: Shield },
  ];

  const getUserInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.username || user?.email || "Пользователь";
  };

  const getUserRoleDisplay = () => {
    return user?.role === "admin" ? "Администратор" : "Пользователь";
  };

  // Показываем загрузку, если данные пользователя еще загружаются
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">HC</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
              HorizonCommunity
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="transition-all duration-200"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={getUserDisplayName()} />
                    <AvatarFallback>{getUserInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getUserRoleDisplay()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Профиль</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Меню</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Button
                        key={item.name}
                        variant={isActive ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => navigate(item.href)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                © 2024 HorizonCommunity. Все права защищены.
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscordClick}
                className="transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discord
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVKClick}
                className="transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Users className="h-4 w-4 mr-2" />
                VK
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 