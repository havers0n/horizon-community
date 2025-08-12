// apps/server/src/core/services/index.ts

// Экспортируем классы сервисов
export { AuthService } from './AuthService';
export { CharacterService } from './CharacterService';
export { UserService } from './UserService';
export { ReportService } from './ReportService';
export { LoggerService } from './LoggerService';
export { CacheService } from './CacheService';
export { PublicService } from './PublicService';
export { RealTimeService } from './RealTimeService';
export { ApplicationService } from './ApplicationService';
export { Call911Service } from './Call911Service';
export { MDTService } from './MDTService';
export { SupportTicketService } from './SupportTicketService';
export { FilledReportService } from './FilledReportService';
export { ReportTemplateService } from './ReportTemplateService';

// Создаем экземпляры сервисов для использования в других частях приложения
import { AuthService } from './AuthService';
import { PublicService } from './PublicService';
import { RealTimeService } from './RealTimeService';
import { LoggerService } from './LoggerService';

// Экспортируем экземпляры сервисов (УДАЛЯЕМ characterService отсюда)
export const authService = new AuthService();
export const publicService = new PublicService();
export const realTimeService = new RealTimeService();
export const logger = new LoggerService(); 