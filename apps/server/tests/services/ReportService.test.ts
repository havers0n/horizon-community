import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ReportService } from '../../services/ReportService';
import { SupabaseStorage } from '../../services/SupabaseStorage';
import { Report, InsertReport, UpdateReport, User } from '@roleplay-identity/shared-types';

// Мокаем SupabaseStorage
jest.mock('../../services/SupabaseStorage');

describe('ReportService', () => {
  let reportService: ReportService;
  let mockStorage: jest.Mocked<SupabaseStorage>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'Citizen' as any,
    avatarUrl: 'https://example.com/avatar.jpg',
    isActive: true,
    isVerified: true,
    lastLoginAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockReport: Report = {
    id: '1',
    authorId: '1',
    title: 'Test Report',
    content: 'This is a test report content',
    type: 'Arrest',
    status: 'draft',
    reviewedBy: undefined,
    reviewedAt: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockInsertReport: InsertReport = {
    authorId: '1',
    title: 'Test Report',
    content: 'This is a test report content',
    type: 'Arrest',
    status: 'draft'
  };

  beforeEach(() => {
    mockStorage = new SupabaseStorage() as jest.Mocked<SupabaseStorage>;
    reportService = new ReportService(mockStorage);
  });

  describe('createReport', () => {
    it('should create a report successfully', async () => {
      mockStorage.insert.mockResolvedValue(mockReport);

      const result = await reportService.createReport(mockInsertReport);

      expect(mockStorage.insert).toHaveBeenCalledWith('reports', mockInsertReport);
      expect(result).toEqual(mockReport);
    });

    it('should throw error if author not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      await expect(reportService.createReport(mockInsertReport)).rejects.toThrow(
        'Автор отчета не найден или неактивен'
      );
    });

    it('should throw error if author is inactive', async () => {
      mockStorage.getById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(reportService.createReport(mockInsertReport)).rejects.toThrow(
        'Автор отчета не найден или неактивен'
      );
    });
  });

  describe('getReportById', () => {
    it('should return report by id', async () => {
      mockStorage.getById.mockResolvedValue(mockReport);

      const result = await reportService.getReportById('1');

      expect(mockStorage.getById).toHaveBeenCalledWith('reports', '1');
      expect(result).toEqual(mockReport);
    });

    it('should return null if report not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await reportService.getReportById('999');

      expect(result).toBeNull();
    });
  });

  describe('getReportsByAuthor', () => {
    it('should return reports by author id', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.getReportsByAuthor('1');

      expect(mockStorage.list).toHaveBeenCalledWith('reports', { authorId: '1' });
      expect(result).toEqual(mockReports);
    });
  });

  describe('getAllReports', () => {
    it('should return all reports', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.getAllReports();

      expect(mockStorage.list).toHaveBeenCalledWith('reports');
      expect(result).toEqual(mockReports);
    });
  });

  describe('getReportsByStatus', () => {
    it('should return reports by status', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.getReportsByStatus('draft');

      expect(mockStorage.list).toHaveBeenCalledWith('reports', { status: 'draft' });
      expect(result).toEqual(mockReports);
    });
  });

  describe('getReportsByType', () => {
    it('should return reports by type', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.getReportsByType('Arrest');

      expect(mockStorage.list).toHaveBeenCalledWith('reports', { type: 'Arrest' });
      expect(result).toEqual(mockReports);
    });
  });

  describe('updateReport', () => {
    it('should update report successfully', async () => {
      const updateData: UpdateReport = {
        title: 'Updated Report',
        content: 'Updated content'
      };
      const updatedReport = { ...mockReport, ...updateData };
      mockStorage.update.mockResolvedValue(updatedReport);

      const result = await reportService.updateReport('1', updateData);

      expect(mockStorage.update).toHaveBeenCalledWith('reports', '1', updateData);
      expect(result).toEqual(updatedReport);
    });

    it('should throw error if report not found', async () => {
      mockStorage.update.mockRejectedValue(new Error('Report not found'));

      await expect(reportService.updateReport('999', { title: 'Test' })).rejects.toThrow(
        'Report not found'
      );
    });
  });

  describe('deleteReport', () => {
    it('should delete report', async () => {
      await reportService.deleteReport('1');

      expect(mockStorage.delete).toHaveBeenCalledWith('reports', '1');
    });
  });

  describe('submitReport', () => {
    it('should submit report successfully', async () => {
      const submittedReport = { ...mockReport, status: 'submitted' };
      mockStorage.update.mockResolvedValue(submittedReport);

      const result = await reportService.submitReport('1');

      expect(mockStorage.update).toHaveBeenCalledWith('reports', '1', { status: 'submitted' });
      expect(result).toEqual(submittedReport);
    });

    it('should throw error if report not found', async () => {
      mockStorage.update.mockRejectedValue(new Error('Report not found'));

      await expect(reportService.submitReport('999')).rejects.toThrow('Report not found');
    });
  });

  describe('reviewReport', () => {
    it('should review report successfully', async () => {
      const reviewedReport = { 
        ...mockReport, 
        status: 'approved',
        reviewedBy: '2',
        reviewedAt: '2024-01-02T00:00:00Z'
      };
      mockStorage.update.mockResolvedValue(reviewedReport);

      const result = await reportService.reviewReport('1', 'approved', '2', 'Good report');

      expect(mockStorage.update).toHaveBeenCalledWith('reports', '1', {
        status: 'approved',
        reviewedBy: '2',
        reviewedAt: expect.any(String),
        content: expect.stringContaining('Good report')
      });
      expect(result).toEqual(reviewedReport);
    });

    it('should throw error if report not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      await expect(reportService.reviewReport('999', 'approved', '2')).rejects.toThrow(
        'Отчет не найден'
      );
    });

    it('should throw error if report already reviewed', async () => {
      const reviewedReport = { ...mockReport, status: 'approved' };
      mockStorage.getById.mockResolvedValue(reviewedReport);

      await expect(reportService.reviewReport('1', 'approved', '2')).rejects.toThrow(
        'Отчет уже рассмотрен'
      );
    });
  });

  describe('approveReport', () => {
    it('should approve report', async () => {
      const approvedReport = { ...mockReport, status: 'approved' };
      mockStorage.update.mockResolvedValue(approvedReport);

      const result = await reportService.approveReport('1', '2', 'Good report');

      expect(result).toEqual(approvedReport);
    });
  });

  describe('rejectReport', () => {
    it('should reject report', async () => {
      const rejectedReport = { ...mockReport, status: 'rejected' };
      mockStorage.update.mockResolvedValue(rejectedReport);

      const result = await reportService.rejectReport('1', '2', 'Bad report');

      expect(result).toEqual(rejectedReport);
    });
  });

  describe('searchReports', () => {
    it('should search reports by query', async () => {
      const mockReports = [mockReport];
      mockStorage.search.mockResolvedValue(mockReports);

      const result = await reportService.searchReports('test');

      expect(mockStorage.search).toHaveBeenCalledWith('reports', 'test', ['title', 'content']);
      expect(result).toEqual(mockReports);
    });
  });

  describe('getReportsWithDetails', () => {
    it('should return reports with author details', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);
      mockStorage.getById.mockResolvedValue(mockUser);

      const result = await reportService.getReportsWithDetails();

      expect(result).toEqual([{
        ...mockReport,
        author: mockUser
      }]);
    });
  });

  describe('getReportWithDetails', () => {
    it('should return report with author details', async () => {
      mockStorage.getById
        .mockResolvedValueOnce(mockReport) // report
        .mockResolvedValueOnce(mockUser);  // author

      const result = await reportService.getReportWithDetails('1');

      expect(result).toEqual({
        ...mockReport,
        author: mockUser
      });
    });

    it('should return null if report not found', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await reportService.getReportWithDetails('999');

      expect(result).toBeNull();
    });
  });

  describe('getReportStats', () => {
    it('should return report statistics', async () => {
      mockStorage.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20)  // draft
        .mockResolvedValueOnce(30)  // submitted
        .mockResolvedValueOnce(40)  // approved
        .mockResolvedValueOnce(10)  // rejected
        .mockResolvedValueOnce(50)  // arrest
        .mockResolvedValueOnce(30)  // medical
        .mockResolvedValueOnce(20); // incident

      const result = await reportService.getReportStats();

      expect(result).toEqual({
        total: 100,
        byStatus: {
          draft: 20,
          submitted: 30,
          approved: 40,
          rejected: 10
        },
        byType: {
          Arrest: 50,
          Medical: 30,
          Incident: 20
        }
      });
    });
  });

  describe('getAuthorReportStats', () => {
    it('should return author report statistics', async () => {
      mockStorage.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(2)   // draft
        .mockResolvedValueOnce(3)   // submitted
        .mockResolvedValueOnce(4)   // approved
        .mockResolvedValueOnce(1)   // rejected
        .mockResolvedValueOnce(5)   // arrest
        .mockResolvedValueOnce(3)   // medical
        .mockResolvedValueOnce(2);  // incident

      const result = await reportService.getAuthorReportStats('1');

      expect(result).toEqual({
        total: 10,
        byStatus: {
          draft: 2,
          submitted: 3,
          approved: 4,
          rejected: 1
        },
        byType: {
          Arrest: 5,
          Medical: 3,
          Incident: 2
        }
      });
    });
  });

  describe('getReportActivity', () => {
    it('should return report activity statistics', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      mockStorage.count
        .mockResolvedValueOnce(20)  // created
        .mockResolvedValueOnce(15)  // submitted
        .mockResolvedValueOnce(10)  // approved
        .mockResolvedValueOnce(5);  // rejected

      const result = await reportService.getReportActivity(30);

      expect(result).toEqual({
        created: 20,
        submitted: 15,
        approved: 10,
        rejected: 5
      });
    });
  });

  describe('validateReportData', () => {
    it('should validate report data correctly', () => {
      const result = reportService.validateReportData(mockInsertReport);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        ...mockInsertReport,
        title: '',
        content: ''
      };

      const result = reportService.validateReportData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportReportData', () => {
    it('should export report data for specific author', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.exportReportData('1');

      expect(result).toEqual(mockReports);
    });

    it('should export all report data when no authorId provided', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const result = await reportService.exportReportData();

      expect(result).toEqual(mockReports);
    });
  });

  describe('importReportData', () => {
    it('should import report data successfully', async () => {
      const mockReports = [mockReport];
      mockStorage.insert.mockResolvedValue(mockReport);
      mockStorage.getById.mockResolvedValue(mockUser);

      const result = await reportService.importReportData([mockInsertReport]);

      expect(result).toEqual(mockReports);
    });

    it('should handle import errors gracefully', async () => {
      mockStorage.getById.mockResolvedValue(null);

      const result = await reportService.importReportData([mockInsertReport]);

      expect(result).toEqual([]);
    });
  });

  describe('getReportsByDateRange', () => {
    it('should return reports by date range', async () => {
      const mockReports = [mockReport];
      mockStorage.list.mockResolvedValue(mockReports);

      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';

      const result = await reportService.getReportsByDateRange(startDate, endDate);

      expect(mockStorage.list).toHaveBeenCalledWith('reports', {
        createdAt: { gte: startDate, lte: endDate }
      });
      expect(result).toEqual(mockReports);
    });
  });
}); 