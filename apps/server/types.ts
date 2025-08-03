// Backend Types - УДАЛЕНЫ УСТАРЕВШИЕ ТИПЫ С NUMBER ID
// Все типы теперь используют UUID из packages/db-types

export interface Department {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertDepartment {
  name: string;
  fullName: string;
  description?: string;
}

export interface Character {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertCharacter {
  ownerId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber?: string;
  address?: string;
}

export interface Application {
  id: string;
  authorId: string;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewerId?: string;
  reviewComment?: string;
  characterId?: string;
  statusHistory?: Array<{
    status: string;
    date: string;
    comment: string;
    reviewerId: string;
  }>;
}

export interface InsertApplication {
  authorId: string;
  type: string;
  status: string;
  data: any;
  reviewerId?: string;
  reviewComment?: string;
  characterId?: string;
}

export interface Report {
  id: string;
  authorId: string;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertReport {
  authorId: string;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertNotification {
  recipientId: string;
  content: string;
  link?: string;
  isRead?: boolean;
}

export interface SupportTicket {
  id: string;
  authorId: string;
  status: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

export interface InsertSupportTicket {
  authorId: string;
  status: string;
  messages?: any[];
}

export interface Complaint {
  id: string;
  authorId: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertComplaint {
  authorId: string;
  subject: string;
  content: string;
  status: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertTest {
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  departmentId: string;
}

export interface TestSession {
  id: string;
  userId: string;
  testId: string;
  status: string;
  startTime: string;
  endTime?: string;
  answers: any[];
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertTestSession {
  userId: string;
  testId: string;
  status: string;
  startTime: string;
  endTime?: string;
  answers?: any[];
  score?: number;
}

export interface TestResult {
  id: string;
  userId: string;
  testId: string;
  sessionId: string;
  score: number;
  passed: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertTestResult {
  userId: string;
  testId: string;
  sessionId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

// Storage Interface - ОБНОВЛЕН ДЛЯ UUID
export interface IStorage {
  // User operations - УДАЛЕНЫ, используются типы из packages/db-types
  // Department operations
  getDepartment(id: string): Promise<Department | undefined>;
  getDepartments(): Promise<Department[]>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Character operations
  getCharactersByOwner(ownerId: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  
  // Application operations
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  
  // Report operations
  getReport(id: string): Promise<Report | undefined>;
  getReportsByUser(userId: string): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, updates: Partial<Report>): Promise<Report | undefined>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  getNotification(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<Notification[]>;
  deleteNotification(id: string): Promise<void>;
  
  // Support ticket operations
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getSupportTicketsByUser(userId: string): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Complaint operations
  getComplaint(id: string): Promise<Complaint | undefined>;
  getComplaintsByUser(userId: string): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined>;
  
  // Test operations
  getTest(id: string): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  getApplicationsByType(type: string): Promise<Application[]>;
  
  // Test session operations
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  getActiveTestSession(userId: string, testId: string): Promise<TestSession | undefined>;
  updateTestSession(id: string, updates: Partial<TestSession>): Promise<TestSession | undefined>;
  
  // Test result operations
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  getTestAttempts(userId: string, testId: string): Promise<TestResult[]>;
  getTestResults(userId: string, testId: string): Promise<TestResult[]>;
  
  // Auth operations - УДАЛЕНЫ, используются современные методы аутентификации
}

// Zod Schemas - ОБНОВЛЕНЫ ДЛЯ UUID
export const loginSchema = {
  parse: (data: any) => {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    return data;
  }
};

export const registerSchema = {
  parse: (data: any) => {
    if (!data.username || !data.email || !data.password) {
      throw new Error('Username, email and password are required');
    }
    return data;
  }
};

export const insertApplicationSchema = {
  parse: (data: any) => {
    if (!data.authorId || !data.type) {
      throw new Error('Author ID and type are required');
    }
    return data;
  }
};

export const insertComplaintSchema = {
  parse: (data: any) => {
    if (!data.authorId || !data.subject || !data.content) {
      throw new Error('Author ID, subject and content are required');
    }
    return data;
  }
};

// Mock schemas for backward compatibility - ОБНОВЛЕНЫ ДЛЯ UUID
export const users = { name: 'profiles' }; // Изменено на profiles
export const characters = { name: 'characters' };
export const departments = { name: 'departments' };
export const applications = { name: 'applications' };
export const reports = { name: 'reports' };
export const notifications = { name: 'notifications' };
export const supportTickets = { name: 'support_tickets' };
export const complaints = { name: 'complaints' };
export const tests = { name: 'tests' };
export const testSessions = { name: 'test_sessions' };
export const testResults = { name: 'test_results' };
export const reportTemplates = { name: 'report_templates' };
export const filledReports = { name: 'filled_reports' };
export const activeUnits = { name: 'active_units' };
export const call911 = { name: 'call911' };
export const callAttachments = { name: 'call_attachments' }; 