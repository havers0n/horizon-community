// apps/server/src/core/services/ReportService.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { mdtSupabase } from '../lib/supabase';
// ✅✅✅ ИСПРАВЛЕННЫЙ ПУТЬ
import { AppError } from '../../utils/AppError';

// Импортируем только Database и создаем локальные типы-алиасы
import type { Database } from '@roleplay-identity/db-types';

// Создаем локальные типы-алиасы из глобального типа Database
type ReportTemplates = Database['mdt']['Tables']['report_templates']['Row'];
type ReportTemplatesInsert = Database['mdt']['Tables']['report_templates']['Insert'];
type ReportTemplatesUpdate = Database['mdt']['Tables']['report_templates']['Update'];
// В актуальной схеме таблица ems_fd_reports отсутствует — временно отключаем типы и доступ
type EmsFdReports = never;
type EmsFdReportsInsert = never;
type EmsFdReportsUpdate = never;
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

export class ReportService {
  private readonly db: SupabaseClient<Database, 'mdt'>;

  constructor(mdtDb?: SupabaseClient<Database, 'mdt'>) {
    this.db = (mdtDb ?? (mdtSupabase as unknown as SupabaseClient<Database, 'mdt'>));
  }

  // ===== МЕТОДЫ ДЛЯ REPORT TEMPLATES =====

  public async getReportTemplates(filters: ReportTemplateFilters = {}): Promise<ReportTemplates[]> {
    let query = this.db
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

    const { data, error } = await query
      .limit(filters.limit || 50)
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    if (error) {
      console.error('[ReportService] Error fetching report templates:', error);
      throw new AppError('Ошибка при получении шаблонов отчетов.', 500);
    }

    return data || [];
  }

  public async getReportTemplateById(id: string): Promise<ReportTemplates | null> {
    const { data, error } = await this.db
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[ReportService] Error fetching report template:', error);
      throw new AppError('Ошибка при получении шаблона отчета.', 500);
    }

