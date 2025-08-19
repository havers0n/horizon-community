// src/core/services/ApplicationService.ts

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';
import { AppError } from '../../utils/AppError';

// ===== ТИПЫ ИЗ ЕДИНОГО ИСТОЧНИКА (system схема) =====
type SystemApplication = Database['system']['Tables']['applications']['Row'];
type SystemApplicationInsert = Database['system']['Tables']['applications']['Insert'];
type SystemApplicationUpdate = Database['system']['Tables']['applications']['Update'];
type AdminApplicationViewRow = Database['system']['Views']['v_admin_applications']['Row'];

// Статус в system схеме хранится как строковый идентификатор
type ApplicationStatus = string;

// ===== ИНТЕРФЕЙСЫ ДЛЯ ВАЛИДАЦИИ =====
export interface CreateApplicationData {
  type: string;
  author_user_id: string; // ✅ UUID как string
  author_character_id: string; // ✅ UUID как string
  data?: any;
  status?: ApplicationStatus; // Идентификатор статуса
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {}

// ===== СОВРЕМЕННЫЙ APPLICATION SERVICE =====
export class ApplicationService {
  // ✅ Клиенты по схемам
  private readonly systemDb: SupabaseClient<Database, 'system'>;
  private readonly commonDb?: SupabaseClient<Database, 'common'>;
  private readonly publicDb?: SupabaseClient<Database>;

  constructor(
    systemDbOrClients: SupabaseClient<Database, 'system'> | {
      system: SupabaseClient<Database, 'system'>,
      common?: SupabaseClient<Database, 'common'>,
      public?: SupabaseClient<Database>
    }
  ) {
    if (typeof (systemDbOrClients as any).from === 'function') {
      this.systemDb = systemDbOrClients as SupabaseClient<Database, 'system'>;
    } else {
      const clients = systemDbOrClients as { system: SupabaseClient<Database, 'system'>, common?: SupabaseClient<Database, 'common'>, public?: SupabaseClient<Database> };
      this.systemDb = clients.system;
      this.commonDb = clients.common;
      this.publicDb = clients.public;
    }
  }

  /**
   * Создать новую заявку
   */
  async createApplication(data: CreateApplicationData): Promise<SystemApplication> {
    try {
      // Разрешаем author_character_id быть null для entry-заявок
      const authorCharacterId = (data.type === 'entry') ? null : (data.author_character_id || null);

      // Извлекаем и валидируем целевой департамент
      const isUuid = (v: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
      let targetDepartmentId: string | null = null;

      const payloadDeptCandidate = (data as any)?.target_department_id
        ?? (data as any)?.department_id
        ?? (data as any)?.data?.departmentId
        ?? (data as any)?.data?.department_id;

      if (data.type === 'entry' || data.type === 'joint') {
        if (!payloadDeptCandidate || typeof payloadDeptCandidate !== 'string' || !isUuid(payloadDeptCandidate)) {
          throw new AppError('A department ID is required for this application type and must be a valid UUID.', 400);
        }
        targetDepartmentId = payloadDeptCandidate;
      } else {
        if (payloadDeptCandidate && typeof payloadDeptCandidate === 'string') {
          if (!isUuid(payloadDeptCandidate)) {
            throw new AppError('Invalid department ID format. UUID expected.', 400);
          }
          targetDepartmentId = payloadDeptCandidate;
        } else {
          targetDepartmentId = null;
        }
      }

      // Находим UUID статуса 'submitted' для вида 'application_status'
      const submittedStatusId = await this.fetchStatusId('application_status', 'submitted');

      const insertPayload: any = {
        type: data.type,
        author_user_id: data.author_user_id,
        author_character_id: authorCharacterId,
        data: (data.data ?? null) as any,
        status_id: submittedStatusId,
        target_department_id: targetDepartmentId,
      };

      const { data: application, error } = await this.systemDb
        .from('applications')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error('[ApplicationService] Error creating application:', error);
        throw new AppError('Не удалось создать заявку', 500);
      }

      return application as SystemApplication;
    } catch (error) {
      console.error('[ApplicationService] Error in createApplication:', error);
      throw error;
    }
  }

