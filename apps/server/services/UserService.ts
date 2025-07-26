import { storage } from '../storage';
import { User, InsertUser } from '../types';

export class UserService {
  async createUser(userData: InsertUser): Promise<User> {
    return storage.createUser(userData);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return storage.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.getUserByEmail(email);
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    return storage.getUserByAuthId(authId);
  }

  async getUserByCadToken(token: string): Promise<User | undefined> {
    // Mock implementation - in real app would search by cadToken field
    const allUsers = await storage.getAllUsers();
    return allUsers.find(user => user.apiToken === token);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    return storage.updateUser(id, updates);
  }

  async updatePassword(id: number, newPasswordHash: string): Promise<User | undefined> {
    return storage.updateUser(id, { passwordHash: newPasswordHash });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return storage.validatePassword(password, hash);
  }

  async generateCadToken(userId: number): Promise<string> {
    const token = `cad_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await storage.updateUser(userId, { apiToken: token });
    return token;
  }

  async generateApiToken(userId: number): Promise<string> {
    const token = `api_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await storage.updateUser(userId, { apiToken: token });
    return token;
  }

  async removeApiToken(userId: number): Promise<void> {
    await storage.updateUser(userId, { apiToken: null });
  }

  async getAllUsers(): Promise<User[]> {
    return storage.getAllUsers();
  }

  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await storage.getAllUsers();
    const lowerQuery = query.toLowerCase();
    
    return allUsers.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    );
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const allUsers = await storage.getAllUsers();
    return allUsers.filter(user => user.role === role);
  }

  async getUsersByDepartment(departmentId: number): Promise<User[]> {
    const allUsers = await storage.getAllUsers();
    return allUsers.filter(user => 
      user.departmentId === departmentId || 
      user.secondaryDepartmentId === departmentId
    );
  }

  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const allUsers = await storage.getAllUsers();
    
    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    allUsers.forEach(user => {
      byRole[user.role] = (byRole[user.role] || 0) + 1;
      byStatus[user.status] = (byStatus[user.status] || 0) + 1;
    });
    
    return {
      total: allUsers.length,
      byRole,
      byStatus
    };
  }

  async getUserWithCharacters(id: number): Promise<{ user: User; characters: any[] } | undefined> {
    const user = await storage.getUser(id);
    if (!user) return undefined;

    const characters = await storage.getCharactersByOwner(id);

    return {
      user,
      characters
    };
  }
}

// Экспортируем экземпляр сервиса
export const userService = new UserService(); 