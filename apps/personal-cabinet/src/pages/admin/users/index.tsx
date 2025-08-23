import React, { useState } from 'react';
import { PermissionGuard } from '@/shared/ui/permission-guard';
import { UserTable } from '@/widgets/user-table';
import { ManageUserRolesModal } from '@/features/manage-user-roles';
import { ManageUserCareerModal } from '@/features/manage-user-career';
import { type UserWithRoles } from '@/shared/api/user-management';

/**
 * Admin Users Management Page
 * Provides interface for managing system users and their roles
 * Protected by admin.users.read permission
 */
export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  // --- НАЧАЛО БЛОКА ЛОГИРОВАНИЯ АДМИН КОМПОНЕНТА ---
  React.useEffect(() => {
    console.log('%c[AdminUsersPage] Component mounted:', 'color: red; font-weight: bold;', {
      selectedUser,
      isManageModalOpen,
      'Component rendered successfully': true
    });
  }, []);
  // --- КОНЕЦ БЛОКА ЛОГИРОВАНИЯ АДМИН КОМПОНЕНТА ---

  // Handle user management action
  const handleManageUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsManageModalOpen(true);
  };

  // Handle career management action
  const handleManageCareer = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsCareerModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsManageModalOpen(false);
    setSelectedUser(null);
  };

  // Handle career modal close
  const handleCloseCareerModal = () => {
    setIsCareerModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <PermissionGuard permission="admin.users.read">
      <div className="container mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Управление пользователями
          </h1>
          <p className="text-muted-foreground mt-2">
            Просматривайте список пользователей системы и управляйте их ролями и правами доступа.
          </p>
        </div>

        {/* Users Table */}
        <UserTable onManageUser={handleManageUser} onManageCareer={handleManageCareer} />

        {/* Manage User Roles Modal */}
        {isManageModalOpen && selectedUser && (
          <ManageUserRolesModal
            user={selectedUser}
            open={isManageModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {/* Manage User Career Modal */}
        {isCareerModalOpen && selectedUser && (
          <ManageUserCareerModal
            user={selectedUser}
            open={isCareerModalOpen}
            onClose={handleCloseCareerModal}
          />
        )}
      </div>
    </PermissionGuard>
  );
}