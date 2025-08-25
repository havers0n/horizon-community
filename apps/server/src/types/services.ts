// Типы для сервисов
import type { Request } from 'express';

// Импортируем типы сервисов
import type { AuthService } from '../core/services/AuthService';
import type { CharacterService } from '../core/services/CharacterService';
import type { ApplicationService } from '../core/services/ApplicationService';
import type { SupportTicketService } from '../core/services/SupportTicketService';
import type { Call911Service } from '../core/services/Call911Service';
import type { ReportService } from '../core/services/ReportService';
import type { ReportTemplateService } from '../core/services/ReportTemplateService';
import type { MDTService } from '../core/services/MDTService';
import type { RealTimeService } from '../core/services/RealTimeService';
import type { PublicService } from '../core/services/PublicService';
import type { LoggerService } from '../core/services/LoggerService';
import type { CacheService } from '../core/services/CacheService';
import type { FilledReportService } from '../core/services/FilledReportService';
import type { CabinetService } from '../core/services/CabinetService';
import type { DepartmentService } from '../core/services/DepartmentService';
import type { TestAdminService } from '../core/services/TestAdminService';
import type { TestSessionService } from '../core/services/TestSessionService';

// Leave request types
export interface CreateLeaveRequestDto {
  p_start_date: string; // date string 'YYYY-MM-DD'
  p_end_date: string;   // date string 'YYYY-MM-DD'
  p_reason: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status_code: string;
  status_name: string;
  created_at: string;
  updated_at: string;
  approver_id?: string;
  rejection_reason?: string;
  department_id?: string;
  users?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
  departments?: {
    name: string;
  };
  approver?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AdminLeaveRequestFilters {
  status?: string;
  department_id?: string;
  page?: number;
  limit?: number;
}

export interface LeaveRequest {
  id: string; // uuid
  start_date: string; // date string 'YYYY-MM-DD'
  end_date: string;   // date string 'YYYY-MM-DD'
  reason: string;
  created_at: string; // timestamp string
  status_name: string; // e.g., 'На рассмотрении', 'Одобрен', 'Отклонен'
  status_code: string; // e.g., 'in_review', 'approved', 'rejected'
  approver_full_name: string | null;
}

// Joint Position Request types
export interface CreateJointPositionRequestDto {
  p_secondary_department_id: string; // uuid
  p_reason: string;
}

export interface JointPositionRequest {
  id: string; // uuid
  user_id: string; // uuid
  secondary_department_id: string; // uuid
  reason: string;
  status_code: string; // e.g., 'pending', 'approved', 'rejected'
  status_name: string; // e.g., 'Ожидает рассмотрения', 'Одобрен', 'Отклонен'
  created_at: string; // timestamp string
  updated_at: string; // timestamp string
  approver_id?: string; // uuid
  rejection_reason?: string;
  // Related data
  secondary_department?: {
    id: string;
    name: string;
    code?: string;
  };
  approver?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

// Admin Transfer Request types
export interface AdminTransferRequest {
  id: string;
  created_at: string;
  reason: string;
  status_code: string;
  status_name: string;
  source_department_name: string;
  target_department_name: string;
  requester_full_name: string;
  approver_full_name: string | null;
  review_comment: string | null;
}

export interface AvailableDepartment {
  id: string; // uuid
  name: string;
  code?: string;
  description?: string;
  is_available_for_joint?: boolean;
}

// Transfer Request types
export interface CreateTransferRequestDto {
  p_target_department_id: string; // uuid
  p_reason: string;
}

export interface TransferRequest {
  id: string; // uuid
  user_id: string; // uuid
  target_department_id: string; // uuid
  reason: string;
  status_code: string; // e.g., 'pending', 'approved', 'rejected'
  status_name: string; // e.g., 'Ожидает рассмотрения', 'Одобрен', 'Отклонен'
  created_at: string; // timestamp string
  updated_at: string; // timestamp string
  approver_id?: string; // uuid
  rejection_reason?: string;
  // Related data
  target_department?: {
    id: string;
    name: string;
    code?: string;
  };
  approver?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AvailableTransferDepartment {
  id: string; // uuid
  name: string;
  code?: string;
  description?: string;
  is_available_for_transfer?: boolean;
}

// Complaint types
export interface CreateComplaintDto {
  p_incident_date: string; // timestamptz format
  p_title: string;
  p_type: string;
  p_participants: string[]; // Will be converted to JSONB
  p_description: string;
  p_evidence?: string;
}

export interface Complaint {
  id: string; // uuid
  user_id: string; // uuid
  incident_date: string; // timestamp string
  title: string;
  type: string;
  participants: string[]; // JSON array
  description: string;
  evidence?: string;
  status_code: string; // e.g., 'pending', 'under_review', 'resolved', 'closed'
  status_name: string; // e.g., 'Ожидает рассмотрения', 'На рассмотрении', 'Решена', 'Закрыта'
  created_at: string; // timestamp string
  updated_at: string; // timestamp string
  // Related data
  user?: {
    username: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Интерфейс для контейнера всех сервисов
 * Теперь все сервисы - это экземпляры, а не классы
 */
export interface ServicesContainer {
  // Сервисы-экземпляры
  authService: AuthService;
  characterService: CharacterService;
  applicationService: ApplicationService;
  supportTicketService: SupportTicketService;
  call911Service: Call911Service;
  reportService: ReportService;
  reportTemplateService: ReportTemplateService;
  realTimeService: RealTimeService;
  
  // Сервисы-классы (экземпляры)
  mdtService: MDTService;
  publicService: PublicService;
  loggerService: LoggerService;
  cacheService: CacheService;
  filledReportService: FilledReportService;
  cabinetService: CabinetService;
  departmentService: DepartmentService;
  // Новые строго-типизированные сервисы тестов
  testAdminService: TestAdminService;
  testSessionService: TestSessionService;
}

/**
 * Интерфейс для запроса с сервисами
 */
export interface RequestWithServices extends Request {
  services: ServicesContainer;
}

/**
 * Тип для фабричных функций роутеров
 * Каждый роутер экспортирует функцию, которая принимает нужные сервисы и возвращает router
 */
export type RouterFactory = (services: Partial<ServicesContainer>) => import('express').Router;
