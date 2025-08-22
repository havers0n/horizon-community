import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContext';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PermissionGuard } from '@/shared/ui/permission-guard';
import { RoleList } from '@/widgets/role-list';
import { PermissionEditor } from '@/widgets/permission-editor';

export default function AdminRolesPage() {
  const { isLoading } = useSession();
  const { isLoggedIn, isAdmin } = usePermissions();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Handle role selection
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PermissionGuard permission="admin.roles.read">
      <div className="container mx-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Управление ролями и доступами
          </h1>
          <p className="text-muted-foreground mt-2">
            Создавайте роли и настраивайте разрешения для управления доступом пользователей к системе.
          </p>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel (Master) - Role List */}
          <div className="lg:col-span-1">
            <RoleList
              selectedRoleId={selectedRoleId}
              onSelectRole={handleSelectRole}
            />
          </div>

          {/* Right Panel (Detail) - Permission Editor */}
          <div className="lg:col-span-2">
            <PermissionEditor selectedRoleId={selectedRoleId} />
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}