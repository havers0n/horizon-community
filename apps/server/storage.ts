import type { 
  Users,
  Characters,
  CharactersInsert,
  Departments,
  DepartmentsInsert,
  Applications,
  ApplicationsInsert,
  Reports,
  ReportsInsert,
  Notifications,
  NotificationsInsert,
  SupportTickets,
  SupportTicketsInsert,
  Complaints,
  ComplaintsInsert,
  Tests,
  TestsInsert,
  TestSessions,
  TestSessionsInsert,
  TestResults,
  TestResultsInsert,
  Vehicles,
  VehiclesInsert,
  Weapons,
  WeaponsInsert
} from '../../../packages/db-types/src/index';

import { userService } from './services/UserService.js';
import { characterService } from './services/CharacterService.js';
import { reportService } from './services/ReportService.js';
import { departmentService } from './services/DepartmentService.js';
import { applicationService } from './services/ApplicationService.js';
import { notificationService } from './services/NotificationService.js';
import { supportTicketService } from './services/SupportTicketService.js';
import { call911Service } from './services/Call911Service.js';
import { vehicleService } from './services/VehicleService.js';
import { weaponService } from './services/WeaponService.js';

// ===== АДАПТЕР ДЛЯ СОВМЕСТИМОСТИ С IStorage =====

class StorageAdapter {
  // ===== USER OPERATIONS =====
  async getUser(id: string): Promise<Users | null> {
    return await userService.getUser(id);
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return await userService.getUserByEmail(email);
  }

  async getUserByUsername(username: string): Promise<Users | null> {
    return await userService.getUserByUsername(username);
  }

  async getUserByAuthId(authId: string): Promise<Users | null> {
    return await userService.getUserByAuthId(authId);
  }

  async createUser(user: Partial<Users>): Promise<Users> {
    return await userService.createUser(user);
  }

  async updateUser(id: string, updates: Partial<Users>): Promise<Users | null> {
    return await userService.updateUser(id, updates);
  }

  async getAllUsers(): Promise<Users[]> {
    return await userService.getAllUsers();
  }

  // ===== DEPARTMENT OPERATIONS =====
  async getDepartment(id: string): Promise<Departments | null> {
    return await departmentService.getDepartmentById(id);
  }

  async getDepartments(): Promise<Departments[]> {
    return await departmentService.getAllDepartments();
  }

  async getAllDepartments(): Promise<Departments[]> {
    return await departmentService.getAllDepartments();
  }

  async createDepartment(department: DepartmentsInsert): Promise<Departments> {
    return await departmentService.createDepartment(department);
  }

  // ===== CHARACTER OPERATIONS =====
  async getCharactersByOwner(ownerId: string): Promise<Characters[]> {
    return await characterService.getCharactersByOwner(ownerId);
  }

  async createCharacter(character: CharactersInsert): Promise<Characters> {
    return await characterService.createCharacter(character);
  }

  // ===== APPLICATION OPERATIONS =====
  async getApplication(id: string): Promise<Applications | null> {
    return await applicationService.getApplicationById(id);
  }

  async getApplicationsByUser(userId: string): Promise<Applications[]> {
    return await applicationService.getApplicationsByUser(userId);
  }

  async getAllApplications(): Promise<Applications[]> {
    return await applicationService.getAllApplications();
  }

  async createApplication(application: ApplicationsInsert): Promise<Applications> {
    return await applicationService.createApplication(application);
  }

  async updateApplication(id: string, updates: Partial<Applications>): Promise<Applications | null> {
    return await applicationService.updateApplication(id, updates);
  }

  async getApplicationsByType(type: string): Promise<Applications[]> {
    return await applicationService.getAllApplications();
  }

  // ===== REPORT OPERATIONS =====
  async getReport(id: string): Promise<Reports | null> {
    return await reportService.getReport(id);
  }

  async getReportsByUser(userId: string): Promise<Reports[]> {
    return await reportService.getReportsByUser(userId);
  }

  async getAllReports(): Promise<Reports[]> {
    return await reportService.getAllReports();
  }

  async createReport(report: ReportsInsert): Promise<Reports> {
    return await reportService.createReport(report);
  }

  async updateReport(id: string, updates: Partial<Reports>): Promise<Reports | null> {
    return await reportService.updateReport(id, updates);
  }

  // ===== NOTIFICATION OPERATIONS =====
  async getNotificationsByUser(userId: string): Promise<Notifications[]> {
    return await notificationService.getNotificationsByUser(userId);
  }

  async createNotification(notification: NotificationsInsert): Promise<Notifications> {
    return await notificationService.createNotification(notification);
  }