  /**
   * Получить заявку по ID
   */
  async getApplicationById(id: string): Promise<SystemApplication | null> {
    try {
      if (!this.publicDb) {
        console.error('[ApplicationService] getApplicationById: public client is not available');
        throw new AppError('Server configuration error: public schema not available', 500);
      }

      const { data, error } = await (this.publicDb as any)
        .rpc('get_admin_application_by_id', { p_application_id: id })
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') return null;
        console.error(`[ApplicationService] Error fetching application with id ${id}:`, error);
        throw new AppError('Ошибка при поиске заявки', 500);
      }

      return data as any as SystemApplication;
    } catch (error) {
      console.error('[ApplicationService] Error in getApplicationById:', error);
      throw error;
    }
  }

  /**
   * Обновить заявку
   */
  async updateApplication(id: string, data: UpdateApplicationData): Promise<SystemApplication> {
    try {
      const updateData: any = {};
      
      if (data.type !== undefined) updateData.type = data.type;
      if (data.author_user_id !== undefined) updateData.author_user_id = data.author_user_id;
      if (data.author_character_id !== undefined) updateData.author_character_id = data.author_character_id;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.status !== undefined) updateData.status_id = data.status;

      const { data: application, error } = await this.systemDb
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[ApplicationService] Error updating application with id ${id}:`, error);
        throw new AppError('Не удалось обновить заявку', 500);
      }

      return application as SystemApplication;
    } catch (error) {
      console.error('[ApplicationService] Error in updateApplication:', error);
      throw error;
    }
  }

  /**
   * Удалить заявку
   */
  async deleteApplication(id: string): Promise<boolean> {
    try {
      const { error } = await this.systemDb
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[ApplicationService] Error deleting application with id ${id}:`, error);
        throw new AppError('Не удалось удалить заявку', 500);
      }

      return true;
    } catch (error) {
      console.error('[ApplicationService] Error in deleteApplication:', error);
      throw error;
    }
  }

  /**
   * Получить все заявки пользователя
   */
  async getUserApplications(user_id: string): Promise<SystemApplication[]> {
    try {
      const { data, error } = await this.systemDb
        .from('applications')
        .select('*')
        .eq('author_user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[ApplicationService] Error fetching applications for user ${user_id}:`, error);
        throw new AppError('Ошибка при получении заявок пользователя', 500);
      }

      return data || [];
    } catch (error) {
      console.error('[ApplicationService] Error in getUserApplications:', error);
      throw error;
    }
  }

  /**
   * Получить заявки по статусу
   */
  async getApplicationsByStatus(status: ApplicationStatus): Promise<SystemApplication[]> {
    try {
      const { data, error } = await this.systemDb
        .from('applications')
        .select('*')
        .eq('status_id', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[ApplicationService] Error fetching applications with status ${status}:`, error);
        throw new AppError('Ошибка при получении заявок по статусу', 500);
      }

      return data || [];
    } catch (error) {
      console.error('[ApplicationService] Error in getApplicationsByStatus:', error);
      throw error;
    }
  }

  /**
   * ADMIN: Получить все заявки с пагинацией и фильтрами
   */
  async getAllApplications(filters: { status?: string; department?: string; page: number; limit: number }): Promise<{ items: AdminApplicationViewRow[]; page: number; limit: number; total: number; }> {
    const { status, department, page, limit } = filters;

    const statusId = status || null;
    const departmentId = department || null;

    if (!this.publicDb) {
      console.error('[ApplicationService] getAllApplications: public client is not available');
      throw new AppError('Server configuration error: public schema not available', 500);
    }

    const { data, error } = await (this.publicDb as any).rpc('get_admin_applications', {
      p_page: page,
      p_limit: limit,
      p_status_id: statusId,
      p_department_id: departmentId,
    });

    if (error) {
      console.error('[ApplicationService] getAllApplications error:', error);
      throw new AppError('Не удалось получить список заявок', 500);
    }

    const { count, error: countError } = await this.systemDb
      .from('applications')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[ApplicationService] getAllApplications count error:', countError);
      throw new AppError('Не удалось получить количество заявок', 500);
    }

    return { items: (data || []) as AdminApplicationViewRow[], page, limit, total: count || 0 };
  }

  /**
   * ADMIN: Получить заявку по ID (для админов)
   */
  async getApplicationByIdForAdmin(id: string): Promise<SystemApplication | null> {
    return await this.getApplicationById(id);
  }

  private async resolveCadetRankId(departmentId: string): Promise<string | null> {
    if (!this.commonDb) return null;
    const { data, error } = await (this.commonDb as any)
      .from('ranks')
      .select('id, name')
      .eq('department_id', departmentId)
      .ilike('name', 'cadet')
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('[ApplicationService] resolveCadetRankId error:', error);
      return null;
    }
    return data?.id || null;
  }

  private async resolveActiveStatusId(): Promise<string | null> {
    // Общая таблица statuses с code='active'
    const { data, error } = await (this.systemDb as any)
      .from('statuses')
      .select('id, code')
      .eq('code', 'active')
      .maybeSingle();
    if (error) {
      console.warn('[ApplicationService] resolveActiveStatusId error:', error);
      return null;
    }
    return data?.id || 'active';
  }

  private async pickEntryTestId(): Promise<string | null> {
    const { data, error } = await this.systemDb
      .from('tests')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('[ApplicationService] pickEntryTestId error:', error);
      return null;
    }
    return (data as any)?.id || null;
  }

  /**
   * Найти тест по назначению и контексту ("умный" подбор)
   * Если нужных колонок ещё нет (до миграции) — безопасный фолбэк на первый тест
   */
  private async pickContextAwareTestId(params: {
    purpose: 'entry' | 'promotion' | 'qualification';
    departmentId?: string | null;
    rankId?: string | null;
    qualificationId?: string | null;
  }): Promise<string | null> {
    try {
      const qb = this.systemDb
        .from('tests')
        .select('id')
        .eq('purpose', params.purpose as any);

      if (params.departmentId) {
        (qb as any).eq('target_department_id', params.departmentId);
      }
      if (params.rankId && params.purpose === 'promotion') {
        (qb as any).eq('target_rank_id', params.rankId);
      }
      if (params.qualificationId && params.purpose === 'qualification') {
        (qb as any).eq('target_qualification_id', params.qualificationId);
      }

      const { data, error } = await (qb as any)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // Если колонок ещё нет (до миграции), Postgres вернёт ошибку 42703 (undefined_column)
        const pgCode = (error as any)?.code;
        if (pgCode === '42703') {
          console.warn('[ApplicationService] pickContextAwareTestId: columns missing (pre-migration). Fallback to first test. Error:', error);
          return await this.pickEntryTestId();
        }
        console.warn('[ApplicationService] pickContextAwareTestId error:', error);
        return null;
      }

      return (data as any)?.id || null;
    } catch (err) {
      console.warn('[ApplicationService] pickContextAwareTestId unexpected error:', err);
      return null;
    }
  }

  private async fetchStatusId(kindCode: string, statusCode: string): Promise<string> {
    if (!this.commonDb) {
      console.error('[ApplicationService] fetchStatusId: common client is not available');
      throw new AppError('Server configuration error: common schema not available', 500);
    }

    // 1) Получаем kind_id из common.status_kinds по code
    const { data: kind, error: kindErr } = await (this.commonDb as any)
      .from('status_kinds')
      .select('id, code')
      .eq('code', kindCode)
      .maybeSingle();

    if (kindErr || !kind?.id) {
      console.error('[ApplicationService] fetchStatusId: status_kinds not found', kindErr);
      throw new AppError('Server configuration error: status kind not found', 500);
    }

    // 2) Получаем status_id из common.statuses по code и kind_id
    const { data: status, error: statusErr } = await (this.commonDb as any)
      .from('statuses')
      .select('id, code, kind_id')
      .eq('code', statusCode)
      .eq('kind_id', kind.id)
      .maybeSingle();

    if (statusErr || !status?.id) {
      console.error('[ApplicationService] fetchStatusId: status not found', statusErr);
      throw new AppError('Server configuration error: initial application status not found', 500);
    }

    return status.id as string;
  }

  /**
   * Повысить кандидата до кадета по ID заявки (полная бизнес-логика в TS)
   * Шаги:
   *  a) Получить заявку
   *  b) Разрешить ID ролей (candidate, cadet) и статусов (cadet_test для трека, completed для applications)
   *  c) Вставить назначение роли 'cadet' в common.role_assignments (если нет активного)
   *  d) Закрыть активные назначения роли 'candidate' (valid_to = now())
   *  e) Создать cadet_track со стадией cadet_test
   *  h) Обновить статус исходной заявки на 'completed'
   */
  public async promoteCandidateToCadet(applicationId: string): Promise<{ application_id: string; user_id: string; department_id: string | null; test_id: string | null; test_session_id: string | null; cadet_track_id: string | null; }>
  {
    if (!this.commonDb || !this.publicDb) {
      console.error('[ApplicationService] promoteCandidateToCadet: required clients missing (common/public)');
      throw new AppError('Server configuration error: required schemas not available', 500);
    }

    console.log('[ApplicationService] promoteCandidateToCadet: start', { applicationId });

    // a) Получить заявку
    const { data: application, error: appErr } = await this.systemDb
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (appErr || !application) {
      console.error('[ApplicationService] promoteCandidateToCadet: application fetch error', appErr);
      throw new AppError('Заявка не найдена', 404);
    }
    console.log('[ApplicationService] Step a) application loaded', { id: application.id, type: (application as any).type, author_user_id: (application as any).author_user_id, target_department_id: (application as any).target_department_id });

    const userId: string = (application as any).author_user_id;
    const departmentId: string | null = (application as any).target_department_id || null;

    // b) Разрешить ID ролей и статусов
    const { data: roleCadet, error: roleCadetErr } = await (this.commonDb as any)
      .from('roles')
      .select('id, name')
      .eq('name', 'cadet')
      .maybeSingle();
    if (roleCadetErr || !roleCadet?.id) {
      console.error('[ApplicationService] Step b) role cadet resolve error', roleCadetErr);
      throw new AppError('Не удалось найти роль cadet', 500);
    }

    const { data: roleCandidate, error: roleCandidateErr } = await (this.commonDb as any)
      .from('roles')
      .select('id, name')
      .eq('name', 'candidate')
      .maybeSingle();
    if (roleCandidateErr || !roleCandidate?.id) {
      console.error('[ApplicationService] Step b) role candidate resolve error', roleCandidateErr);
      throw new AppError('Не удалось найти роль candidate', 500);
    }

    const cadetTestStageId = await this.fetchStatusId('cadet_track_stage', 'cadet_test');
    console.log('[ApplicationService] Step b) status cadet_test resolved', { cadetTestStageId });
    const applicationApprovedId = await this.fetchStatusId('application_status', 'approved');
    console.log('[ApplicationService] Step b) status approved (application) resolved', { applicationApprovedId });

    // c) Вставить назначение роли 'cadet' при его отсутствии (активного)
    const { data: existingCadetAssign, error: existingCadetErr } = await (this.commonDb as any)
      .from('role_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleCadet.id)
      .is('valid_to', null)
      .maybeSingle();
    if (existingCadetErr && (existingCadetErr as any).code !== 'PGRST116') {
      console.warn('[ApplicationService] Step c) existing cadet role lookup error', existingCadetErr);
    }

    let insertedCadetAssignmentId: string | null = null;
    if (!existingCadetAssign) {
      const { data: insertCadet, error: insertCadetErr } = await (this.commonDb as any)
        .from('role_assignments')
        .insert({
          user_id: userId,
          role_id: roleCadet.id,
          // scope_type, subject_type, scope_id — оставляем дефолты схемы (как в БД)
          valid_from: new Date().toISOString(),
          valid_to: null,
        })
        .select('id')
        .single();
      if (insertCadetErr) {
        console.error('[ApplicationService] Step c) insert cadet role error', insertCadetErr);
        throw new AppError('Не удалось назначить роль cadet', 500);
      }
      insertedCadetAssignmentId = (insertCadet as any)?.id || null;
      console.log('[ApplicationService] Step c) cadet role assignment inserted', { insertedCadetAssignmentId });
    } else {
      console.log('[ApplicationService] Step c) cadet role assignment already active, skipping');
    }

    // d) Закрыть активные назначения роли 'candidate'
    const { error: closeCandidateErr } = await (this.commonDb as any)
      .from('role_assignments')
      .update({ valid_to: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('role_id', roleCandidate.id)
      .is('valid_to', null);
    if (closeCandidateErr) {
      console.error('[ApplicationService] Step d) close candidate assignments error', closeCandidateErr);
      throw new AppError('Не удалось закрыть роль candidate', 500);
    }
    console.log('[ApplicationService] Step d) candidate role assignments closed');

    // e) Создать cadet_track (если отсутствует)
    let cadetTrackId: string | null = null;
    if (departmentId) {
      const { data: existingTrack, error: existingTrackErr } = await (this.commonDb as any)
        .from('cadet_tracks')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();
      if (existingTrackErr && (existingTrackErr as any).code !== 'PGRST116') {
        console.warn('[ApplicationService] Step e) cadet_tracks lookup error', existingTrackErr);
      }
      if (!existingTrack) {
        const { data: newTrack, error: insertTrackErr } = await (this.commonDb as any)
          .from('cadet_tracks')
          .insert({
            user_id: userId,
            department_id: departmentId,
            application_id: applicationId,
            current_stage_id: cadetTestStageId,
          })
          .select('id')
          .single();
        if (insertTrackErr) {
          console.error('[ApplicationService] Step e) cadet_tracks insert error', insertTrackErr);
          throw new AppError('Не удалось создать кадетский трек', 500);
        }
        cadetTrackId = (newTrack as any)?.id || null;
        console.log('[ApplicationService] Step e) cadet_track created', { cadetTrackId });
      } else {
        cadetTrackId = (existingTrack as any)?.id || null;
        console.log('[ApplicationService] Step e) cadet_track already exists', { cadetTrackId });
      }
    } else {
      console.log('[ApplicationService] Step e) skip cadet_track creation: no departmentId');
    }

    // f/g: логика подбора теста и создания test_session удалена — создаётся только при явном старте теста пользователем
    const testId: string | null = null;
    const testSessionId: string | null = null;

    // h) Обновить статус заявки на 'approved'
    const { data: updatedApp, error: appUpdateErr } = await this.systemDb
      .from('applications')
      .update({ status_id: applicationApprovedId } as any)
      .eq('id', applicationId)
      .select('id, status_id')
      .single();
    if (appUpdateErr) {
      console.error('[ApplicationService] Step h) application status (approved) update error', appUpdateErr);
      throw new AppError('Не удалось одобрить заявку', 500);
    }
    console.log('[ApplicationService] Step h) application marked approved', { id: updatedApp?.id, status_id: (updatedApp as any)?.status_id });

    console.log('[ApplicationService] promoteCandidateToCadet: success', { applicationId });
    return {
      application_id: applicationId,
      user_id: userId,
      department_id: departmentId,
      test_id: testId,
      test_session_id: testSessionId,
      cadet_track_id: cadetTrackId,
    };
  }
  async updateApplicationStatus(id: string, newStatusCode: string, reviewerUserId: string, reviewComment?: string): Promise<SystemApplication> {
    // Resolve provided status code to its UUID in common.statuses
    if (!this.commonDb) {
      console.error('[ApplicationService] updateApplicationStatus: common client is not available');
      throw new AppError('Server configuration error: common schema not available', 500);
    }
    // 1) Получаем kind_id для application_status
    const { data: kind, error: kindError } = await (this.commonDb as any)
      .from('status_kinds')
      .select('id')
      .eq('code', 'application_status')
      .single();

    if (kindError || !kind?.id) {
      console.error('[ApplicationService] updateApplicationStatus: status kind application_status not found', kindError);
      throw new AppError('Не удалось определить вид статуса для заявок (application_status)', 500);
    }

    // 2) Разрешаем статус по КОДУ и ВИДУ (kind_id)
    const { data: status, error: statusError } = await (this.commonDb as any)
      .from('statuses')
      .select('id')
      .eq('code', newStatusCode)
      .eq('kind_id', kind.id)
      .single();

    if (statusError || !status?.id) {
      console.error('[ApplicationService] updateApplicationStatus: invalid or unknown status code for application_status', newStatusCode, statusError);
      throw new AppError(`Некорректный или неизвестный код статуса для заявок: ${newStatusCode}`, 400);
    }

    const newStatusId = status.id as string;

    const { data: updated, error } = await this.systemDb
      .from('applications')
      .update({
        status_id: newStatusId,
        reviewer_user_id: reviewerUserId,
        review_comment: reviewComment || null,
      } as any)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[ApplicationService] updateApplicationStatus error:', error);
      throw new AppError('Не удалось обновить статус заявки', 500);
    }
    // Чистая ответственность: только обновление статуса заявки
    return updated as SystemApplication;
  }
}