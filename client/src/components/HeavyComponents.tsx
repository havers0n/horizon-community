import { lazy } from 'react';

// Тяжелые компоненты с графиками и визуализацией
export const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
export const CAD = lazy(() => import('../pages/CAD'));
export const Reports = lazy(() => import('../pages/Reports'));
export const AdminReports = lazy(() => import('../pages/AdminReports'));

// Компоненты с формами и валидацией
export const Applications = lazy(() => import('../pages/Applications'));
export const Register = lazy(() => import('../pages/Register'));
export const TestExam = lazy(() => import('../pages/TestExam'));

// Админские компоненты
export const AdminPanel = lazy(() => import('../pages/AdminPanel'));
export const AdminLeaveManagement = lazy(() => import('../pages/AdminLeaveManagement'));
export const SupportPage = lazy(() => import('../pages/admin/SupportPage'));
export const AdminTicketDetails = lazy(() => import('../pages/admin/AdminTicketDetails')); 