  async markNotificationAsRead(id: string): Promise<Notifications | null> {
    return await notificationService.updateNotification(id, { isRead: true });
  }

  async getNotification(id: string): Promise<Notifications | null> {
    return await notificationService.getNotificationById(id);
  }

  async markAllNotificationsAsRead(userId: string): Promise<Notifications[]> {
    // Временно возвращаем пустой массив, так как метод не существует
    return [];
  }

  async deleteNotification(id: string): Promise<void> {
    await notificationService.deleteNotification(id);
  }

  // ===== SUPPORT TICKET OPERATIONS =====
  async getSupportTicket(id: string): Promise<SupportTickets | null> {
    return await supportTicketService.getTicketById(id);
  }

  async getSupportTicketsByUser(userId: string): Promise<SupportTickets[]> {
    return await supportTicketService.getTicketsByUser(userId);
  }

  async getAllSupportTickets(): Promise<SupportTickets[]> {
    return await supportTicketService.getAllTickets();
  }

  async createSupportTicket(ticket: SupportTicketsInsert): Promise<SupportTickets> {
    return await supportTicketService.createTicket(ticket);
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTickets>): Promise<SupportTickets | null> {
    return await supportTicketService.updateTicket(id, updates);
  }

  // ===== CALL 911 OPERATIONS =====
  async getCall911(id: string): Promise<any | null> {
    return await call911Service.getCallById(id);
  }

  async getCalls911ByUser(userId: string): Promise<any[]> {
    return await call911Service.getAllCalls();
  }

  async getAllCalls911(): Promise<any[]> {
    return await call911Service.getAllCalls();
  }

  async createCall911(call: any): Promise<any> {
    return await call911Service.createCall(call);
  }

  async updateCall911(id: string, updates: any): Promise<any | null> {
    return await call911Service.updateCall(id, updates);
  }

  // ===== VEHICLE OPERATIONS =====
  async getVehicle(id: string): Promise<Vehicles | null> {
    return await vehicleService.getVehicleById(id);
  }

  async getVehiclesByOwner(ownerId: string): Promise<Vehicles[]> {
    return await vehicleService.getVehiclesByOwnerName(ownerId);
  }

  async getAllVehicles(): Promise<Vehicles[]> {
    return await vehicleService.getAllVehicles();
  }

  async createVehicle(vehicle: VehiclesInsert): Promise<Vehicles> {
    return await vehicleService.createVehicle(vehicle);
  }

  async updateVehicle(id: string, updates: Partial<Vehicles>): Promise<Vehicles | null> {
    return await vehicleService.updateVehicle(id, updates);
  }

  // ===== WEAPON OPERATIONS =====
  async getWeapon(id: string): Promise<Weapons | null> {
    return await weaponService.getWeaponById(id);
  }

  async getWeaponsByOwner(ownerId: string): Promise<Weapons[]> {
    return await weaponService.getWeaponsByOwnerName(ownerId);
  }

  async getAllWeapons(): Promise<Weapons[]> {
    return await weaponService.getAllWeapons();
  }

  async createWeapon(weapon: WeaponsInsert): Promise<Weapons> {
    return await weaponService.createWeapon(weapon);
  }

  async updateWeapon(id: string, updates: Partial<Weapons>): Promise<Weapons | null> {
    return await weaponService.updateWeapon(id, updates);
  }

  // ===== COMPLAINT OPERATIONS =====
  async getComplaint(id: string): Promise<Complaints | null> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async getComplaintsByUser(userId: string): Promise<Complaints[]> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async getAllComplaints(): Promise<Complaints[]> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async createComplaint(complaint: ComplaintsInsert): Promise<Complaints> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async updateComplaint(id: string, updates: Partial<Complaints>): Promise<Complaints | null> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  // ===== TEST OPERATIONS =====
  async getTest(id: string): Promise<Tests | null> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getAllTests(): Promise<Tests[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async createTest(test: TestsInsert): Promise<Tests> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== TEST SESSION OPERATIONS =====
  async createTestSession(session: TestSessionsInsert): Promise<TestSessions> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getActiveTestSession(userId: string, testId: string): Promise<TestSessions | null> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async updateTestSession(id: string, updates: Partial<TestSessions>): Promise<TestSessions | null> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== TEST RESULT OPERATIONS =====
  async createTestResult(result: TestResultsInsert): Promise<TestResults> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getTestAttempts(userId: string, testId: string): Promise<TestResults[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getTestResults(userId: string, testId: string): Promise<TestResults[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== AUTH OPERATIONS =====
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await userService.validatePassword(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return await userService.hashPassword(password);
  }
}

// Экспортируем адаптер для совместимости
export const storage: StorageAdapter = new StorageAdapter();
