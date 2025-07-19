import { createClient } from '@supabase/supabase-js';
import type { 
  User, InsertUser, Department, InsertDepartment,
  Application, InsertApplication, SupportTicket, InsertSupportTicket,
  Complaint, InsertComplaint, Report, InsertReport,
  Notification, InsertNotification, Test, InsertTest,
  TestSession, InsertTestSession, TestResult, InsertTestResult
} from '@shared/schema';
import type { IStorage, Character, InsertCharacter } from '../storage';
import bcrypt from 'bcrypt';

export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
    return data;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting user by email:', error);
      return undefined;
    }
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting user by username:', error);
      return undefined;
    }
    return data;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting user by auth_id:', error);
      return undefined;
    }
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        username: user.username,
        email: user.email,
        password_hash: user.passwordHash,
        role: user.role,
        status: user.status,
        department_id: user.departmentId,
        secondary_department_id: user.secondaryDepartmentId,
        rank: user.rank,
        division: user.division,
        qualifications: user.qualifications,
        game_warnings: user.gameWarnings,
        admin_warnings: user.adminWarnings,
        auth_id: user.authId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    return data;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }
    return data || [];
  }

  // Department operations
  async getDepartment(id: number): Promise<Department | undefined> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting department:', error);
      return undefined;
    }
    return data;
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.error('Error getting all departments:', error);
      return [];
    }
    return data || [];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const { data, error } = await this.supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating department:', error);
      throw error;
    }
    return data;
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting application:', error);
      return undefined;
    }
    return data;
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('author_id', userId);
    
    if (error) {
      console.error('Error getting applications by user:', error);
      return [];
    }
    
    // Маппим поля из базы данных в формат приложения
    const applications = (data || []).map(app => ({
      ...app,
      createdAt: app.created_at, // Явно маппим created_at в createdAt
      updatedAt: app.updated_at, // Явно маппим updated_at в updatedAt
      authorId: app.author_id,   // Явно маппим author_id в authorId
      characterId: app.character_id, // Явно маппим character_id в characterId
      reviewerId: app.reviewer_id,   // Явно маппим reviewer_id в reviewerId
      reviewComment: app.review_comment, // Явно маппим review_comment в reviewComment
      statusHistory: app.status_history  // Явно маппим status_history в statusHistory
    }));
    
    return applications;
  }

  async getAllApplications(): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*');
    
    if (error) {
      console.error('Error getting all applications:', error);
      return [];
    }
    return data || [];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .insert({
        author_id: application.authorId,
        character_id: application.characterId,
        type: application.type,
        status: application.status,
        data: application.data,
        result: application.result,
        reviewer_id: application.reviewerId,
        review_comment: application.reviewComment,
        status_history: application.statusHistory
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      throw error;
    }
    return data;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const { data, error } = await this.supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application:', error);
      return undefined;
    }
    return data;
  }

  // Support ticket operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting support ticket:', error);
      return undefined;
    }
    return data;
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*')
      .eq('author_id', userId);
    
    if (error) {
      console.error('Error getting support tickets by user:', error);
      return [];
    }
    return data || [];
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .select('*');
    
    if (error) {
      console.error('Error getting all support tickets:', error);
      return [];
    }
    return data || [];
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .insert({
        author_id: ticket.authorId,
        status: ticket.status,
        handler_id: ticket.handlerId,
        messages: ticket.messages
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
    return data;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const { data, error } = await this.supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating support ticket:', error);
      return undefined;
    }
    return data;
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting complaint:', error);
      return undefined;
    }
    return data;
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*')
      .eq('author_id', userId);
    
    if (error) {
      console.error('Error getting complaints by user:', error);
      return [];
    }
    return data || [];
  }

  async getAllComplaints(): Promise<Complaint[]> {
    const { data, error } = await this.supabase
      .from('complaints')
      .select('*');
    
    if (error) {
      console.error('Error getting all complaints:', error);
      return [];
    }
    return data || [];
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const { data, error } = await this.supabase
      .from('complaints')
      .insert({
        author_id: complaint.authorId,
        status: complaint.status,
        incident_date: complaint.incidentDate,
        incident_type: complaint.incidentType,
        participants: complaint.participants,
        description: complaint.description,
        evidence_url: complaint.evidenceUrl
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
    return data;
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const { data, error } = await this.supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating complaint:', error);
      return undefined;
    }
    return data;
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting report:', error);
      return undefined;
    }
    return data;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('author_id', userId);
    
    if (error) {
      console.error('Error getting reports by user:', error);
      return [];
    }
    return data || [];
  }

  async getAllReports(): Promise<Report[]> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*');
    
    if (error) {
      console.error('Error getting all reports:', error);
      return [];
    }
    return data || [];
  }

  async createReport(report: InsertReport): Promise<Report> {
    const { data, error } = await this.supabase
      .from('reports')
      .insert({
        author_id: report.authorId,
        status: report.status,
        file_url: report.fileUrl,
        supervisor_comment: report.supervisorComment
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating report:', error);
      throw error;
    }
    return data;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const { data, error } = await this.supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating report:', error);
      return undefined;
    }
    return data;
  }

  // Notification operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting notifications by user:', error);
      return [];
    }
    return data || [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        recipient_id: notification.recipientId,
        content: notification.content,
        link: notification.link,
        is_read: notification.isRead || false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    return data;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return undefined;
    }
    return data;
  }

  // Test operations
  async getTest(id: number): Promise<Test | undefined> {
    const { data, error } = await this.supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting test:', error);
      return undefined;
    }
    return data;
  }

  async getAllTests(): Promise<Test[]> {
    const { data, error } = await this.supabase
      .from('tests')
      .select('*');
    
    if (error) {
      console.error('Error getting all tests:', error);
      return [];
    }
    return data || [];
  }

  async createTest(test: InsertTest): Promise<Test> {
    const { data, error } = await this.supabase
      .from('tests')
      .insert(test)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test:', error);
      throw error;
    }
    return data;
  }

  async getApplicationsByType(type: string): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('type', type);
    
    if (error) {
      console.error('Error getting applications by type:', error);
      return [];
    }
    return data || [];
  }

  // Test session operations
  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const { data, error } = await this.supabase
      .from('test_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test session:', error);
      throw error;
    }
    return data;
  }

  async getActiveTestSession(userId: number, testId: number): Promise<TestSession | undefined> {
    const { data, error } = await this.supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .eq('status', 'in_progress')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting active test session:', error);
      return undefined;
    }
    return data;
  }

  async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const { data, error } = await this.supabase
      .from('test_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating test session:', error);
      return undefined;
    }
    return data;
  }

  // Test result operations
  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const { data, error } = await this.supabase
      .from('test_results')
      .insert(result)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test result:', error);
      throw error;
    }
    return data;
  }

  async getTestAttempts(userId: number, testId: number): Promise<TestResult[]> {
    const { data, error } = await this.supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting test attempts:', error);
      return [];
    }
    return data || [];
  }

  async getTestResults(userId: number, testId: number): Promise<TestResult[]> {
    const { data, error } = await this.supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting test results:', error);
      return [];
    }
    return data || [];
  }

  // Character operations (placeholder - implement if needed)
  async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    // TODO: Implement if characters table exists
    return [];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    // TODO: Implement if characters table exists
    throw new Error('Characters not implemented yet');
  }

  // Auth operations
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Additional notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting notification:', error);
      return undefined;
    }
    return data;
  }

  async markAllNotificationsAsRead(userId: number): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return [];
    }
    return data || [];
  }

  async deleteNotification(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}
