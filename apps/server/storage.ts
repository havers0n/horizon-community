import { IStorage } from './types';
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

class StorageAdapter implements IStorage {
  // ===== USER OPERATIONS =====
  async getUser(id: number) {
    return await userService.getUser(id);
  }

  async getUserByEmail(email: string) {
    return await userService.getUserByEmail(email);
  }

  async getUserByUsername(username: string) {
    return await userService.getUserByUsername(username);
  }

  async getUserByAuthId(authId: string) {
    return await userService.getUserByAuthId(authId);
  }

  async createUser(user: any) {
    return await userService.createUser(user);
  }

  async updateUser(id: number, updates: any) {
    return await userService.updateUser(id, updates);
  }

  async getAllUsers() {
    return await userService.getAllUsers();
  }

  // ===== DEPARTMENT OPERATIONS =====
  async getDepartment(id: number): Promise<any | undefined> {
    return await departmentService.getDepartmentById(id.toString());
  }

  async getDepartments(): Promise<any[]> {
    return await departmentService.getAllDepartments();
  }

  async getAllDepartments(): Promise<any[]> {
    return await departmentService.getAllDepartments();
  }

  async createDepartment(department: any): Promise<any> {
    return await departmentService.createDepartment(department);
  }

  // ===== CHARACTER OPERATIONS =====
  async getCharactersByOwner(ownerId: number) {
    return await characterService.getCharactersByOwner(ownerId);
  }

  async createCharacter(character: any) {
    return await characterService.createCharacter(character);
  }

  // ===== APPLICATION OPERATIONS =====
  async getApplication(id: number): Promise<any | undefined> {
    return await applicationService.getApplicationById(id.toString());
  }

  async getApplicationsByUser(userId: number): Promise<any[]> {
    return await applicationService.getApplicationsByUser(userId.toString());
  }

  async getAllApplications(): Promise<any[]> {
    return await applicationService.getAllApplications();
  }

  async createApplication(application: any): Promise<any> {
    return await applicationService.createApplication(application);
  }

  async updateApplication(id: number, updates: any): Promise<any | undefined> {
    return await applicationService.updateApplication(id.toString(), updates);
  }

  async getApplicationsByType(type: string): Promise<any[]> {
    return await applicationService.getAllApplications();
  }

  // ===== REPORT OPERATIONS =====
  async getReport(id: number) {
    return await reportService.getReport(id);
  }

  async getReportsByUser(userId: number) {
    return await reportService.getReportsByUser(userId);
  }

  async getAllReports() {
    return await reportService.getAllReports();
  }

  async createReport(report: any) {
    return await reportService.createReport(report);
  }

  async updateReport(id: number, updates: any) {
    return await reportService.updateReport(id, updates);
  }

  // ===== NOTIFICATION OPERATIONS =====
  async getNotificationsByUser(userId: number): Promise<any[]> {
    return await notificationService.getNotificationsByUser(userId.toString());
  }

  async createNotification(notification: any): Promise<any> {
    return await notificationService.createNotification(notification);
  }

  async markNotificationAsRead(id: number): Promise<any | undefined> {
    return await notificationService.updateNotification(id.toString(), { isRead: true });
  }

  async getNotification(id: number): Promise<any | undefined> {
    return await notificationService.getNotificationById(id.toString());
  }

  async markAllNotificationsAsRead(userId: number): Promise<any[]> {
    // Временно возвращаем пустой массив, так как метод не существует
    return [];
  }

  async deleteNotification(id: number): Promise<void> {
    await notificationService.deleteNotification(id.toString());
  }

  // ===== SUPPORT TICKET OPERATIONS =====
  async getSupportTicket(id: number): Promise<any | undefined> {
    return await supportTicketService.getTicketById(id.toString());
  }

  async getSupportTicketsByUser(userId: number): Promise<any[]> {
    return await supportTicketService.getTicketsByUser(userId.toString());
  }

