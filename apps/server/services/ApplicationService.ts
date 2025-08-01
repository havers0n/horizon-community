import { SupabaseStorage } from './SupabaseStorage';
import { 
  Application, 
  InsertApplication, 
  UpdateApplication,
  User,
  Department,
  Rank,
  Division,
  Unit
} from '@roleplay-identity/shared-types';

export class ApplicationService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ОСНОВНЫЕ ОПЕРАЦИИ
  // ===========================================

  async createApplication(data: InsertApplication): Promise<Application> {
    return this.storage.insert('applications', data);
  }

  async getApplicationById(id: string): Promise<Application | null> {
    return this.storage.getById('applications', id);
  }

  async getAllApplications(): Promise<Application[]> {
    return this.storage.list('applications');
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return this.storage.list('applications', { userId });
  }

  async getApplicationsByDepartment(departmentId: string): Promise<Application[]> {
    return this.storage.list('applications', { departmentId });
  }

  async getApplicationsByStatus(status: Application['status']): Promise<Application[]> {
    return this.storage.list('applications', { status });
  }

  async updateApplication(id: string, data: UpdateApplication): Promise<Application> {
    return this.storage.update('applications', id, data);
  }

  async deleteApplication(id: string): Promise<void> {
    await this.storage.delete('applications', id);
  }

  // ===========================================
  // БИЗНЕС-ЛОГИКА
  // ===========================================

  async submitApplication(data: InsertApplication): Promise<Application> {
    // Проверяем, нет ли уже активной заявки у пользователя
    const existingApplication = await this.storage.list('applications', {
      userId: data.userId,
      status: 'pending'
    });

    if (existingApplication.length > 0) {
      throw new Error('У пользователя уже есть активная заявка');
    }

    // Проверяем, что департамент и ранг существуют
    const [department, rank] = await Promise.all([
      this.storage.getById('departments', data.departmentId),
      this.storage.getById('ranks', data.rankId)
    ]);

    if (!department || !department.isActive) {
      throw new Error('Департамент не найден или неактивен');
    }

    if (!rank || !rank.isActive) {
      throw new Error('Ранг не найден или неактивен');
    }

    // Проверяем подразделение и юнит, если указаны
    if (data.divisionId) {
      const division = await this.storage.getById('divisions', data.divisionId);
      if (!division || !division.isActive) {
        throw new Error('Подразделение не найдено или неактивно');
      }
    }

    if (data.unitId) {
      const unit = await this.storage.getById('units', data.unitId);
      if (!unit || !unit.isActive) {
        throw new Error('Юнит не найден или неактивен');
      }
    }

    return this.createApplication(data);
  }

  async reviewApplication(
    id: string, 
    status: 'approved' | 'rejected' | 'under_review',
    reviewedBy: string,
    reason?: string
  ): Promise<Application> {
    const application = await this.getApplicationById(id);
    if (!application) {
      throw new Error('Заявка не найдена');
    }

    if (application.status !== 'pending') {
      throw new Error('Заявка уже рассмотрена');
    }

    const updateData: UpdateApplication = {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reason
    };

    const updatedApplication = await this.updateApplication(id, updateData);

    // Если заявка одобрена, создаем запись карьеры
    if (status === 'approved') {
      await this.createCareerFromApplication(application);
    }

    return updatedApplication;
  }

  async approveApplication(id: string, reviewedBy: string, reason?: string): Promise<Application> {
    return this.reviewApplication(id, 'approved', reviewedBy, reason);
  }

  async rejectApplication(id: string, reviewedBy: string, reason: string): Promise<Application> {
    return this.reviewApplication(id, 'rejected', reviewedBy, reason);
  }

  async putUnderReview(id: string, reviewedBy: string, reason?: string): Promise<Application> {
    return this.reviewApplication(id, 'under_review', reviewedBy, reason);
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchApplications(query: string): Promise<Application[]> {
    return this.storage.search('applications', query, ['reason']);
  }

  async getApplicationsWithDetails(): Promise<(Application & {
    user: User;
    department: Department;
    rank: Rank;
    division?: Division;
    unit?: Unit;
  })[]> {
    const applications = await this.getAllApplications();
    
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const [user, department, rank, division, unit] = await Promise.all([
          this.storage.getById('users', app.userId),
          this.storage.getById('departments', app.departmentId),
          this.storage.getById('ranks', app.rankId),
          app.divisionId ? this.storage.getById('divisions', app.divisionId) : null,
          app.unitId ? this.storage.getById('units', app.unitId) : null
        ]);

        return {
          ...app,
          user: user!,
          department: department!,
          rank: rank!,
          division: division || undefined,
          unit: unit || undefined
        };
      })
    );

    return applicationsWithDetails;
  }

  async getApplicationWithDetails(id: string): Promise<(Application & {
    user: User;
    department: Department;
    rank: Rank;
    division?: Division;
    unit?: Unit;
  }) | null> {
    const application = await this.getApplicationById(id);
    if (!application) return null;

    const [user, department, rank, division, unit] = await Promise.all([
      this.storage.getById('users', application.userId),
      this.storage.getById('departments', application.departmentId),
      this.storage.getById('ranks', application.rankId),
      application.divisionId ? this.storage.getById('divisions', application.divisionId) : null,
      application.unitId ? this.storage.getById('units', application.unitId) : null
    ]);

    return {
      ...application,
      user: user!,
      department: department!,
      rank: rank!,
      division: division || undefined,
      unit: unit || undefined
    };
  }

  // ===========================================
  // СТАТИСТИКА
  // ===========================================

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    underReview: number;
  }> {
    const [total, pending, approved, rejected, underReview] = await Promise.all([
      this.storage.count('applications'),
      this.storage.count('applications', { status: 'pending' }),
      this.storage.count('applications', { status: 'approved' }),
      this.storage.count('applications', { status: 'rejected' }),
      this.storage.count('applications', { status: 'under_review' })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      underReview
    };
  }

  async getDepartmentApplicationStats(departmentId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    underReview: number;
  }> {
    const [total, pending, approved, rejected, underReview] = await Promise.all([
      this.storage.count('applications', { departmentId }),
      this.storage.count('applications', { departmentId, status: 'pending' }),
      this.storage.count('applications', { departmentId, status: 'approved' }),
      this.storage.count('applications', { departmentId, status: 'rejected' }),
      this.storage.count('applications', { departmentId, status: 'under_review' })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      underReview
    };
  }

  async getApplicationActivity(days: number = 30): Promise<{
    submitted: number;
    approved: number;
    rejected: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [submitted, approved, rejected] = await Promise.all([
      this.storage.count('applications', {
        createdAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('applications', {
        status: 'approved',
        reviewedAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('applications', {
        status: 'rejected',
        reviewedAt: { gte: startDate.toISOString() }
      })
    ]);

    return {
      submitted,
      approved,
      rejected
    };
  }

  // ===========================================
  // ПРИВАТНЫЕ МЕТОДЫ
  // ===========================================

  private async createCareerFromApplication(application: Application): Promise<void> {
    // Получаем персонажа пользователя
    const characters = await this.storage.list('characters', { 
      userId: application.userId, 
      isActive: true 
    });

    if (characters.length === 0) {
      throw new Error('У пользователя нет активного персонажа');
    }

    const character = characters[0];

    // Создаем запись карьеры
    await this.storage.insert('character_career_history', {
      characterId: character.id,
      departmentId: application.departmentId,
      rankId: application.rankId,
      divisionId: application.divisionId,
      unitId: application.unitId,
      startDate: new Date().toISOString(),
      isActive: true
    });
  }
}

// Экспортируем единственный экземпляр
export const applicationService = new ApplicationService(new SupabaseStorage()); 