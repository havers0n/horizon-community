
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import { 
  type User, type InsertUser, type Department, type InsertDepartment,
  type Application, type InsertApplication, type SupportTicket, type InsertSupportTicket,
  type Complaint, type InsertComplaint, type Report, type InsertReport,
  type Notification, type InsertNotification, type Test, type InsertTest,
  type TestSession, type InsertTestSession, type TestResult, type InsertTestResult,
  type Character, type InsertCharacter
} from '../types';
import type { IStorage } from '../types';

export class PgStorage implements IStorage {
  private pool: any; // Используем any для совместимости с CommonJS версией

  constructor(pool: any) {
    console.log('🔗 PgStorage: Используем переданный пул подключений');
    this.pool = pool;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log(`🔍 PgStorage.getUserByEmail: Поиск пользователя с email: ${email}`);
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      console.log(`✅ PgStorage.getUserByEmail: Результат - ${result.rows.length} записей`);
      return result.rows[0] as User | undefined;
    } catch (error: any) {
      console.error(`❌ PgStorage.getUserByEmail: Ошибка - ${error.message}`);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] as User | undefined;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    console.log(`🔍 PgStorage.getUserByAuthId: Поиск пользователя с auth_id: ${authId}`);
    try {
      const result = await this.pool.query('SELECT * FROM users WHERE auth_id = $1', [authId]);
      console.log(`✅ PgStorage.getUserByAuthId: Результат - ${result.rows.length} записей`);
      return result.rows[0] as User | undefined;
    } catch (error: any) {
      console.error(`❌ PgStorage.getUserByAuthId: Ошибка - ${error.message}`);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.pool.query(`
      INSERT INTO users (username, email, password_hash, role, status, auth_id, game_warnings, admin_warnings, api_token, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [
      user.username, user.email, user.passwordHash, user.role, user.status,
      user.authId, user.gameWarnings || 0, user.adminWarnings || 0, user.apiToken || null
    ]);
    return result.rows[0] as User;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as User | undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.pool.query('SELECT * FROM users');
    return result.rows as User[];
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Character operations
  async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    const result = await this.pool.query('SELECT * FROM characters WHERE owner_id = $1', [ownerId]);
    return result.rows as Character[];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const result = await this.pool.query(`
      INSERT INTO characters (owner_id, first_name, last_name, department_id, rank, status, insurance_number, address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      character.ownerId, character.firstName, character.lastName, character.departmentId,
      character.rank || null, character.status, character.insuranceNumber || null, character.address || null
    ]);
    return result.rows[0] as Character;
  }

