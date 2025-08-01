import { supabaseStorage } from './SupabaseStorage.js';
import type { User, InsertUser } from '../types.js';

// ===== USER SERVICE - БИЗНЕС-ЛОГИКА ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

export class UserService {
  
  // ===== АДАПТЕРЫ ТИПОВ =====
  
  private adaptSupabaseUserToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      username: supabaseUser.username,
      email: supabaseUser.email,
      passwordHash: supabaseUser.password_hash,
      role: supabaseUser.role,
      status: supabaseUser.status,
      departmentId: supabaseUser.department_id,
      secondaryDepartmentId: supabaseUser.secondary_department_id,
      rank: supabaseUser.rank,
      division: supabaseUser.division,
      qualifications: supabaseUser.qualifications || [],
      gameWarnings: supabaseUser.game_warnings || 0,
      adminWarnings: supabaseUser.admin_warnings || 0,
      authId: supabaseUser.auth_id,
      apiToken: supabaseUser.api_token,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at)
    };
  }

  private adaptUserToSupabaseUser(user: InsertUser): any {
    return {
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      role: user.role,
      status: user.status,
      department_id: user.departmentId || null,
      secondary_department_id: user.secondaryDepartmentId || null,
      rank: user.rank || null,
      division: user.division || null,
      qualifications: user.qualifications || [],
      game_warnings: user.gameWarnings || 0,
      admin_warnings: user.adminWarnings || 0,
      auth_id: user.authId || null,
      api_token: user.apiToken || null
    };
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ =====
  
  async getUser(id: number): Promise<User | undefined> {
    const data = await supabaseStorage.getById('users', id);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const data = await supabaseStorage.getByField('users', 'email', email);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const data = await supabaseStorage.getByField('users', 'username', username);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const data = await supabaseStorage.getByField('users', 'auth_id', authId);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const supabaseUser = this.adaptUserToSupabaseUser(user);
    const data = await supabaseStorage.insert('users', supabaseUser);
    
    if (!data) {
      throw new Error('Failed to create user');
    }
    
    return this.adaptSupabaseUserToUser(data);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const supabaseUpdates: any = {};
    
    if (updates.username !== undefined) supabaseUpdates.username = updates.username;
    if (updates.email !== undefined) supabaseUpdates.email = updates.email;
    if (updates.passwordHash !== undefined) supabaseUpdates.password_hash = updates.passwordHash;
    if (updates.role !== undefined) supabaseUpdates.role = updates.role;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.departmentId !== undefined) supabaseUpdates.department_id = updates.departmentId;
    if (updates.secondaryDepartmentId !== undefined) supabaseUpdates.secondary_department_id = updates.secondaryDepartmentId;
    if (updates.rank !== undefined) supabaseUpdates.rank = updates.rank;
    if (updates.division !== undefined) supabaseUpdates.division = updates.division;
    if (updates.qualifications !== undefined) supabaseUpdates.qualifications = updates.qualifications;
    if (updates.gameWarnings !== undefined) supabaseUpdates.game_warnings = updates.gameWarnings;
    if (updates.adminWarnings !== undefined) supabaseUpdates.admin_warnings = updates.adminWarnings;
    if (updates.authId !== undefined) supabaseUpdates.auth_id = updates.authId;
    if (updates.apiToken !== undefined) supabaseUpdates.api_token = updates.apiToken;
    
    const data = await supabaseStorage.update('users', id, supabaseUpdates);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const data = await supabaseStorage.list('users');
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  async getUsersByDepartment(departmentId: number): Promise<User[]> {
    const data = await supabaseStorage.list('users', { department_id: departmentId });
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const data = await supabaseStorage.list('users', { role });
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    const data = await supabaseStorage.list('users', { status });
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  // ===== ПОИСК И ФИЛЬТРАЦИЯ =====
  
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const data = await supabaseStorage.search('users', ['username', 'email'], query, limit);
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  async getUsersWithFilters(filters: {
    departmentId?: number;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const supabaseFilters: Record<string, any> = {};
    
    if (filters.departmentId !== undefined) supabaseFilters.department_id = filters.departmentId;
    if (filters.role !== undefined) supabaseFilters.role = filters.role;
    if (filters.status !== undefined) supabaseFilters.status = filters.status;
    
    const data = await supabaseStorage.list('users', supabaseFilters, {
      limit: filters.limit,
      offset: filters.offset,
      orderBy: { column: 'created_at', ascending: false }
    });
    
    return data.map(user => this.adaptSupabaseUserToUser(user));
  }

  // ===== СТАТИСТИКА =====
  
  async getUserCount(): Promise<number> {
    return await supabaseStorage.count('users');
  }

  async getUserCountByDepartment(departmentId: number): Promise<number> {
    return await supabaseStorage.count('users', { department_id: departmentId });
  }

  async getUserCountByRole(role: string): Promise<number> {
    return await supabaseStorage.count('users', { role });
  }

  async getUserCountByStatus(status: string): Promise<number> {
    return await supabaseStorage.count('users', { status });
  }

  // ===== ВАЛИДАЦИЯ =====
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await supabaseStorage.validatePassword(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return await supabaseStorage.hashPassword(password);
  }

  // ===== БИЗНЕС-ЛОГИКА =====
  
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    return !user;
  }

  async activateUser(id: number): Promise<User | undefined> {
    return await this.updateUser(id, { status: 'active' });
  }

  async deactivateUser(id: number): Promise<User | undefined> {
    return await this.updateUser(id, { status: 'inactive' });
  }

  async suspendUser(id: number): Promise<User | undefined> {
    return await this.updateUser(id, { status: 'suspended' });
  }

  async addGameWarning(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    return await this.updateUser(id, { 
      gameWarnings: user.gameWarnings + 1 
    });
  }

  async addAdminWarning(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    return await this.updateUser(id, { 
      adminWarnings: user.adminWarnings + 1 
    });
  }

  async resetWarnings(id: number): Promise<User | undefined> {
    return await this.updateUser(id, { 
      gameWarnings: 0,
      adminWarnings: 0
    });
  }
}

// Экспортируем единственный экземпляр
export const userService = new UserService(); 