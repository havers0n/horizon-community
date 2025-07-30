import { supabase, type Tables, type Inserts, type Updates } from '../lib/supabase.js';
import bcrypt from 'bcrypt';
import type { IStorage, User, InsertUser, Department, InsertDepartment, Character, InsertCharacter, Application, InsertApplication, Report, InsertReport, Notification, InsertNotification, SupportTicket, InsertSupportTicket, Complaint, InsertComplaint, Test, InsertTest, TestSession, InsertTestSession, TestResult, InsertTestResult } from '../types';

export class SupabaseStorage implements IStorage {
  
  // ===== TYPE ADAPTERS =====
  
  private adaptSupabaseUserToUser(supabaseUser: Tables<'users'>): User {
    return {
      id: supabaseUser.id,
      username: supabaseUser.username,
      email: supabaseUser.email,
      passwordHash: supabaseUser.password_hash,
      role: supabaseUser.role,
      status: supabaseUser.status,
      departmentId: supabaseUser.department_id || undefined,
      secondaryDepartmentId: supabaseUser.secondary_department_id || undefined,
      rank: supabaseUser.rank || undefined,
      division: supabaseUser.division || undefined,
      qualifications: supabaseUser.qualifications,
      gameWarnings: supabaseUser.game_warnings,
      adminWarnings: supabaseUser.admin_warnings,
      authId: supabaseUser.auth_id || undefined,
      apiToken: supabaseUser.api_token || undefined,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at)
    };
  }

  private adaptUserToSupabaseUser(user: InsertUser): Inserts<'users'> {
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
      qualifications: user.qualifications,
      game_warnings: user.gameWarnings,
      admin_warnings: user.adminWarnings,
      auth_id: user.authId || null,
      api_token: user.apiToken || null
    };
  }

  private adaptSupabaseDepartmentToDepartment(supabaseDept: Tables<'departments'>): Department {
    return {
      id: supabaseDept.id,
      name: supabaseDept.name,
      fullName: supabaseDept.name, // Используем name как fullName
      description: supabaseDept.description || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private adaptDepartmentToSupabaseDepartment(dept: InsertDepartment): Inserts<'departments'> {
    return {
      name: dept.name,
      description: dept.description || null
    };
  }

  // ===== USER OPERATIONS =====
  
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log(`🔍 SupabaseStorage.getUserByEmail: Поиск пользователя с email: ${email}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`✅ SupabaseStorage.getUserByEmail: Пользователь не найден`);
        return undefined;
      }
      console.error(`❌ SupabaseStorage.getUserByEmail: Ошибка - ${error.message}`);
      return undefined;
    }
    
    console.log(`✅ SupabaseStorage.getUserByEmail: Пользователь найден`);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting user by username:', error);
      return undefined;
    }
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    console.log(`🔍 SupabaseStorage.getUserByAuthId: Поиск пользователя с auth_id: ${authId}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`⚠️ Пользователь с auth_id ${authId} не найден в users`);
        return undefined;
      }
      console.error(`❌ SupabaseStorage.getUserByAuthId: Ошибка - ${error.message}`);
      return undefined;
    }
    
    console.log(`✅ SupabaseStorage.getUserByAuthId: Пользователь найден`);
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const supabaseUser = this.adaptUserToSupabaseUser(user);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...supabaseUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return this.adaptSupabaseUserToUser(data);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    // Преобразуем обновления в формат Supabase
    const supabaseUpdates: any = {};
    if (updates.username) supabaseUpdates.username = updates.username;
    if (updates.email) supabaseUpdates.email = updates.email;
    if (updates.passwordHash) supabaseUpdates.password_hash = updates.passwordHash;
    if (updates.role) supabaseUpdates.role = updates.role;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.departmentId !== undefined) supabaseUpdates.department_id = updates.departmentId;
    if (updates.secondaryDepartmentId !== undefined) supabaseUpdates.secondary_department_id = updates.secondaryDepartmentId;
    if (updates.rank) supabaseUpdates.rank = updates.rank;
    if (updates.division) supabaseUpdates.division = updates.division;
    if (updates.qualifications) supabaseUpdates.qualifications = updates.qualifications;
    if (updates.gameWarnings !== undefined) supabaseUpdates.game_warnings = updates.gameWarnings;
    if (updates.adminWarnings !== undefined) supabaseUpdates.admin_warnings = updates.adminWarnings;
    if (updates.authId) supabaseUpdates.auth_id = updates.authId;
    if (updates.apiToken) supabaseUpdates.api_token = updates.apiToken;
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...supabaseUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    
    return data ? this.adaptSupabaseUserToUser(data) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }
    
    return (data || []).map(user => this.adaptSupabaseUserToUser(user));
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // ===== DEPARTMENT OPERATIONS =====
  
  async getDepartment(id: number): Promise<Department | undefined> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting department:', error);
      return undefined;
    }
    return data ? this.adaptSupabaseDepartmentToDepartment(data) : undefined;
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.error('Error getting all departments:', error);
      return [];
    }
    
    return (data || []).map(dept => this.adaptSupabaseDepartmentToDepartment(dept));
  }

  async getDepartments(): Promise<Department[]> {
    return this.getAllDepartments();
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const supabaseDept = this.adaptDepartmentToSupabaseDepartment(department);
    
    const { data, error } = await supabase
      .from('departments')
      .insert(supabaseDept)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating department:', error);
      throw new Error(`Failed to create department: ${error.message}`);
    }
    
    return this.adaptSupabaseDepartmentToDepartment(data);
  }

  // ===== CHARACTER OPERATIONS =====
  
  async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    const { data, error } = await supabase
      .from('common.characters')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) {
      console.error('Error getting characters by owner:', error);
      return [];
    }
    
    return (data || []).map(char => ({
      id: char.id,
      name: char.name,
      description: char.description,
      ownerId: char.owner_id,
      createdAt: new Date(char.created_at),
      updatedAt: new Date(char.updated_at)
    }));
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const supabaseChar = {
      name: character.name,
      description: character.description,
      owner_id: character.ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('common.characters')
      .insert(supabaseChar)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating character:', error);
      throw new Error(`Failed to create character: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      ownerId: data.owner_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  // ===== APPLICATION OPERATIONS =====
  
  async getApplication(id: number): Promise<Application | undefined> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting application:', error);
      return undefined;
    }
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      submittedAt: new Date(data.submitted_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting applications by user:', error);
      return [];
    }
    
    return (data || []).map(app => ({
      id: app.id,
      userId: app.user_id,
      type: app.type,
      status: app.status,
      submittedAt: new Date(app.submitted_at),
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at)
    }));
  }

  async getAllApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*');
    
    if (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
    
    return (data || []).map(app => ({
      id: app.id,
      userId: app.user_id,
      type: app.type,
      status: app.status,
      submittedAt: new Date(app.submitted_at),
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at)
    }));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const supabaseApp = {
      user_id: application.userId,
      type: application.type,
      status: application.status,
      submitted_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('applications')
      .insert(supabaseApp)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      throw new Error(`Failed to create application: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      submittedAt: new Date(data.submitted_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const supabaseUpdates: any = {};
    if (updates.userId !== undefined) supabaseUpdates.user_id = updates.userId;
    if (updates.type) supabaseUpdates.type = updates.type;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.submittedAt !== undefined) supabaseUpdates.submitted_at = updates.submittedAt.toISOString();
    
    const { data, error } = await supabase
      .from('applications')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      submittedAt: new Date(data.submitted_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  // ===== REPORT OPERATIONS =====
  
  async getReport(id: number): Promise<Report | undefined> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting report:', error);
      return undefined;
    }
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting reports by user:', error);
      return [];
    }
    
    return (data || []).map(report => ({
      id: report.id,
      userId: report.user_id,
      type: report.type,
      status: report.status,
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at)
    }));
  }

  async getAllReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*');
    
    if (error) {
      console.error('Error getting all reports:', error);
      return [];
    }
    
    return (data || []).map(report => ({
      id: report.id,
      userId: report.user_id,
      type: report.type,
      status: report.status,
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at)
    }));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const supabaseReport = {
      user_id: report.userId,
      type: report.type,
      status: report.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('reports')
      .insert(supabaseReport)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating report:', error);
      throw new Error(`Failed to create report: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const supabaseUpdates: any = {};
    if (updates.userId !== undefined) supabaseUpdates.user_id = updates.userId;
    if (updates.type) supabaseUpdates.type = updates.type;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.createdAt !== undefined) supabaseUpdates.created_at = updates.createdAt.toISOString();
    if (updates.updatedAt !== undefined) supabaseUpdates.updated_at = updates.updatedAt.toISOString();
    
    const { data, error } = await supabase
      .from('reports')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating report:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  // ===== SUPPORT TICKET OPERATIONS =====
  
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting support ticket:', error);
      return undefined;
    }
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting support tickets by user:', error);
      return [];
    }
    
    return (data || []).map(ticket => ({
      id: ticket.id,
      userId: ticket.user_id,
      type: ticket.type,
      status: ticket.status,
      createdAt: new Date(ticket.created_at),
      updatedAt: new Date(ticket.updated_at)
    }));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*');
    
    if (error) {
      console.error('Error getting all support tickets:', error);
      return [];
    }
    
    return (data || []).map(ticket => ({
      id: ticket.id,
      userId: ticket.user_id,
      type: ticket.type,
      status: ticket.status,
      createdAt: new Date(ticket.created_at),
      updatedAt: new Date(ticket.updated_at)
    }));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const supabaseTicket = {
      user_id: ticket.userId,
      type: ticket.type,
      status: ticket.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(supabaseTicket)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating support ticket:', error);
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const supabaseUpdates: any = {};
    if (updates.userId !== undefined) supabaseUpdates.user_id = updates.userId;
    if (updates.type) supabaseUpdates.type = updates.type;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.createdAt !== undefined) supabaseUpdates.created_at = updates.createdAt.toISOString();
    if (updates.updatedAt !== undefined) supabaseUpdates.updated_at = updates.updatedAt.toISOString();
    
    const { data, error } = await supabase
      .from('support_tickets')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating support ticket:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  // ===== PLACEHOLDER METHODS FOR COMPATIBILITY =====
  
  // Эти методы пока не реализованы, но нужны для совместимости с интерфейсом
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting notifications by user:', error);
      return [];
    }
    
    return (data || []).map(not => ({
      id: not.id,
      userId: not.user_id,
      type: not.type,
      message: not.message,
      isRead: not.is_read,
      createdAt: new Date(not.created_at)
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const supabaseNot = {
      user_id: notification.userId,
      type: notification.type,
      message: notification.message,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(supabaseNot)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      isRead: data.is_read,
      createdAt: new Date(data.created_at)
    };
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      isRead: data.is_read,
      createdAt: new Date(data.created_at)
    } : undefined;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting notification:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      isRead: data.is_read,
      createdAt: new Date(data.created_at)
    } : undefined;
  }

  async markAllNotificationsAsRead(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return [];
    }
    
    return (data || []).map(not => ({
      id: not.id,
      userId: not.user_id,
      type: not.type,
      message: not.message,
      isRead: not.is_read,
      createdAt: new Date(not.created_at)
    }));
  }

  async deleteNotification(id: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting complaint:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting complaints by user:', error);
      return [];
    }
    
    return (data || []).map(compl => ({
      id: compl.id,
      userId: compl.user_id,
      type: compl.type,
      message: compl.message,
      status: compl.status,
      createdAt: new Date(compl.created_at),
      updatedAt: new Date(compl.updated_at)
    }));
  }

  async getAllComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*');
    
    if (error) {
      console.error('Error getting all complaints:', error);
      return [];
    }
    
    return (data || []).map(compl => ({
      id: compl.id,
      userId: compl.user_id,
      type: compl.type,
      message: compl.message,
      status: compl.status,
      createdAt: new Date(compl.created_at),
      updatedAt: new Date(compl.updated_at)
    }));
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const supabaseCompl = {
      user_id: complaint.userId,
      type: complaint.type,
      message: complaint.message,
      status: complaint.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('complaints')
      .insert(supabaseCompl)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating complaint:', error);
      throw new Error(`Failed to create complaint: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const supabaseUpdates: any = {};
    if (updates.userId !== undefined) supabaseUpdates.user_id = updates.userId;
    if (updates.type) supabaseUpdates.type = updates.type;
    if (updates.message) supabaseUpdates.message = updates.message;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.createdAt !== undefined) supabaseUpdates.created_at = updates.createdAt.toISOString();
    if (updates.updatedAt !== undefined) supabaseUpdates.updated_at = updates.updatedAt.toISOString();
    
    const { data, error } = await supabase
      .from('complaints')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating complaint:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      message: data.message,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getTest(id: number): Promise<Test | undefined> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting test:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async getAllTests(): Promise<Test[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*');
    
    if (error) {
      console.error('Error getting all tests:', error);
      return [];
    }
    
    return (data || []).map(test => ({
      id: test.id,
      name: test.name,
      description: test.description,
      createdAt: new Date(test.created_at),
      updatedAt: new Date(test.updated_at)
    }));
  }

  async createTest(test: InsertTest): Promise<Test> {
    const supabaseTest = {
      name: test.name,
      description: test.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('tests')
      .insert(supabaseTest)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test:', error);
      throw new Error(`Failed to create test: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async getApplicationsByType(type: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('type', type);
    
    if (error) {
      console.error('Error getting applications by type:', error);
      return [];
    }
    
    return (data || []).map(app => ({
      id: app.id,
      userId: app.user_id,
      type: app.type,
      status: app.status,
      submittedAt: new Date(app.submitted_at),
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at)
    }));
  }

  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const supabaseSession = {
      user_id: session.userId,
      test_id: session.testId,
      status: session.status,
      started_at: new Date().toISOString(),
      ended_at: null, // Will be updated later
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('test_sessions')
      .insert(supabaseSession)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test session:', error);
      throw new Error(`Failed to create test session: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      endedAt: null, // Will be updated later
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async getActiveTestSession(userId: number, testId: number): Promise<TestSession | undefined> {
    const { data, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .eq('ended_at', null) // Only get active sessions
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      console.error('Error getting active test session:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      endedAt: null, // Will be updated later
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const supabaseUpdates: any = {};
    if (updates.userId !== undefined) supabaseUpdates.user_id = updates.userId;
    if (updates.testId !== undefined) supabaseUpdates.test_id = updates.testId;
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.startedAt !== undefined) supabaseUpdates.started_at = updates.startedAt.toISOString();
    if (updates.endedAt !== undefined) supabaseUpdates.ended_at = updates.endedAt.toISOString();
    if (updates.createdAt !== undefined) supabaseUpdates.created_at = updates.createdAt.toISOString();
    if (updates.updatedAt !== undefined) supabaseUpdates.updated_at = updates.updatedAt.toISOString();
    
    const { data, error } = await supabase
      .from('test_sessions')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating test session:', error);
      return undefined;
    }
    
    return data ? {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      endedAt: data.ended_at ? new Date(data.ended_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : undefined;
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const supabaseResult = {
      user_id: result.userId,
      test_id: result.testId,
      session_id: result.sessionId,
      score: result.score,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      incorrect_answers: result.incorrectAnswers,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('test_results')
      .insert(supabaseResult)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test result:', error);
      throw new Error(`Failed to create test result: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      testId: data.test_id,
      sessionId: data.session_id,
      score: data.score,
      totalQuestions: data.total_questions,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      createdAt: new Date(data.created_at)
    };
  }

  async getTestAttempts(userId: number, testId: number): Promise<TestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId);
    
    if (error) {
      console.error('Error getting test attempts:', error);
      return [];
    }
    
    return (data || []).map(result => ({
      id: result.id,
      userId: result.user_id,
      testId: result.test_id,
      sessionId: result.session_id,
      score: result.score,
      totalQuestions: result.total_questions,
      correctAnswers: result.correct_answers,
      incorrectAnswers: result.incorrect_answers,
      createdAt: new Date(result.created_at)
    }));
  }

  async getTestResults(userId: number, testId: number): Promise<TestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId);
    
    if (error) {
      console.error('Error getting test results:', error);
      return [];
    }
    
    return (data || []).map(result => ({
      id: result.id,
      userId: result.user_id,
      testId: result.test_id,
      sessionId: result.session_id,
      score: result.score,
      totalQuestions: result.total_questions,
      correctAnswers: result.correct_answers,
      incorrectAnswers: result.incorrect_answers,
      createdAt: new Date(result.created_at)
    }));
  }

  async getAllBolos(): Promise<any[]> {
    // TODO: Реализовать когда будет таблица bolos
    return [];
  }

  async getBoloById(id: number): Promise<any | undefined> {
    // TODO: Реализовать когда будет таблица bolos
    return undefined;
  }

  async createBolo(bolo: any): Promise<any> {
    // TODO: Реализовать когда будет таблица bolos
    throw new Error('BOLOs not implemented yet');
  }

  async updateBolo(id: number, updates: any): Promise<any | undefined> {
    // TODO: Реализовать когда будет таблица bolos
    return undefined;
  }

  async deleteBolo(id: number): Promise<void> {
    // TODO: Реализовать когда будет таблица bolos
  }

  async getAllUnits(): Promise<any[]> {
    // TODO: Реализовать когда будет таблица units
    return [];
  }

  async getUnitById(id: number): Promise<any | undefined> {
    // TODO: Реализовать когда будет таблица units
    return undefined;
  }

  async createUnit(unit: any): Promise<any> {
    // TODO: Реализовать когда будет таблица units
    throw new Error('Units not implemented yet');
  }

  async updateUnit(id: number, updates: any): Promise<any | undefined> {
    // TODO: Реализовать когда будет таблица units
    return undefined;
  }

  async deleteUnit(id: number): Promise<void> {
    // TODO: Реализовать когда будет таблица units
  }
} 