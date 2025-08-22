import { supabase } from '@/shared/lib/supabase';

// Types for role management
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  display_name: string;
  description?: string;
  category?: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
}

export interface UpdateRoleData {
  display_name: string;
  description?: string;
}

// Role management functions
export const roleManagementApi = {
  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase.rpc('get_all_roles');
    
    if (error) {
      console.error('Error fetching roles:', error);
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
    
    return data || [];
  },

  // Create a new role
  async createRole(roleData: CreateRoleData): Promise<Role> {
    const { data, error } = await supabase.rpc('create_role', {
      name: roleData.name,
      display_name: roleData.display_name,
      description: roleData.description || null,
    });
    
    if (error) {
      console.error('Error creating role:', error);
      throw new Error(`Failed to create role: ${error.message}`);
    }
    
    return data;
  },

  // Update a role
  async updateRole(roleId: string, roleData: UpdateRoleData): Promise<Role> {
    const { data, error } = await supabase.rpc('update_role', {
      role_id: roleId,
      display_name: roleData.display_name,
      description: roleData.description || null,
    });
    
    if (error) {
      console.error('Error updating role:', error);
      throw new Error(`Failed to update role: ${error.message}`);
    }
    
    return data;
  },

  // Delete a role
  async deleteRole(roleId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_role', {
      role_id: roleId,
    });
    
    if (error) {
      console.error('Error deleting role:', error);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  },

  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase.rpc('get_all_permissions');
    
    if (error) {
      console.error('Error fetching permissions:', error);
      throw new Error(`Failed to fetch permissions: ${error.message}`);
    }
    
    return data || [];
  },

  // Get permissions for a specific role
  async getRolePermissions(roleId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_role_permissions', {
      p_role_id: roleId,
    });
    
    if (error) {
      console.error('Error fetching role permissions:', error);
      throw new Error(`Failed to fetch role permissions: ${error.message}`);
    }
    
    return data || [];
  },

  // Grant permission to role
  async grantPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const { error } = await supabase.rpc('grant_permission_to_role', {
      p_role_id: roleId,
      p_permission_id: permissionId,
    });
    
    if (error) {
      console.error('Error granting permission:', error);
      throw new Error(`Failed to grant permission: ${error.message}`);
    }
  },

  // Revoke permission from role
  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const { error } = await supabase.rpc('revoke_permission_from_role', {
      p_role_id: roleId,
      p_permission_id: permissionId,
    });
    
    if (error) {
      console.error('Error revoking permission:', error);
      throw new Error(`Failed to revoke permission: ${error.message}`);
    }
  },
};