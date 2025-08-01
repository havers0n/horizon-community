import { SupabaseStorage } from './SupabaseStorage';
import { 
  Department, 
  InsertDepartment, 
  UpdateDepartment,
  Rank,
  InsertRank,
  UpdateRank,
  Division,
  InsertDivision,
  UpdateDivision,
  Unit,
  InsertUnit,
  UpdateUnit
} from '@roleplay-identity/shared-types';

export class DepartmentService {
  private storage: SupabaseStorage;

  constructor(storage: SupabaseStorage) {
    this.storage = storage;
  }

  // ===========================================
  // ДЕПАРТАМЕНТЫ
  // ===========================================

  async createDepartment(data: InsertDepartment): Promise<Department> {
    return this.storage.insert('departments', data);
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    return this.storage.getById('departments', id);
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.storage.list('departments', { isActive: true });
  }

  async updateDepartment(id: string, data: UpdateDepartment): Promise<Department> {
    return this.storage.update('departments', id, data);
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.storage.update('departments', id, { isActive: false });
  }

  async searchDepartments(query: string): Promise<Department[]> {
    return this.storage.search('departments', query, ['name', 'description']);
  }

  async getDepartmentStats(id: string): Promise<{
    totalMembers: number;
    totalRanks: number;
    totalDivisions: number;
    totalUnits: number;
  }> {
    const [members, ranks, divisions, units] = await Promise.all([
      this.storage.count('character_career_history', { departmentId: id, isActive: true }),
      this.storage.count('ranks', { departmentId: id, isActive: true }),
      this.storage.count('divisions', { departmentId: id, isActive: true }),
      this.storage.count('units', { departmentId: id, isActive: true })
    ]);

    return {
      totalMembers: members,
      totalRanks: ranks,
      totalDivisions: divisions,
      totalUnits: units
    };
  }

  // ===========================================
  // РАНГИ
  // ===========================================

  async createRank(data: InsertRank): Promise<Rank> {
    return this.storage.insert('ranks', data);
  }

  async getRankById(id: string): Promise<Rank | null> {
    return this.storage.getById('ranks', id);
  }

  async getRanksByDepartment(departmentId: string): Promise<Rank[]> {
    return this.storage.list('ranks', { departmentId, isActive: true });
  }

  async updateRank(id: string, data: UpdateRank): Promise<Rank> {
    return this.storage.update('ranks', id, data);
  }

  async deleteRank(id: string): Promise<void> {
    await this.storage.update('ranks', id, { isActive: false });
  }

  async getRankHierarchy(departmentId: string): Promise<Rank[]> {
    const ranks = await this.getRanksByDepartment(departmentId);
    return ranks.sort((a, b) => a.level - b.level);
  }

  // ===========================================
  // ПОДРАЗДЕЛЕНИЯ
  // ===========================================

  async createDivision(data: InsertDivision): Promise<Division> {
    return this.storage.insert('divisions', data);
  }

  async getDivisionById(id: string): Promise<Division | null> {
    return this.storage.getById('divisions', id);
  }

  async getDivisionsByDepartment(departmentId: string): Promise<Division[]> {
    return this.storage.list('divisions', { departmentId, isActive: true });
  }

  async updateDivision(id: string, data: UpdateDivision): Promise<Division> {
    return this.storage.update('divisions', id, data);
  }

  async deleteDivision(id: string): Promise<void> {
    await this.storage.update('divisions', id, { isActive: false });
  }

  // ===========================================
  // ЮНИТЫ
  // ===========================================

  async createUnit(data: InsertUnit): Promise<Unit> {
    return this.storage.insert('units', data);
  }

  async getUnitById(id: string): Promise<Unit | null> {
    return this.storage.getById('units', id);
  }

  async getUnitsByDepartment(departmentId: string): Promise<Unit[]> {
    return this.storage.list('units', { departmentId, isActive: true });
  }

  async updateUnit(id: string, data: UpdateUnit): Promise<Unit> {
    return this.storage.update('units', id, data);
  }

  async deleteUnit(id: string): Promise<void> {
    await this.storage.update('units', id, { isActive: false });
  }

  // ===========================================
  // КОМПЛЕКСНЫЕ ОПЕРАЦИИ
  // ===========================================

  async getDepartmentWithStructure(id: string): Promise<{
    department: Department;
    ranks: Rank[];
    divisions: Division[];
    units: Unit[];
  } | null> {
    const department = await this.getDepartmentById(id);
    if (!department) return null;

    const [ranks, divisions, units] = await Promise.all([
      this.getRanksByDepartment(id),
      this.getDivisionsByDepartment(id),
      this.getUnitsByDepartment(id)
    ]);

    return {
      department,
      ranks,
      divisions,
      units
    };
  }

  async getDepartmentMembers(id: string): Promise<any[]> {
    return this.storage.list('character_career_history', { 
      departmentId: id, 
      isActive: true 
    });
  }

  async transferMember(
    characterId: string, 
    fromDepartmentId: string, 
    toDepartmentId: string,
    newRankId: string,
    reason?: string
  ): Promise<void> {
    // Завершаем текущую карьеру
    await this.storage.update('character_career_history', characterId, {
      endDate: new Date().toISOString(),
      reason: reason || 'Transfer'
    });

    // Создаем новую запись карьеры
    await this.storage.insert('character_career_history', {
      characterId,
      departmentId: toDepartmentId,
      rankId: newRankId,
      startDate: new Date().toISOString(),
      isActive: true
    });
  }

  async getDepartmentActivity(id: string, days: number = 30): Promise<{
    newMembers: number;
    transfers: number;
    promotions: number;
    reports: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newMembers, transfers, promotions, reports] = await Promise.all([
      this.storage.count('character_career_history', {
        departmentId: id,
        startDate: { gte: startDate.toISOString() }
      }),
      this.storage.count('character_career_history', {
        departmentId: id,
        endDate: { gte: startDate.toISOString() }
      }),
      this.storage.count('character_career_history', {
        departmentId: id,
        updatedAt: { gte: startDate.toISOString() }
      }),
      this.storage.count('reports', {
        authorId: { in: await this.getDepartmentMemberIds(id) },
        createdAt: { gte: startDate.toISOString() }
      })
    ]);

    return {
      newMembers,
      transfers,
      promotions,
      reports
    };
  }

  private async getDepartmentMemberIds(departmentId: string): Promise<string[]> {
    const members = await this.getDepartmentMembers(departmentId);
    return members.map(m => m.characterId);
  }
}

// Экспортируем единственный экземпляр
export const departmentService = new DepartmentService(new SupabaseStorage()); 