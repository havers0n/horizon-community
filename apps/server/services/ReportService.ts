import { supabaseStorage } from './SupabaseStorage.js';
import type { Report, InsertReport } from '../types.js';

// ===== REPORT SERVICE - БИЗНЕС-ЛОГИКА ДЛЯ ОТЧЕТОВ =====

export class ReportService {
  
  // ===== АДАПТЕРЫ ТИПОВ =====
  
  private adaptSupabaseReportToReport(supabaseReport: any): Report {
    return {
      id: supabaseReport.id,
      authorId: supabaseReport.user_id,
      status: supabaseReport.status,
      fileUrl: supabaseReport.file_url,
      supervisorComment: supabaseReport.supervisor_comment || undefined,
      createdAt: new Date(supabaseReport.created_at),
      updatedAt: new Date(supabaseReport.updated_at)
    };
  }

  private adaptReportToSupabaseReport(report: InsertReport): any {
    return {
      user_id: report.authorId,
      status: report.status,
      file_url: report.fileUrl,
      supervisor_comment: report.supervisorComment || null
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getReport(id: number): Promise<Report | undefined> {
    const data = await supabaseStorage.getById('reports', id);
    return data ? this.adaptSupabaseReportToReport(data) : undefined;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const data = await supabaseStorage.list('reports', { user_id: userId });
    return data.map(report => this.adaptSupabaseReportToReport(report));
  }

  async getAllReports(): Promise<Report[]> {
    const data = await supabaseStorage.list('reports');
    return data.map(report => this.adaptSupabaseReportToReport(report));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const supabaseReport = this.adaptReportToSupabaseReport(report);
    const data = await supabaseStorage.insert('reports', supabaseReport);
    
    if (!data) {
      throw new Error('Failed to create report');
    }
    
    return this.adaptSupabaseReportToReport(data);
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const supabaseUpdates: any = {};
    
    if (updates.authorId !== undefined) supabaseUpdates.user_id = updates.authorId;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.fileUrl !== undefined) supabaseUpdates.file_url = updates.fileUrl;
    if (updates.supervisorComment !== undefined) supabaseUpdates.supervisor_comment = updates.supervisorComment;
    
    const data = await supabaseStorage.update('reports', id, supabaseUpdates);
    return data ? this.adaptSupabaseReportToReport(data) : undefined;
  }

  async deleteReport(id: number): Promise<boolean> {
    return await supabaseStorage.delete('reports', id);
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async getReportsWithFilters(filters: {
    authorId?: number;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Report[]> {
    const supabaseFilters: Record<string, any> = {};
    
    if (filters.authorId !== undefined) supabaseFilters.user_id = filters.authorId;
    if (filters.status !== undefined) supabaseFilters.status = filters.status;
    
    const data = await supabaseStorage.list('reports', supabaseFilters, {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { column: 'created_at', ascending: false }
    });
    
    let reports = data.map(report => this.adaptSupabaseReportToReport(report));
    
    // Фильтрация по датам (если указана)
    if (filters.dateFrom) {
      reports = reports.filter(report => report.createdAt >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      reports = reports.filter(report => report.createdAt <= filters.dateTo!);
    }
    
    return reports;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    const data = await supabaseStorage.list('reports', { status });
    return data.map(report => this.adaptSupabaseReportToReport(report));
  }

  async getReportsByDateRange(dateFrom: Date, dateTo: Date): Promise<Report[]> {
    const allReports = await this.getAllReports();
    return allReports.filter(report => 
      report.createdAt >= dateFrom && report.createdAt <= dateTo
    );
  }

  async getRecentReports(limit: number = 10): Promise<Report[]> {
    const data = await supabaseStorage.list('reports', {}, {
      limit,
      orderBy: { column: 'created_at', ascending: false }
    });
    return data.map(report => this.adaptSupabaseReportToReport(report));
  }

  // ===== СТАТИСТИКА =====
  
  async getReportCount(): Promise<number> {
    return await supabaseStorage.count('reports');
  }

  async getReportCountByUser(userId: number): Promise<number> {
    return await supabaseStorage.count('reports', { user_id: userId });
  }

  async getReportCountByStatus(status: string): Promise<number> {
    return await supabaseStorage.count('reports', { status });
  }

  async getReportStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byUser: Record<number, number>;
    recent: number; // за последние 7 дней
  }> {
    const allReports = await this.getAllReports();
    const stats = {
      total: allReports.length,
      byStatus: {} as Record<string, number>,
      byUser: {} as Record<number, number>,
      recent: 0
    };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    allReports.forEach(report => {
      // Подсчет по статусам
      stats.byStatus[report.status] = (stats.byStatus[report.status] || 0) + 1;
      
      // Подсчет по пользователям
      stats.byUser[report.authorId] = (stats.byUser[report.authorId] || 0) + 1;
      
      // Подсчет недавних отчетов
      if (report.createdAt >= sevenDaysAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  }

  // ===== БИЗНЕС-ЛОГИКА =====
  
  async approveReport(id: number, supervisorComment?: string): Promise<Report | undefined> {
    return await this.updateReport(id, { 
      status: 'approved',
      supervisorComment: supervisorComment || undefined
    });
  }

  async rejectReport(id: number, supervisorComment: string): Promise<Report | undefined> {
    return await this.updateReport(id, { 
      status: 'rejected',
      supervisorComment
    });
  }

  async submitForReview(id: number): Promise<Report | undefined> {
    return await this.updateReport(id, { status: 'pending_review' });
  }

  async markAsDraft(id: number): Promise<Report | undefined> {
    return await this.updateReport(id, { status: 'draft' });
  }

  async archiveReport(id: number): Promise<Report | undefined> {
    return await this.updateReport(id, { status: 'archived' });
  }

  async getPendingReports(): Promise<Report[]> {
    return await this.getReportsByStatus('pending_review');
  }

  async getApprovedReports(): Promise<Report[]> {
    return await this.getReportsByStatus('approved');
  }

  async getRejectedReports(): Promise<Report[]> {
    return await this.getReportsByStatus('rejected');
  }

  async getDraftReports(): Promise<Report[]> {
    return await this.getReportsByStatus('draft');
  }

  async getArchivedReports(): Promise<Report[]> {
    return await this.getReportsByStatus('archived');
  }

  async getUserReportStats(userId: number): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    draft: number;
    archived: number;
  }> {
    const userReports = await this.getReportsByUser(userId);
    
    return {
      total: userReports.length,
      approved: userReports.filter(r => r.status === 'approved').length,
      rejected: userReports.filter(r => r.status === 'rejected').length,
      pending: userReports.filter(r => r.status === 'pending_review').length,
      draft: userReports.filter(r => r.status === 'draft').length,
      archived: userReports.filter(r => r.status === 'archived').length
    };
  }

  async validateReportData(report: InsertReport): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!report.authorId || report.authorId <= 0) {
      errors.push('Author ID is required and must be positive');
    }
    
    if (!report.status || report.status.trim().length === 0) {
      errors.push('Status is required');
    }
    
    if (!report.fileUrl || report.fileUrl.trim().length === 0) {
      errors.push('File URL is required');
    } else {
      // Простая валидация URL
      try {
        new URL(report.fileUrl);
      } catch {
        errors.push('Invalid file URL format');
      }
    }
    
    // Валидация статуса
    const validStatuses = ['draft', 'pending_review', 'approved', 'rejected', 'archived'];
    if (report.status && !validStatuses.includes(report.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async canUserEditReport(userId: number, reportId: number): Promise<boolean> {
    const report = await this.getReport(reportId);
    if (!report) return false;
    
    // Пользователь может редактировать только свои отчеты в статусе draft
    return report.authorId === userId && report.status === 'draft';
  }

  async canUserDeleteReport(userId: number, reportId: number): Promise<boolean> {
    const report = await this.getReport(reportId);
    if (!report) return false;
    
    // Пользователь может удалять только свои отчеты в статусе draft
    return report.authorId === userId && report.status === 'draft';
  }

  async canUserApproveReport(userId: number, reportId: number): Promise<boolean> {
    const report = await this.getReport(reportId);
    if (!report) return false;
    
    // Только супервайзеры могут одобрять отчеты
    // Здесь должна быть проверка роли пользователя
    // Пока что возвращаем false для безопасности
    return false;
  }
}

// Экспортируем единственный экземпляр
export const reportService = new ReportService(); 