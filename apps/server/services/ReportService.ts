import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/db-types/src/index';
import { AppError } from '../utils/AppError';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА =====
type ReportTemplates = Database['mdt']['Tables']['report_templates']['Row'];
type ReportTemplatesInsert = Database['mdt']['Tables']['report_templates']['Insert'];
type ReportTemplatesUpdate = Database['mdt']['Tables']['report_templates']['Update'];

type EmsFdReports = Database['mdt']['Tables']['ems_fd_reports']['Row'];
type EmsFdReportsInsert = Database['mdt']['Tables']['ems_fd_reports']['Insert'];
type EmsFdReportsUpdate = Database['mdt']['Tables']['ems_fd_reports']['Update'];

type LawReports = Database['mdt']['Tables']['law_reports']['Row'];
type LawReportsInsert = Database['mdt']['Tables']['law_reports']['Insert'];
type LawReportsUpdate = Database['mdt']['Tables']['law_reports']['Update'];

// ===== ФИЛЬТРЫ =====
export interface ReportTemplateFilters {
  category?: string;
  subcategory?: string;
  difficulty?: string;
  department_id?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface EmsFdReportFilters {
  author_character_id?: string;
  incident_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface LawReportFilters {
  author_character_id?: string;
  incident_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ===== СТАТИСТИКА =====
export interface ReportTemplateStats {
  total: number;
  active: number;
  inactive: number;
  by_category: Record<string, number>;
}

export interface TagStats {
  tag: string;
  count: number;
}

export interface ReportStats {
  total_ems_fd: number;
  total_law: number;
  by_type: Record<string, number>;
  by_author: Record<string, number>;
}

class ReportService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ===== МЕТОДЫ ДЛЯ REPORT TEMPLATES =====

  public async getReportTemplates(filters: ReportTemplateFilters = {}): Promise<ReportTemplates[]> {
    let query = this.supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true);

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    query = query
      .limit(filters.limit || 50)
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('[ReportService] Error fetching report templates:', error);
      throw new AppError('Ошибка при получении шаблонов отчетов.', 500);
    }

    return data || [];
  }

