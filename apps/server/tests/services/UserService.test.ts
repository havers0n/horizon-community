import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserService } from '../../services/UserService';
import { SupabaseStorage } from '../../services/SupabaseStorage';
import { User, InsertUser, UpdateUser, UserRole } from '@roleplay-identity/shared-types';

// Мокаем SupabaseStorage
jest.mock('../../services/SupabaseStorage');

describe('UserService', () => {
  let userService: UserService;
  let mockStorage: jest.Mocked<SupabaseStorage>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CITIZEN,
    avatarUrl: 'https://example.com/avatar.jpg',
    isActive: true,
    isVerified: true,
    lastLoginAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockInsertUser: InsertUser = {
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.CITIZEN,
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  beforeEach(() => {
    mockStorage = new SupabaseStorage() as jest.Mocked<SupabaseStorage>;
    userService = new UserService(mockStorage);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockStorage.insert.mockResolvedValue(mockUser);

      const result = await userService.createUser(mockInsertUser);

      expect(mockStorage.insert).toHaveBeenCalledWith('users', mockInsertUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if email already exists', async () => {
      mockStorage.list.mockResolvedValue([mockUser]);

      await expect(userService.createUser(mockInsertUser)).rejects.toThrow(
        'Пользователь с таким email уже существует'
      );
    });

    it('should throw error if username already exists', async () => {
      mockStorage.list
        .mockResolvedValueOnce([]) // email check
        .mockResolvedValueOnce([mockUser]); // username check

      await expect(userService.createUser(mockInsertUser)).rejects.toThrow(
        'Пользователь с таким username уже существует'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      mockStorage.getById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(mockStorage.getById).toHaveBeenCalledWith('users', '1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await userService.getUserById('999');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      mockStorage.list.mockResolvedValue([mockUser]);

      const result = await userService.getUserByEmail('test@example.com');

      expect(mockStorage.list).toHaveBeenCalledWith('users', { email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockStorage.list.mockResolvedValue([]);

      const result = await userService.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      mockStorage.list.mockResolvedValue([mockUser]);

      const result = await userService.getUserByUsername('testuser');

      expect(mockStorage.list).toHaveBeenCalledWith('users', { username: 'testuser' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockStorage.list.mockResolvedValue([]);

      const result = await userService.getUserByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all active users', async () => {
      const mockUsers = [mockUser];
      mockStorage.list.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockStorage.list).toHaveBeenCalledWith('users', { isActive: true });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUser = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      const updatedUser = { ...mockUser, ...updateData };
      mockStorage.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateData);

      expect(mockStorage.update).toHaveBeenCalledWith('users', '1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      mockStorage.update.mockRejectedValue(new Error('User not found'));

      await expect(userService.updateUser('999', { firstName: 'Test' })).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      mockStorage.update.mockResolvedValue({ ...mockUser, isActive: false });

      await userService.deleteUser('1');

      expect(mockStorage.update).toHaveBeenCalledWith('users', '1', { isActive: false });
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const mockUsers = [mockUser];
      mockStorage.search.mockResolvedValue(mockUsers);

      const result = await userService.searchUsers('test');

      expect(mockStorage.search).toHaveBeenCalledWith('users', 'test', ['firstName', 'lastName', 'username', 'email']);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users by role', async () => {
      const mockUsers = [mockUser];
      mockStorage.list.mockResolvedValue(mockUsers);

      const result = await userService.getUsersByRole(UserRole.CITIZEN);

      expect(mockStorage.list).toHaveBeenCalledWith('users', { role: UserRole.CITIZEN, isActive: true });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      const updatedUser = { ...mockUser, lastLoginAt: '2024-01-02T00:00:00Z' };
      mockStorage.update.mockResolvedValue(updatedUser);

      const result = await userService.updateLastLogin('1');

      expect(mockStorage.update).toHaveBeenCalledWith('users', '1', {
        lastLoginAt: expect.any(String)
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('verifyUser', () => {
    it('should verify user', async () => {
      const verifiedUser = { ...mockUser, isVerified: true };
      mockStorage.update.mockResolvedValue(verifiedUser);

      const result = await userService.verifyUser('1');

      expect(mockStorage.update).toHaveBeenCalledWith('users', '1', { isVerified: true });
      expect(result).toEqual(verifiedUser);
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockStorage.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // active
        .mockResolvedValueOnce(70)  // verified
        .mockResolvedValueOnce(10)  // citizens
        .mockResolvedValueOnce(5)   // leo
        .mockResolvedValueOnce(3)   // ems
        .mockResolvedValueOnce(2)   // dispatch
        .mockResolvedValueOnce(10); // admin

      const result = await userService.getUserStats();

      expect(result).toEqual({
        total: 100,
        active: 80,
        verified: 70,
        byRole: {
          [UserRole.CITIZEN]: 10,
          [UserRole.LEO]: 5,
          [UserRole.EMS_FD]: 3,
          [UserRole.DISPATCH]: 2,
          [UserRole.ADMIN]: 10
        }
      });
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity statistics', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      mockStorage.count
        .mockResolvedValueOnce(50)  // newUsers
        .mockResolvedValueOnce(20)  // activeUsers
        .mockResolvedValueOnce(10); // verifiedUsers

      const result = await userService.getUserActivity(30);

      expect(result).toEqual({
        newUsers: 50,
        activeUsers: 20,
        verifiedUsers: 10
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate password correctly', async () => {
      const hashedPassword = await userService.hashPassword('testpassword');
      const isValid = await userService.validatePassword('testpassword', hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const hashedPassword = await userService.hashPassword('testpassword');
      const isValid = await userService.validatePassword('wrongpassword', hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hashedPassword = await userService.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testpassword';
      const hash1 = await userService.hashPassword(password);
      const hash2 = await userService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
}); 