import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userManagementApi } from '@/shared/api/user-management';

// Mock supabase
const mockSupabase = {
  rpc: vi.fn(),
};

vi.mock('@/shared/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('userManagementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsersWithRoles', () => {
    it('should call get_users_with_roles RPC with correct parameters', async () => {
      // Arrange
      const mockResponse = [
        {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      // Act
      const result = await userManagementApi.getUsersWithRoles({
        page: 1,
        page_limit: 20,
        search_query: 'test',
      });

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_users_with_roles', {
        page: 1,
        page_limit: 20,
        search_query: 'test',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty search query by passing null', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      // Act
      await userManagementApi.getUsersWithRoles({
        page: 1,
        page_limit: 20,
        search_query: '',
      });

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_users_with_roles', {
        page: 1,
        page_limit: 20,
        search_query: null,
      });
    });

    it('should throw error when RPC fails', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      // Act & Assert
      await expect(userManagementApi.getUsersWithRoles({})).rejects.toThrow(
        'Failed to fetch users with roles: Database error'
      );
    });
  });

  describe('updateUserRoles', () => {
    it('should handle adding and removing roles correctly', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ error: null });

      const userId = 'user-1';
      const currentRoleIds = ['role-1', 'role-2'];
      const newRoleIds = ['role-2', 'role-3'];

      // Mock the individual RPC calls
      const assignRoleToUserSpy = vi.spyOn(userManagementApi, 'assignRoleToUser').mockResolvedValue();
      const revokeRoleFromUserSpy = vi.spyOn(userManagementApi, 'revokeRoleFromUser').mockResolvedValue();

      // Act
      await userManagementApi.updateUserRoles(userId, currentRoleIds, newRoleIds);

      // Assert
      expect(assignRoleToUserSpy).toHaveBeenCalledWith(userId, 'role-3'); // New role
      expect(revokeRoleFromUserSpy).toHaveBeenCalledWith(userId, 'role-1'); // Removed role
      expect(assignRoleToUserSpy).toHaveBeenCalledTimes(1);
      expect(revokeRoleFromUserSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle case when no changes are needed', async () => {
      // Arrange
      const userId = 'user-1';
      const currentRoleIds = ['role-1', 'role-2'];
      const newRoleIds = ['role-1', 'role-2']; // Same roles

      const assignRoleToUserSpy = vi.spyOn(userManagementApi, 'assignRoleToUser').mockResolvedValue();
      const revokeRoleFromUserSpy = vi.spyOn(userManagementApi, 'revokeRoleFromUser').mockResolvedValue();

      // Act
      await userManagementApi.updateUserRoles(userId, currentRoleIds, newRoleIds);

      // Assert
      expect(assignRoleToUserSpy).not.toHaveBeenCalled();
      expect(revokeRoleFromUserSpy).not.toHaveBeenCalled();
    });
  });

  describe('assignRoleToUser', () => {
    it('should call assign_role_to_user RPC with correct parameters', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ error: null });

      // Act
      await userManagementApi.assignRoleToUser('user-1', 'role-1');

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith('assign_role_to_user', {
        p_user_id: 'user-1',
        p_role_id: 'role-1',
      });
    });

    it('should throw error when RPC fails', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        error: { message: 'Permission denied' },
      });

      // Act & Assert
      await expect(userManagementApi.assignRoleToUser('user-1', 'role-1')).rejects.toThrow(
        'Failed to assign role to user: Permission denied'
      );
    });
  });

  describe('revokeRoleFromUser', () => {
    it('should call revoke_role_from_user RPC with correct parameters', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ error: null });

      // Act
      await userManagementApi.revokeRoleFromUser('user-1', 'role-1');

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith('revoke_role_from_user', {
        p_user_id: 'user-1',
        p_role_id: 'role-1',
      });
    });

    it('should throw error when RPC fails', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        error: { message: 'Role not found' },
      });

      // Act & Assert
      await expect(userManagementApi.revokeRoleFromUser('user-1', 'role-1')).rejects.toThrow(
        'Failed to revoke role from user: Role not found'
      );
    });
  });
});