  public async getReportTemplateById(id: string): Promise<ReportTemplates | null> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[ReportService] Error fetching template ${id}:`, error);
      throw new AppError('Ошибка при получении шаблона отчета.', 500);
    }

    return data;
  }

  public async createReportTemplate(
    templateData: Omit<ReportTemplatesInsert, 'id' | 'created_at' | 'updated_at' | 'is_active'>,
    createdByCharacterId: string
  ): Promise<ReportTemplates> {
    const insertData: ReportTemplatesInsert = {
      ...templateData,
      created_by_character_id: createdByCharacterId,
      is_active: true
    };

    const { data, error } = await this.supabase
      .from('report_templates')
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      console.error('[ReportService] Error creating report template:', error);
      throw new AppError('Не удалось создать шаблон отчета.', 500);
    }

    return data;
  }

  public async updateReportTemplate(id: string, updates: ReportTemplatesUpdate): Promise<ReportTemplates> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[ReportService] Error updating template ${id}:`, error);
      throw new AppError('Не удалось обновить шаблон отчета.', 500);
    }

    return data;
  }

  public async deleteReportTemplate(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('report_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[ReportService] Error deleting template ${id}:`, error);
      throw new AppError('Не удалось удалить шаблон отчета.', 500);
    }

    return true;
  }

  public async getReportTemplateStats(): Promise<ReportTemplateStats> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('is_active, category');

    if (error) {
      console.error('[ReportService] Error fetching template stats:', error);
      throw new AppError('Ошибка при получении статистики шаблонов.', 500);
    }

    const total = data?.length || 0;
    const active = data?.filter(t => t.is_active).length || 0;
    const inactive = total - active;

    const by_category: Record<string, number> = {};

    data?.forEach(template => {
      const category = template.category || 'uncategorized';
      by_category[category] = (by_category[category] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      by_category
    };
  }

  public async getReportTemplateTagStats(): Promise<TagStats[]> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('tags')
      .eq('is_active', true);

    if (error) {
      console.error('[ReportService] Error fetching tag stats:', error);
      throw new AppError('Ошибка при получении статистики тегов.', 500);
    }

    const tagCounts: Record<string, number> = {};
    
    data?.forEach(template => {
      if (template.tags && Array.isArray(template.tags)) {
        template.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  }

  // ===== МЕТОДЫ ДЛЯ EMS/FD REPORTS =====

  public async getEmsFdReports(filters: EmsFdReportFilters = {}): Promise<EmsFdReports[]> {
    let query = this.supabase
      .from('ems_fd_reports')
      .select('*');

    if (filters.author_character_id) {
      query = query.eq('author_character_id', filters.author_character_id);
    }
    if (filters.incident_type) {
      query = query.eq('incident_type', filters.incident_type);
    }
    if (filters.date_from) {
      query = query.gte('incident_time', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('incident_time', filters.date_to);
    }

    query = query
      .order('incident_time', { ascending: false })
      .limit(filters.limit || 50)
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('[ReportService] Error fetching EMS/FD reports:', error);
      throw new AppError('Ошибка при получении отчетов EMS/FD.', 500);
    }

    return data || [];
  }

  public async getEmsFdReportById(id: string): Promise<EmsFdReports | null> {
    const { data, error } = await this.supabase
      .from('ems_fd_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[ReportService] Error fetching EMS/FD report ${id}:`, error);
      throw new AppError('Ошибка при получении отчета EMS/FD.', 500);
    }

    return data;
  }

  public async createEmsFdReport(data: EmsFdReportsInsert): Promise<EmsFdReports> {
    const { data: newReport, error } = await this.supabase
      .from('ems_fd_reports')
      .insert(data)
      .select()
      .single();

    if (error || !newReport) {
      console.error('[ReportService] Error creating EMS/FD report:', error);
      throw new AppError('Не удалось создать отчет EMS/FD.', 500);
    }

    return newReport;
  }

  public async updateEmsFdReport(id: string, updates: EmsFdReportsUpdate): Promise<EmsFdReports> {
    const { data, error } = await this.supabase
      .from('ems_fd_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[ReportService] Error updating EMS/FD report ${id}:`, error);
      throw new AppError('Не удалось обновить отчет EMS/FD.', 500);
    }

    return data;
  }

  public async deleteEmsFdReport(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('ems_fd_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[ReportService] Error deleting EMS/FD report ${id}:`, error);
      throw new AppError('Не удалось удалить отчет EMS/FD.', 500);
    }

    return true;
  }

  // ===== МЕТОДЫ ДЛЯ LAW REPORTS =====

  public async getLawReports(filters: LawReportFilters = {}): Promise<LawReports[]> {
    let query = this.supabase
      .from('law_reports')
      .select('*');

    if (filters.author_character_id) {
      query = query.eq('author_character_id', filters.author_character_id);
    }
    if (filters.incident_type) {
      query = query.eq('incident_type', filters.incident_type);
    }
    if (filters.date_from) {
      query = query.gte('incident_time', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('incident_time', filters.date_to);
    }

    query = query
      .order('incident_time', { ascending: false })
      .limit(filters.limit || 50)
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('[ReportService] Error fetching law reports:', error);
      throw new AppError('Ошибка при получении отчетов правоохранительных органов.', 500);
    }

    return data || [];
  }

  public async getLawReportById(id: string): Promise<LawReports | null> {
    const { data, error } = await this.supabase
      .from('law_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`[ReportService] Error fetching law report ${id}:`, error);
      throw new AppError('Ошибка при получении отчета правоохранительных органов.', 500);
    }

    return data;
  }

  public async createLawReport(data: LawReportsInsert): Promise<LawReports> {
    const { data: newReport, error } = await this.supabase
      .from('law_reports')
      .insert(data)
      .select()
      .single();

    if (error || !newReport) {
      console.error('[ReportService] Error creating law report:', error);
      throw new AppError('Не удалось создать отчет правоохранительных органов.', 500);
    }

    return newReport;
  }

  public async updateLawReport(id: string, updates: LawReportsUpdate): Promise<LawReports> {
    const { data, error } = await this.supabase
      .from('law_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`[ReportService] Error updating law report ${id}:`, error);
      throw new AppError('Не удалось обновить отчет правоохранительных органов.', 500);
    }

    return data;
  }

  public async deleteLawReport(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('law_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[ReportService] Error deleting law report ${id}:`, error);
      throw new AppError('Не удалось удалить отчет правоохранительных органов.', 500);
    }

    return true;
  }

  // ===== ОБЩАЯ СТАТИСТИКА =====

  public async getReportStats(): Promise<ReportStats> {
    const [emsFdData, lawData] = await Promise.all([
      this.supabase.from('ems_fd_reports').select('incident_type, author_character_id'),
      this.supabase.from('law_reports').select('incident_type, author_character_id')
    ]);

    if (emsFdData.error || lawData.error) {
      console.error('[ReportService] Error fetching report stats:', { emsFdError: emsFdData.error, lawError: lawData.error });
      throw new AppError('Ошибка при получении статистики отчетов.', 500);
    }

    const total_ems_fd = emsFdData.data?.length || 0;
    const total_law = lawData.data?.length || 0;

    const by_type: Record<string, number> = {};
    const by_author: Record<string, number> = {};

    // Обрабатываем EMS/FD отчеты
    emsFdData.data?.forEach(report => {
      const type = report.incident_type || 'unknown';
      const author = report.author_character_id || 'unknown';
      
      by_type[type] = (by_type[type] || 0) + 1;
      by_author[author] = (by_author[author] || 0) + 1;
    });

    // Обрабатываем Law отчеты
    lawData.data?.forEach(report => {
      const type = report.incident_type || 'unknown';
      const author = report.author_character_id || 'unknown';
      
      by_type[type] = (by_type[type] || 0) + 1;
      by_author[author] = (by_author[author] || 0) + 1;
    });

    return {
      total_ems_fd,
      total_law,
      by_type,
      by_author
    };
  }
}

export default new ReportService(); 