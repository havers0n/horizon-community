import { mdtClient } from '../lib/supabase.js';
import type { Database } from '../../../packages/db-types/src/index';

type ReportTemplate = Database['mdt']['Tables']['report_templates']['Row'];
type ReportTemplateInsert = Database['mdt']['Tables']['report_templates']['Insert'];
type ReportTemplateUpdate = Database['mdt']['Tables']['report_templates']['Update'];

export interface ReportTemplateFilters {
  category?: string;
  subcategory?: string;
  difficulty?: string;
  departmentId?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ReportTemplateStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export interface TagStats {
  tag: string;
  count: number;
}

class ReportTemplateService {
  private TABLE_NAME = 'report_templates';

  async getReportTemplates(filters: ReportTemplateFilters): Promise<ReportTemplate[]> {
    let query = (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('*')
      .eq('is_active', true);

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    if (filters.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.departmentId) {
      query = query.eq('department_id', filters.departmentId);
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
      console.error('Error fetching report templates:', error);
      throw error;
    }

    return (data || []) as ReportTemplate[];
  }

  async getReportTemplateById(id: string): Promise<ReportTemplate | null> {
    const { data, error } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report template:', error);
      return null;
    }

    return data as ReportTemplate;
  }

  async createReportTemplate(
    templateData: Omit<ReportTemplateInsert, 'id' | 'created_at' | 'updated_at' | 'is_active'>,
    createdByCharacterId: string
  ): Promise<ReportTemplate> {
    const insertData: ReportTemplateInsert = {
      ...templateData,
      created_by_character_id: createdByCharacterId,
      is_active: true
    };

    const { data, error } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating report template:', error);
      throw error;
    }

    return data as ReportTemplate;
  }

  async updateReportTemplate(id: string, updates: ReportTemplateUpdate): Promise<ReportTemplate | null> {
    const updateData: ReportTemplateUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report template:', error);
      return null;
    }

    return data as ReportTemplate;
  }

  async deleteReportTemplate(id: string): Promise<boolean> {
    const { error } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report template:', error);
      return false;
    }

    return true;
  }

  async getReportTemplateStats(): Promise<ReportTemplateStats> {
    // Получаем общую статистику
    const { data: totalStats, error: totalError } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('is_active');

    if (totalError) {
      console.error('Error fetching total stats:', totalError);
      throw totalError;
    }

    const total = totalStats?.length || 0;
    const active = totalStats?.filter((t: any) => t.is_active).length || 0;
    const inactive = total - active;

    // Получаем статистику по категориям
    const { data: categoryStats, error: categoryError } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('category');

    if (categoryError) {
      console.error('Error fetching category stats:', categoryError);
      throw categoryError;
    }

    const byCategory: Record<string, number> = {};
    categoryStats?.forEach((template: any) => {
      const category = template.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Получаем статистику по сложности
    const { data: difficultyStats, error: difficultyError } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('difficulty');

    if (difficultyError) {
      console.error('Error fetching difficulty stats:', difficultyError);
      throw difficultyError;
    }

    const byDifficulty: Record<string, number> = {};
    difficultyStats?.forEach((template: any) => {
      const difficulty = template.difficulty || 'medium';
      byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      byCategory,
      byDifficulty
    };
  }

  async getReportTemplateTagStats(): Promise<TagStats[]> {
    const { data, error } = await (mdtClient as any)
      .from(this.TABLE_NAME)
      .select('tags')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tag stats:', error);
      throw error;
    }

    const tagCounts: Record<string, number> = {};
    
    data?.forEach((template: any) => {
      if (template.tags && Array.isArray(template.tags)) {
        template.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return popularTags;
  }
}

export const reportTemplateService = new ReportTemplateService();
