import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CabinetService } from '../../src/core/services/CabinetService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// Мокаем зависимости
const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
} as unknown as SupabaseClient<Database>;

const mockApplicationService = {
  getApplicationStatus: jest.fn(),
  getNextStepsForCandidate: jest.fn(),
} as any;

const mockReportService = {
  getReportsByUser: jest.fn(),
} as any;

describe('CabinetService', () => {
  let cabinetService: CabinetService;

  beforeEach(() => {
    jest.clearAllMocks();
    cabinetService = new CabinetService(
      mockSupabase,
      mockApplicationService,
      mockReportService
    );
  });

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      const mockProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'citizen',
        created_at: '2024-01-01T00:00:00Z',
        user_stats: {
          user_id: 'test-user-id',
          playtime_minutes: 120,
          reputation: 100,
          level: 5,
          experience: 1000,
          last_activity: '2024-01-01T00:00:00Z',
          warnings_admin: 0,
          warnings_game: 0,
        },
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await cabinetService.getUserProfile('test-user-id');

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should return null when profile not found', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' },
            }),
          }),
        }),
      });

      const result = await cabinetService.getUserProfile('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        username: 'newusername',
        bio: 'New bio',
      };

      const updatedProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'newusername',
        role: 'citizen',
        created_at: '2024-01-01T00:00:00Z',
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProfile,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await cabinetService.updateUserProfile('test-user-id', updateData);

      expect(result).toEqual(updatedProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        username: 'newusername',
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      await expect(
        cabinetService.updateUserProfile('test-user-id', updateData)
      ).rejects.toThrow('Failed to update profile: Update failed');
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings when found', async () => {
      const mockSettings = {
        user_id: 'test-user-id',
        theme: 'dark',
        language: 'ru',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profile_visible: true,
          show_email: false,
          show_phone: false,
        },
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSettings,
              error: null,
            }),
          }),
        }),
      });

      const result = await cabinetService.getUserSettings('test-user-id');

      expect(result).toEqual(mockSettings);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_settings');
    });

    it('should create default settings when not found', async () => {
      const mockDefaultSettings = {
        user_id: 'test-user-id',
        theme: 'system',
        language: 'ru',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profile_visible: true,
          show_email: false,
          show_phone: false,
        },
      };

      (mockSupabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockDefaultSettings,
                error: null,
              }),
            }),
          }),
        });

      const result = await cabinetService.getUserSettings('test-user-id');

      expect(result).toEqual(mockDefaultSettings);
    });
  });

  describe('getDashboardDataByUserId', () => {
    it('should return dashboard data for candidate user', async () => {
      const mockProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'candidate',
        created_at: '2024-01-01T00:00:00Z',
        user_stats: {
          user_id: 'test-user-id',
          playtime_minutes: 0,
          reputation: 0,
          level: 1,
          experience: 0,
          last_activity: '2024-01-01T00:00:00Z',
          warnings_admin: 0,
          warnings_game: 0,
        },
      };

      // Мокаем все методы
      jest.spyOn(cabinetService, 'getUserProfile').mockResolvedValue(mockProfile);
      jest.spyOn(cabinetService, 'getUserCharacter').mockResolvedValue(null);
      jest.spyOn(cabinetService, 'getUserStats').mockResolvedValue({
        applicationsCount: 0,
        reportsCount: 0,
        departmentsCount: 0,
        lastActivity: null,
        playtime: 0,
        reputation: 0,
        achievements: 0,
      });

      const result = await cabinetService.getDashboardDataByUserId('test-user-id');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('announcements');
      expect(result).toHaveProperty('usefulLinks');
      expect(result).toHaveProperty('applicationStatus');
      expect(result).toHaveProperty('nextSteps');
      expect(result.user.role).toBe('candidate');
      expect(result.applicationStatus?.attemptsLeft).toBe(3);
    });

    it('should throw error when profile not found', async () => {
      jest.spyOn(cabinetService, 'getUserProfile').mockResolvedValue(null);

      await expect(
        cabinetService.getDashboardDataByUserId('non-existent-id')
      ).rejects.toThrow('Profile not found');
    });
  });
}); 