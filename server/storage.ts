import { 
  users, departments, applications, supportTickets, complaints, reports, notifications, tests,
  type User, type InsertUser, type Department, type InsertDepartment, 
  type Application, type InsertApplication, type SupportTicket, type InsertSupportTicket,
  type Complaint, type InsertComplaint, type Report, type InsertReport,
  type Notification, type InsertNotification, type Test, type InsertTest
} from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Department operations
  getDepartment(id: number): Promise<Department | undefined>;
  getAllDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  
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
  
  // Test operations
  getTest(id: number): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Auth operations
  validatePassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private departments: Map<number, Department> = new Map();
  private applications: Map<number, Application> = new Map();
  private supportTickets: Map<number, SupportTicket> = new Map();
  private complaints: Map<number, Complaint> = new Map();
  private reports: Map<number, Report> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private tests: Map<number, Test> = new Map();
  
  private currentUserId = 1;
  private currentDepartmentId = 1;
  private currentApplicationId = 1;
  private currentSupportTicketId = 1;
  private currentComplaintId = 1;
  private currentReportId = 1;
  private currentNotificationId = 1;
  private currentTestId = 1;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create default departments
    const lspd = await this.createDepartment({
      name: "LSPD",
      fullName: "Los Santos Police Department",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/194/194279.png",
      description: "Protecting and serving the citizens of Los Santos",
      gallery: []
    });

    const lsfd = await this.createDepartment({
      name: "LSFD",
      fullName: "Los Santos Fire Department",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/1827/1827926.png",
      description: "Fire rescue and emergency medical services",
      gallery: []
    });

    const ems = await this.createDepartment({
      name: "EMS",
      fullName: "Emergency Medical Services",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/1827/1827928.png",
      description: "Medical emergency response and healthcare",
      gallery: []
    });

    const bcso = await this.createDepartment({
      name: "BCSO",
      fullName: "Blaine County Sheriff's Office",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/1827/1827924.png",
      description: "Law enforcement for Blaine County",
      gallery: []
    });

    // Create admin user
    const adminUser = await this.createUser({
      username: "admin",
      email: "admin@cadsystem.com",
      passwordHash: await this.hashPassword("admin123"),
      role: "admin",
      status: "active",
      departmentId: lspd.id,
      rank: "Chief",
      division: "Administration",
      qualifications: ["Leadership", "Management"],
      gameWarnings: 0,
      adminWarnings: 0
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.currentDepartmentId++;
    const newDepartment: Department = { ...department, id };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.authorId === userId);
  }

  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const newApplication: Application = {
      ...application,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates, updatedAt: new Date() };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async getSupportTicketsByUser(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(ticket => ticket.authorId === userId);
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values());
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.currentSupportTicketId++;
    const newTicket: SupportTicket = {
      ...ticket,
      id,
      createdAt: new Date()
    };
    this.supportTickets.set(id, newTicket);
    return newTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(complaint => complaint.authorId === userId);
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const id = this.currentComplaintId++;
    const newComplaint: Complaint = {
      ...complaint,
      id,
      createdAt: new Date()
    };
    this.complaints.set(id, newComplaint);
    return newComplaint;
  }

  async updateComplaint(id: number, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const updatedComplaint = { ...complaint, ...updates };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => report.authorId === userId);
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const newReport: Report = {
      ...report,
      id,
      createdAt: new Date()
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReport(id: number, updates: Partial<Report>): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...updates };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getTest(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async getAllTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async createTest(test: InsertTest): Promise<Test> {
    const id = this.currentTestId++;
    const newTest: Test = { ...test, id };
    this.tests.set(id, newTest);
    return newTest;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export const storage = new MemStorage();
