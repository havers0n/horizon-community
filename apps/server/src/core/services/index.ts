// Централизованное создание экземпляров сервисов
import { AuthService } from './AuthService';
import { ApplicationService } from './ApplicationService';
import { CharacterService } from './CharacterService';
import { SupportTicketService } from './SupportTicketService';
import { Call911Service } from './Call911Service';
import { ReportService } from './ReportService';
import { ReportTemplateService } from './ReportTemplateService';
import { MDTService } from './MDTService';
import { RealTimeService } from './RealTimeService';
import { TestService } from './TestService';
import { PublicService } from './PublicService';
import { LoggerService } from './LoggerService';
import { CacheService } from './CacheService';
import { FilledReportService } from './FilledReportService';

// Создаем экземпляры сервисов
export const authService = new AuthService();
export const applicationService = new ApplicationService();
export const characterService = new CharacterService();
export const supportTicketService = new SupportTicketService();
export const call911Service = new Call911Service();
export const reportService = new ReportService();
export const reportTemplateService = new ReportTemplateService();
export const mdtService = new MDTService();
export const realTimeService = new RealTimeService();
export const testService = new TestService();
export const publicService = new PublicService();
export const logger = new LoggerService();
export const cacheService = new CacheService();

// Создаем FilledReportService с зависимостями
export const filledReportService = new FilledReportService(
  reportService,
  reportTemplateService
);

// Экспортируем классы для возможности создания новых экземпляров
export {
  AuthService,
  ApplicationService,
  CharacterService,
  SupportTicketService,
  Call911Service,
  ReportService,
  ReportTemplateService,
  MDTService,
  RealTimeService,
  TestService,
  PublicService,
  LoggerService,
  CacheService,
  FilledReportService,
}; 