    return data;
  }

  public async createReportTemplate(templateData: ReportTemplatesInsert): Promise<ReportTemplates> {
    const { data, error } = await this.db
      .from('report_templates')
      .insert(templateData)
      .select()
      .single();

    if (error || !data) {
      console.error('[ReportService] Error creating report template:', error);
      throw new AppError('Ошибка при создании шаблона отчета.', 500);
    }

    return data;
  }

  public async updateReportTemplate(id: string, updates: ReportTemplatesUpdate): Promise<ReportTemplates> {
    const { data, error } = await this.db
      .from('report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[ReportService] Error updating report template:', error);
      throw new AppError('Ошибка при обновлении шаблона отчета.', 500);
    }

    return data;
  }

  public async deleteReportTemplate(id: string): Promise<boolean> {
    const { error } = await this.db
      .from('report_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ReportService] Error deleting report template:', error);
      throw new AppError('Ошибка при удалении шаблона отчета.', 500);
    }

    return true;
  }

  public async getReportTemplateStats(): Promise<ReportTemplateStats> {
    const { data, error } = await this.db.from('report_templates').select('is_active, category');

    if (error) {
      console.error('[ReportService] Error fetching report template stats:', error);
      throw new AppError('Ошибка при получении статистики шаблонов отчетов.', 500);
    }

    const stats: ReportTemplateStats = {
      total: data?.length || 0,
      active: data?.filter(t => t.is_active).length || 0,
      inactive: data?.filter(t => !t.is_active).length || 0,
      by_category: {}
    };

    data?.forEach(template => {
      const category = template.category || 'unknown';
      stats.by_category[category] = (stats.by_category[category] || 0) + 1;
    });

    return stats;
  }

  public async getReportTemplateTagStats(): Promise<TagStats[]> {
    const { data, error } = await this.db
      .from('report_templates')
      .select('tags')
      .eq('is_active', true);

    if (error) {
      console.error('[ReportService] Error fetching tag stats:', error);
      throw new AppError('Ошибка при получении статистики тегов.', 500);
    }

    const tagCounts: Record<string, number> = {};
    // Текущая схема может не содержать колонку tags — безопасно игнорируем
    data?.forEach((template: any) => {
      const tags: string[] = Array.isArray(template?.tags) ? template.tags : [];
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
  }

  // ===== МЕТОДЫ ДЛЯ EMS/FD REPORTS =====

  public async getEmsFdReports(_filters: EmsFdReportFilters = {}): Promise<EmsFdReports[]> {
    return [] as unknown as EmsFdReports[];
  }

  public async getEmsFdReportById(_id: string): Promise<EmsFdReports | null> {
    return null as unknown as EmsFdReports | null;
  }

  public async createEmsFdReport(_reportData: EmsFdReportsInsert): Promise<EmsFdReports> {
    throw new AppError('EMS/FD reporting временно недоступен: таблица отсутствует в схеме', 501);
  }

  public async updateEmsFdReport(_id: string, _updates: EmsFdReportsUpdate): Promise<EmsFdReports> {
    throw new AppError('EMS/FD reporting временно недоступен: таблица отсутствует в схеме', 501);
  }

  public async deleteEmsFdReport(_id: string): Promise<boolean> {
    throw new AppError('EMS/FD reporting временно недоступен: таблица отсутствует в схеме', 501);
  }

  // ===== МЕТОДЫ ДЛЯ LAW REPORTS =====

  public async getLawReports(filters: LawReportFilters = {}): Promise<LawReports[]> {
    let query = this.db.from('law_reports').select('*');

    if (filters.author_character_id) {
      // нет таблицы — пропускаем
    }
    if (filters.incident_type) {
      // нет таблицы — пропускаем
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50)
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    if (error) {
      console.error('[ReportService] Error fetching law reports:', error);
      throw new AppError('Ошибка при получении отчетов правоохранительных органов.', 500);
    }

    return data || [];
  }

  public async getLawReportById(id: string): Promise<LawReports | null> {
    const { data, error } = await this.db
      .from('law_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[ReportService] Error fetching law report:', error);
      throw new AppError('Ошибка при получении отчета правоохранительных органов.', 500);
    }

    return data;
  }

  public async createLawReport(reportData: LawReportsInsert): Promise<LawReports> {
    const { data, error } = await this.db
      .from('law_reports')
      .insert(reportData)
      .select()
      .single();

    if (error || !data) {
      console.error('[ReportService] Error creating law report:', error);
      throw new AppError('Ошибка при создании отчета правоохранительных органов.', 500);
    }

    return data;
  }

  public async updateLawReport(id: string, updates: LawReportsUpdate): Promise<LawReports> {
    const { data, error } = await this.db
      .from('law_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[ReportService] Error updating law report:', error);
      throw new AppError('Ошибка при обновлении отчета правоохранительных органов.', 500);
    }

    return data;
  }

  public async deleteLawReport(id: string): Promise<boolean> {
    const { error } = await this.db
      .from('law_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ReportService] Error deleting law report:', error);
      throw new AppError('Ошибка при удалении отчета правоохранительных органов.', 500);
    }

    return true;
  }

  // ===== ОБЩАЯ СТАТИСТИКА =====

  public async getReportStats(): Promise<ReportStats> {
    const [emsFdResults, lawResults] = await Promise.all([
      Promise.resolve({ data: [] as any[] }),
      this.db.from('law_reports').select('incident_type, author_character_id')
    ]);

    const stats: ReportStats = {
      total_ems_fd: emsFdResults.data?.length || 0,
      total_law: lawResults.data?.length || 0,
      by_type: {},
      by_author: {}
    };

    // Подсчет по типам инцидентов
    [...(emsFdResults.data || []), ...(lawResults.data || [])].forEach(report => {
      const type = report.incident_type || 'unknown';
      stats.by_type[type] = (stats.by_type[type] || 0) + 1;
    });

    // Подсчет по авторам
    [...(emsFdResults.data || []), ...(lawResults.data || [])].forEach(report => {
      const author = report.author_character_id || 'unknown';
      stats.by_author[author] = (stats.by_author[author] || 0) + 1;
    });

    return stats;
  }
}