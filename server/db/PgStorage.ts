
import { db } from './index';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { 
  users, departments, applications, supportTickets, complaints, reports, notifications, tests, testSessions, testResults,
  type User, type InsertUser, type Department, type InsertDepartment,
  type Application, type InsertApplication, type SupportTicket, type InsertSupportTicket,
  type Complaint, type InsertComplaint, type Report, type InsertReport,
  type Notification, type InsertNotification, type Test, type InsertTest,
  type TestSession, type InsertTestSession, type TestResult, type InsertTestResult
} from '@shared/schema';
import type { IStorage, Character, InsertCharacter } from '../storage';

export class PgStorage implements IStorage {
  async getUser(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByAuthId(authId: string) {
    const result = await db.select().from(users).where(eq(users.authId, authId));
    return result[0];
  }
  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async updateUser(id: number, updates: Partial<User>) {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
  // --- Characters ---
  async getCharactersByOwner(ownerId: number): Promise<Character[]> {
    // TODO: Implement characters table and return characters by owner
    return [];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    // TODO: Implement characters table and create character
    throw new Error('Characters not implemented in PgStorage yet');
  }

  // --- Departments ---
  async getDepartment(id: number): Promise<Department | undefined> {
    const result = await db.select().from(departments).where(eq(departments.id, id));
    return result[0];
  }

  async getAllDepartments(): Promise<Department[]> {
    try {
      const result = await db.select().from(departments);
      return result as Department[];
    } catch (error) {
      console.error('Error fetching all departments:', error);
      return [];
    }
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  // --- Applications ---
  async getApplication(id: number): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id));
    return result[0];
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    const result = await db.select().from(applications).where(eq(applications.authorId, userId));
    return result;
  }

  async getAllApplications(): Promise<Application[]> {
    return db.select().from(applications);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [created] = await db.insert(applications).values(application).returning();
    return created;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const [updated] = await db.update(applications).set(updates).where(eq(applications.id, id)).returning();
    return updated;
  }

  // --- Support Tickets ---
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return result[0];
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    const result = await db.select().from(supportTickets).where(eq(supportTickets.authorId, userId));
    return result;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets);
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [created] = await db.insert(supportTickets).values(ticket).returning();
    return created;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id)).returning();
    return updated;
  }

  // --- Complaints ---
  async getComplaint(id: number): Promise<Complaint | undefined> {
    const result = await db.select().from(complaints).where(eq(complaints.id, id));
    return result[0];
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    const result = await db.select().from(complaints).where(eq(complaints.authorId, userId));
    return result;
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return db.select().from(complaints);
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const [created] = await db.insert(complaints).values(complaint).returning();
    return created;
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const [updated] = await db.update(complaints).set(updates).where(eq(complaints.id, id)).returning();
    return updated;
  }

  // --- Reports ---
  async getReport(id: number): Promise<Report | undefined> {
    const result = await db.select().from(reports).where(eq(reports.id, id));
    return result[0];
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const result = await db.select().from(reports).where(eq(reports.authorId, userId));
    return result;
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [created] = await db.insert(reports).values(report).returning();
    return created;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const [updated] = await db.update(reports).set(updates).where(eq(reports.id, id)).returning();
    return updated;
  }

  // --- Notifications ---
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const result = await db.select().from(notifications).where(eq(notifications.recipientId, userId));
    return result;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return updated;
  }

  // --- Tests ---
  async getTest(id: number): Promise<Test | undefined> {
    const result = await db.select().from(tests).where(eq(tests.id, id));
    return result[0];
  }

  async getAllTests(): Promise<Test[]> {
    return db.select().from(tests);
  }

  async createTest(test: InsertTest): Promise<Test> {
    const [created] = await db.insert(tests).values(test).returning();
    return created;
  }

  async getApplicationsByType(type: string): Promise<Application[]> {
    const result = await db.select().from(applications).where(eq(applications.type, type));
    return result;
  }

  // Test session operations
  async createTestSession(session: InsertTestSession): Promise<TestSession> {
    const [created] = await db.insert(testSessions).values(session).returning();
    return created;
  }

  async getActiveTestSession(userId: number, testId: number): Promise<TestSession | undefined> {
    const result = await db.select()
      .from(testSessions)
      .where(and(
        eq(testSessions.userId, userId),
        eq(testSessions.testId, testId),
        eq(testSessions.status, 'in_progress')
      ));
    return result[0];
  }

  async updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession | undefined> {
    const [updated] = await db.update(testSessions).set(updates).where(eq(testSessions.id, id)).returning();
    return updated;
  }

  // Test result operations
  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const [created] = await db.insert(testResults).values(result).returning();
    return created;
  }

  async getTestAttempts(userId: number, testId: number): Promise<TestResult[]> {
    const result = await db.select()
      .from(testResults)
      .where(and(
        eq(testResults.userId, userId),
        eq(testResults.testId, testId)
      ));
    return result.sort((a: TestResult, b: TestResult) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getTestResults(userId: number, testId: number): Promise<TestResult[]> {
    const result = await db.select()
      .from(testResults)
      .where(and(
        eq(testResults.userId, userId),
        eq(testResults.testId, testId)
      ));
    return result.sort((a: TestResult, b: TestResult) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Additional notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }

  async markAllNotificationsAsRead(userId: number): Promise<Notification[]> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.recipientId, userId), eq(notifications.isRead, false)))
      .returning();
    return result;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
}