  async getAllSupportTickets(): Promise<any[]> {
    return await supportTicketService.getAllTickets();
  }

  async createSupportTicket(ticket: any): Promise<any> {
    return await supportTicketService.createTicket(ticket);
  }

  async updateSupportTicket(id: number, updates: any): Promise<any | undefined> {
    return await supportTicketService.updateTicket(id.toString(), updates);
  }

  // ===== CALL 911 OPERATIONS =====
  async getCall911(id: number): Promise<any | undefined> {
    return await call911Service.getCallById(id.toString());
  }

  async getCalls911ByUser(userId: number): Promise<any[]> {
    return await call911Service.getAllCalls();
  }

  async getAllCalls911(): Promise<any[]> {
    return await call911Service.getAllCalls();
  }

  async createCall911(call: any): Promise<any> {
    return await call911Service.createCall(call);
  }

  async updateCall911(id: number, updates: any): Promise<any | undefined> {
    return await call911Service.updateCall(id.toString(), updates);
  }

  // ===== VEHICLE OPERATIONS =====
  async getVehicle(id: number): Promise<any | undefined> {
    return await vehicleService.getVehicleById(id.toString());
  }

  async getVehiclesByOwner(ownerId: number): Promise<any[]> {
    return await vehicleService.getVehiclesByOwnerName(ownerId.toString());
  }

  async getAllVehicles(): Promise<any[]> {
    return await vehicleService.getAllVehicles();
  }

  async createVehicle(vehicle: any): Promise<any> {
    return await vehicleService.createVehicle(vehicle);
  }

  async updateVehicle(id: number, updates: any): Promise<any | undefined> {
    return await vehicleService.updateVehicle(id.toString(), updates);
  }

  // ===== WEAPON OPERATIONS =====
  async getWeapon(id: number): Promise<any | undefined> {
    return await weaponService.getWeaponById(id.toString());
  }

  async getWeaponsByOwner(ownerId: number): Promise<any[]> {
    return await weaponService.getWeaponsByOwnerName(ownerId.toString());
  }

  async getAllWeapons(): Promise<any[]> {
    return await weaponService.getAllWeapons();
  }

  async createWeapon(weapon: any): Promise<any> {
    return await weaponService.createWeapon(weapon);
  }

  async updateWeapon(id: number, updates: any): Promise<any | undefined> {
    return await weaponService.updateWeapon(id.toString(), updates);
  }

  // ===== COMPLAINT OPERATIONS =====
  async getComplaint(id: number): Promise<any | undefined> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async getComplaintsByUser(userId: number): Promise<any[]> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async getAllComplaints(): Promise<any[]> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async createComplaint(complaint: any): Promise<any> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  async updateComplaint(id: number, updates: any): Promise<any | undefined> {
    // TODO: Создать ComplaintService
    throw new Error('Complaint operations not implemented yet');
  }

  // ===== TEST OPERATIONS =====
  async getTest(id: number): Promise<any | undefined> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getAllTests(): Promise<any[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async createTest(test: any): Promise<any> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== TEST SESSION OPERATIONS =====
  async createTestSession(session: any): Promise<any> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getActiveTestSession(userId: number, testId: number): Promise<any | undefined> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async updateTestSession(id: number, updates: any): Promise<any | undefined> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== TEST RESULT OPERATIONS =====
  async createTestResult(result: any): Promise<any> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getTestAttempts(userId: number, testId: number): Promise<any[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  async getTestResults(userId: number, testId: number): Promise<any[]> {
    // TODO: Создать TestService
    throw new Error('Test operations not implemented yet');
  }

  // ===== AUTH OPERATIONS =====
  async validatePassword(password: string, hash: string) {
    return await userService.validatePassword(password, hash);
  }

  async hashPassword(password: string) {
    return await userService.hashPassword(password);
  }
}

// Экспортируем адаптер для совместимости
export const storage: IStorage = new StorageAdapter();
