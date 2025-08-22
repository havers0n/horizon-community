import { supabase } from '@/shared/lib/supabase';

// Types for user management
export interface UserWithRoles {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  created_at: string;
  last_sign_in_at?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

export interface GetUsersWithRolesParams {
  page?: number;
  page_limit?: number;
  search_query?: string;
}

export interface UsersWithRolesPaginatedResponse {
  users: UserWithRoles[];
  total_count: number;
  page: number;
  page_limit: number;
  total_pages: number;
}

// User management functions
export const userManagementApi = {
  // Get users with their roles (paginated with search)
  async getUsersWithRoles(params: GetUsersWithRolesParams = {}): Promise<UserWithRoles[]> {
    const { page = 1, page_limit = 20, search_query = '' } = params;
    
    // --- НАЧАЛО БЛОКА ЛОГИРОВАНИЯ ---
    console.log(`%c[UserManagement API] Calling RPC: get_users_with_roles`, 'color: blue; font-weight: bold;', {
      page,
      page_limit,
      search_query: search_query || null,
      original_params: params
    });
    
    const { data, error } = await supabase.rpc('get_users_with_roles', {
      page,
      page_limit,
      search_query: search_query || null,
    });
    
    console.log('%c[UserManagement API] RAW Response from RPC:', 'color: blue; font-weight: bold;', {
      data,
      error,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'not array'
    });
    // --- КОНЕЦ БЛОКА ЛОГИРОВАНИЯ ---
    
    if (error) {
      console.error('Error fetching users with roles:', error);
      throw new Error(`Failed to fetch users with roles: ${error.message}`);
    }
    
    // Return data directly as array of users
    const result = data || [];
    
    console.log('%c[UserManagement API] Final processed result:', 'color: green; font-weight: bold;', result);
    
    return result;
  },

  // Get all available roles in the system
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase.rpc('get_all_roles');
    
    if (error) {
      console.error('Error fetching all roles:', error);
      throw new Error(`Failed to fetch all roles: ${error.message}`);
    }
    
    return data || [];
  },

  // Assign a role to a user
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase.rpc('assign_role_to_user', {
      p_user_id: userId,
      p_role_id: roleId,
    });
    
    if (error) {
      console.error('Error assigning role to user:', error);
      throw new Error(`Failed to assign role to user: ${error.message}`);
    }
  },

  // Revoke a role from a user
  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase.rpc('revoke_role_from_user', {
      p_user_id: userId,
      p_role_id: roleId,
    });
    
    if (error) {
      console.error('Error revoking role from user:', error);
      throw new Error(`Failed to revoke role from user: ${error.message}`);
    }
  },

  // Batch update user roles (assign new roles and revoke removed roles)
  async updateUserRoles(userId: string, currentRoleIds: string[], newRoleIds: string[]): Promise<void> {
    const rolesToAdd = newRoleIds.filter(roleId => !currentRoleIds.includes(roleId));
    const rolesToRemove = currentRoleIds.filter(roleId => !newRoleIds.includes(roleId));

    // Prepare promises for parallel execution
    const assignPromises = rolesToAdd.map(roleId => 
      this.assignRoleToUser(userId, roleId)
    );
    
    const revokePromises = rolesToRemove.map(roleId => 
      this.revokeRoleFromUser(userId, roleId)
    );

    // Execute all role changes in parallel
    try {
      await Promise.all([...assignPromises, ...revokePromises]);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error(`Failed to update user roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};