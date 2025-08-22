import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/widgets/admin-sidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

/**
 * Основной layout для админ-панели
 * Предоставляет двухколоночную структуру:
 * - Слева: Навигационное меню AdminSidebar (~20% ширины)
 * - Справа: Область контента для отображения страниц (~80% ширины)
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Левая колонка - Навигация */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar className="h-full" />
      </div>

      {/* Правая колонка - Контент */}
      <div className="flex-1 overflow-y-auto">
        <main className="h-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}