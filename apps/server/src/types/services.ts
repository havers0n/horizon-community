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
