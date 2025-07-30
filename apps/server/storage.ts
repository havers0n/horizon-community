import { IStorage, User, InsertUser, Department, InsertDepartment, Character, InsertCharacter, Application, InsertApplication, Report, InsertReport, Notification, InsertNotification, SupportTicket, InsertSupportTicket, Complaint, InsertComplaint, Test, InsertTest, TestSession, InsertTestSession, TestResult, InsertTestResult } from './types';
import { SupabaseStorage } from './services/SupabaseStorage';

// Используем SupabaseStorage вместо PgStorage
export const storage: IStorage = new SupabaseStorage();
