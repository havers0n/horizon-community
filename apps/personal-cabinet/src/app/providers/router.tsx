import { Routes, Route, Navigate } from 'react-router-dom'
import { 
  DashboardPage, 
  ProfilePage, 
  SettingsPage, 
  LoginPage, 
  RegisterPage,
  HomepagePage,
  FAQPage,
  DepartmentsPage,
  ApplicationsPage,
  TestsPage,
  ReportsPage,
  SupportPage,
  MDTPage,
  AdminPanelPage,
  LeaveManagementPage,
  TransferDepartmentPage,
  JointPositionsPage,
  EntryApplicationPage,
  TestExamPage,
  NotificationsPage,
  ForumPage,
  AdminLeaveManagementPage,
  AdminTestsPage,
  AdminReportsPage
} from '@pages'

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Защищенные маршруты */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* Редирект по умолчанию */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
} 