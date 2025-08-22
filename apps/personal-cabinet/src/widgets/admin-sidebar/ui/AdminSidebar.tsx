import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ADMIN_SIDEBAR_CONFIG, type NavItem, type NavGroup } from '../config';

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const location = useLocation();
  const { hasAnyPermission } = usePermissions();

  // Фильтруем пункты меню на основе пермишенов пользователя
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => hasAnyPermission(item.requiredPermissions));
  };

  // Фильтруем группы - показываем только те, у которых есть доступные пункты
  const filterGroups = (groups: NavGroup[]): NavGroup[] => {
    return groups
      .map(group => ({
        ...group,
        items: filterItems(group.items),
      }))
      .filter(group => group.items.length > 0);
  };

  const visibleGroups = filterGroups(ADMIN_SIDEBAR_CONFIG);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border",
      className
    )}>
      {/* Заголовок */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">
          Админ-панель
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление системой
        </p>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {visibleGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Заголовок группы */}
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
            </div>

            {/* Пункты группы */}
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <NavLink
                    key={itemIndex}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      active 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      active ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Футер с информацией о версии (опционально) */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}