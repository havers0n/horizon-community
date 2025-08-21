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
        role: 'citizen' as const,
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
        user_stats: { /* ... */ },
      };

      // Correctly mock the direct Supabase call made by the method
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });
      // Mock other dependent calls
      jest.spyOn(cabinetService, 'getUserCharacter').mockResolvedValue(null);
      jest.spyOn(cabinetService, 'getUserStats').mockResolvedValue({} as any);
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
        }
        // Default mock for other tables like notifications
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });


      const result = await cabinetService.getDashboardDataByUserId('test-user-id');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('applicationStatus');
      expect(result.user.role).toBe('candidate');
    });

    it('should throw error when profile not found', async () => {
       // Mock the Supabase call to return an error
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      await expect(
        cabinetService.getDashboardDataByUserId('non-existent-id')
      ).rejects.toThrow('User profile not found');
    });
  });

  describe('Monthly Application Counting', () => {
    describe('getMonthlyApplicationCount', () => {
      it('should return correct count for applications in current month', async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const mockApplications = [
          { id: '1', author_user_id: 'test-user-id', created_at: startOfMonth.toISOString() },
          { id: '2', author_user_id: 'test-user-id', created_at: new Date().toISOString() },
        ];

        (mockSupabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: mockApplications,
                  error: null,
                }),
              }),
            }),
          }),
        });

        // Use reflection to access private method
        const result = await (cabinetService as any).getMonthlyApplicationCount('test-user-id');

        expect(result).toBe(2);
        expect(mockSupabase.from).toHaveBeenCalledWith('applications');
      });

      it('should return 0 when no applications found', async () => {
        (mockSupabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        });

        const result = await (cabinetService as any).getMonthlyApplicationCount('test-user-id');

        expect(result).toBe(0);
      });

      it('should handle database errors gracefully', async () => {
        (mockSupabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              }),
            }),
          }),
        });

        const result = await (cabinetService as any).getMonthlyApplicationCount('test-user-id');

        expect(result).toBe(0);
      });
    });

    describe('getAttemptsLeft', () => {
      it('should return correct attempts left when user has submitted applications', async () => {
        // Mock getMonthlyApplicationCount to return 1
        jest.spyOn(cabinetService as any, 'getMonthlyApplicationCount').mockResolvedValue(1);

        const result = await (cabinetService as any).getAttemptsLeft('test-user-id');

        expect(result).toBe(2); // 3 - 1 = 2
      });

      it('should return 3 when user has no applications this month', async () => {
        jest.spyOn(cabinetService as any, 'getMonthlyApplicationCount').mockResolvedValue(0);

        const result = await (cabinetService as any).getAttemptsLeft('test-user-id');

        expect(result).toBe(3);
      });

      it('should return 0 when user has reached the limit', async () => {
        jest.spyOn(cabinetService as any, 'getMonthlyApplicationCount').mockResolvedValue(3);

        const result = await (cabinetService as any).getAttemptsLeft('test-user-id');

        expect(result).toBe(0);
      });

      it('should return 0 when user has exceeded the limit', async () => {
        jest.spyOn(cabinetService as any, 'getMonthlyApplicationCount').mockResolvedValue(5);

        const result = await (cabinetService as any).getAttemptsLeft('test-user-id');

        expect(result).toBe(0);
      });
    });

    describe('Monthly reset logic', () => {
      it('should only count applications from current month', async () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
        
        const mockApplications = [
          { id: '1', author_user_id: 'test-user-id', created_at: thisMonth.toISOString() },
          // This should not be counted as it's from last month
          { id: '2', author_user_id: 'test-user-id', created_at: lastMonth.toISOString() },
        ];

        (mockSupabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: [mockApplications[0]], // Only current month application
                  error: null,
                }),
              }),
            }),
          }),
        });

        const result = await (cabinetService as any).getMonthlyApplicationCount('test-user-id');

        expect(result).toBe(1);
      });
    });
  });
}); 