  // Department operations
  async getDepartment(id: number): Promise<Department | undefined> {
    const result = await this.pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0] as Department | undefined;
  }

  async getAllDepartments(): Promise<Department[]> {
    const result = await this.pool.query('SELECT * FROM departments');
    return result.rows as Department[];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await this.pool.query(`
      INSERT INTO departments (name, full_name, description, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `, [department.name, department.fullName, department.description || null]);
    return result.rows[0] as Department;
  }

  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    const result = await this.pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    return result.rows[0] as Application | undefined;
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    const result = await this.pool.query('SELECT * FROM applications WHERE author_id = $1', [userId]);
    return result.rows as Application[];
  }

  async getAllApplications(): Promise<Application[]> {
    const result = await this.pool.query('SELECT * FROM applications');
    return result.rows as Application[];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const result = await this.pool.query(`
      INSERT INTO applications (author_id, type, status, data, reviewer_id, review_comment, character_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      application.authorId, application.type, application.status, JSON.stringify(application.data),
      application.reviewerId || null, application.reviewComment || null, application.characterId || null
    ]);
    return result.rows[0] as Application;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE applications SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as Application | undefined;
  }

  // Report operations
  async getReport(id: number): Promise<Report | undefined> {
    const result = await this.pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    return result.rows[0] as Report | undefined;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const result = await this.pool.query('SELECT * FROM reports WHERE author_id = $1', [userId]);
    return result.rows as Report[];
  }

  async getAllReports(): Promise<Report[]> {
    const result = await this.pool.query('SELECT * FROM reports');
    return result.rows as Report[];
  }

  async createReport(report: InsertReport): Promise<Report> {
    const result = await this.pool.query(`
      INSERT INTO reports (author_id, status, file_url, supervisor_comment, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [
      report.authorId, report.status, report.fileUrl, report.supervisorComment || null
    ]);
    return result.rows[0] as Report;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE reports SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as Report | undefined;
  }

  // Notification operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const result = await this.pool.query('SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows as Notification[];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await this.pool.query(`
      INSERT INTO notifications (recipient_id, content, link, is_read, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [
      notification.recipientId, notification.content, notification.link || null, notification.isRead || false
    ]);
    return result.rows[0] as Notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await this.pool.query(`
      UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id]);
    return result.rows[0] as Notification | undefined;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await this.pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0] as Notification | undefined;
  }

  async markAllNotificationsAsRead(userId: number): Promise<Notification[]> {
    const result = await this.pool.query(`
      UPDATE notifications SET is_read = true, updated_at = NOW() WHERE recipient_id = $1 RETURNING *
    `, [userId]);
    return result.rows as Notification[];
  }

  async deleteNotification(id: number): Promise<void> {
    await this.pool.query('DELETE FROM notifications WHERE id = $1', [id]);
  }

  // Support ticket operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const result = await this.pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);
    return result.rows[0] as SupportTicket | undefined;
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    const result = await this.pool.query('SELECT * FROM support_tickets WHERE author_id = $1', [userId]);
    return result.rows as SupportTicket[];
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    const result = await this.pool.query('SELECT * FROM support_tickets');
    return result.rows as SupportTicket[];
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const result = await this.pool.query(`
      INSERT INTO support_tickets (author_id, status, messages, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `, [
      ticket.authorId, ticket.status, JSON.stringify(ticket.messages || [])
    ]);
    return result.rows[0] as SupportTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE support_tickets SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as SupportTicket | undefined;
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    const result = await this.pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
    return result.rows[0] as Complaint | undefined;
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    const result = await this.pool.query('SELECT * FROM complaints WHERE author_id = $1', [userId]);
    return result.rows as Complaint[];
  }

  async getAllComplaints(): Promise<Complaint[]> {
    const result = await this.pool.query('SELECT * FROM complaints');
    return result.rows as Complaint[];
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const result = await this.pool.query(`
      INSERT INTO complaints (author_id, subject, content, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [
      complaint.authorId, complaint.subject, complaint.content, complaint.status
    ]);
    return result.rows[0] as Complaint;
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE complaints SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as Complaint | undefined;
  }

  // Test operations
  async getTest(id: number): Promise<Test | undefined> {
    const result = await this.pool.query('SELECT * FROM tests WHERE id = $1', [id]);
    return result.rows[0] as Test | undefined;
  }

  async getAllTests(): Promise<Test[]> {
    const result = await this.pool.query('SELECT * FROM tests');
    return result.rows as Test[];
  }

  async createTest(test: InsertTest): Promise<Test> {
    const result = await this.pool.query(`
      INSERT INTO tests (title, description, questions, time_limit, passing_score, department_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [
      test.title, test.description, JSON.stringify(test.questions), test.timeLimit,
      test.passingScore, test.departmentId
    ]);
    return result.rows[0] as Test;
  }

  async getApplicationsByType(type: string): Promise<Application[]> {
    const result = await this.pool.query('SELECT * FROM applications WHERE type = $1', [type]);
    return result.rows as Application[];
  }

  // Test session operations
  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const result = await this.pool.query(`
      INSERT INTO test_sessions (user_id, test_id, status, start_time, end_time, answers, score, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      session.userId, session.testId, session.status, session.startTime,
      session.endTime || null, JSON.stringify(session.answers || []), session.score || null
    ]);
    return result.rows[0] as TestSession;
  }

  async getActiveTestSession(userId: number, testId: number): Promise<TestSession | undefined> {
    const result = await this.pool.query(`
      SELECT * FROM test_sessions 
      WHERE user_id = $1 AND test_id = $2 AND status = 'active'
    `, [userId, testId]);
    return result.rows[0] as TestSession | undefined;
  }

  async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await this.pool.query(`
      UPDATE test_sessions SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *
    `, [id, ...values]);
    
    return result.rows[0] as TestSession | undefined;
  }

  // Test result operations
  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const dbResult = await this.pool.query(`
      INSERT INTO test_results (user_id, test_id, session_id, score, passed, completed_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [
      result.userId, result.testId, result.sessionId, result.score,
      result.passed, result.completedAt
    ]);
    return dbResult.rows[0] as TestResult;
  }

  async getTestAttempts(userId: number, testId: number): Promise<TestResult[]> {
    const result = await this.pool.query(`
      SELECT * FROM test_results 
      WHERE user_id = $1 AND test_id = $2
      ORDER BY created_at DESC
    `, [userId, testId]);
    return result.rows as TestResult[];
  }

  async getTestResults(userId: number, testId: number): Promise<TestResult[]> {
    const result = await this.pool.query(`
      SELECT * FROM test_results 
      WHERE user_id = $1 AND test_id = $2
      ORDER BY created_at DESC
    `, [userId, testId]);
    return result.rows as TestResult[];
  }
}
