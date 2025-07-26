// Backend Types
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  departmentId: number | null;
  secondaryDepartmentId: number | null;
  rank: string | null;
  gameWarnings: number;
  adminWarnings: number;
  authId: string;
  createdAt: Date;
  updatedAt: Date;
  apiToken: string | null;
}

export interface InsertUser {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  departmentId?: number | null;
  secondaryDepartmentId?: number | null;
  rank?: string | null;
  gameWarnings?: number;
  adminWarnings?: number;
  authId: string;
  apiToken?: string | null;
}

export interface Department {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertDepartment {
  name: string;
  fullName: string;
  description?: string;
}

export interface Character {
  id: number;
  ownerId: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  rank?: string;
  status: string;
  insuranceNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertCharacter {
  ownerId: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  rank?: string;
  status: string;
  insuranceNumber?: string;
  address?: string;
}

export interface Application {
  id: number;
  authorId: number;
  type: string;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  reviewerId?: number;
  reviewComment?: string;
  characterId?: number;
  statusHistory?: Array<{
    status: string;
    date: string;
    comment: string;
    reviewerId: number;
  }>;
}

export interface InsertApplication {
  authorId: number;
  type: string;
  status: string;
  data: any;
  reviewerId?: number;
  reviewComment?: string;
  characterId?: number;
}

export interface Report {
  id: number;
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertReport {
  authorId: number;
  status: string;
  fileUrl: string;
  supervisorComment?: string;
}

export interface Notification {
  id: number;
  recipientId: number;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertNotification {
  recipientId: number;
  content: string;
  link?: string;
  isRead?: boolean;
}

export interface SupportTicket {
  id: number;
  authorId: number;
  status: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertSupportTicket {
  authorId: number;
  status: string;
  messages?: any[];
}

export interface Complaint {
  id: number;
  authorId: number;
  subject: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertComplaint {
  authorId: number;
  subject: string;
  content: string;
  status: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  departmentId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertTest {
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  departmentId: number;
}

export interface TestSession {
  id: number;
  userId: number;
  testId: number;
  status: string;
  startTime: Date;
  endTime?: Date;
  answers: any[];
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertTestSession {
  userId: number;
  testId: number;
  status: string;
  startTime: Date;
  endTime?: Date;
  answers?: any[];
  score?: number;
}

export interface TestResult {
  id: number;
  userId: number;
  testId: number;
  sessionId: number;
  score: number;
  passed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertTestResult {
  userId: number;
  testId: number;
  sessionId: number;
  score: number;
  passed: boolean;
  completedAt: Date;
}

// Storage Interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAuthId(authId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Department operations
  getDepartment(id: number): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Character operations
  getCharactersByOwner(ownerId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  
  // Report operations
  getReport(id: number): Promise<Report | undefined>;
  getReportsByUser(userId: number): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined>;
  
  // Notification operations
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getNotification(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<Notification[]>;
  deleteNotification(id: number): Promise<void>;
  
  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByUser(userId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Complaint operations
  getComplaint(id: number): Promise<Complaint | undefined>;
  getComplaintsByUser(userId: number): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined>;
  
  // Test operations
  getTest(id: number): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  getApplicationsByType(type: string): Promise<Application[]>;
  
  // Test session operations
  createTestSession(session: InsertTestSession): Promise<TestSession>;
  getActiveTestSession(userId: number, testId: number): Promise<TestSession | undefined>;
  updateTestSession(id: number, updates: Partial<TestSession>): Promise<TestSession | undefined>;
  
  // Test result operations
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  getTestAttempts(userId: number, testId: number): Promise<TestResult[]>;
  getTestResults(userId: number, testId: number): Promise<TestResult[]>;
  
  // Auth operations
  validatePassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

// Zod Schemas
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

// Mock schemas for backward compatibility
export const users = { name: 'users' };
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