import { IStorage, User, InsertUser, Department, InsertDepartment, Character, InsertCharacter, Application, InsertApplication, Report, InsertReport, Notification, InsertNotification, SupportTicket, InsertSupportTicket, Complaint, InsertComplaint, Test, InsertTest, TestSession, InsertTestSession, TestResult, InsertTestResult } from './types';
import { PgStorage } from './db/PgStorage';
import { pool } from './db/index';

// Use PgStorage with shared pool connection
export const storage: IStorage = new PgStorage(pool);
