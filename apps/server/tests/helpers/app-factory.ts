import express from 'express';
import { createV1Router } from '../../src/api/routes/v1';
import { ApplicationService } from '../../src/core/services/ApplicationService';
import { AuthService } from '../../src/core/services/AuthService';
import { CabinetService } from '../../src/core/services/CabinetService';
import { CharacterService } from '../../src/core/services/CharacterService';
import { LoggerService } from '../../src/core/services/LoggerService';
import { ReportService } from '../../src/core/services/ReportService';
import { TestService } from '../../src/core/services/TestService';
import { PublicService } from '../../src/core/services/PublicService';
import { ReportTemplateService } from '../../src/core/services/ReportTemplateService';
import { RealTimeService } from '../../src/core/services/RealTimeService';
import { MDTService } from '../../src/core/services/MDTService';
import { CacheService } from '../../src/core/services/CacheService';
import { FilledReportService } from '../../src/core/services/FilledReportService';
import { SupportTicketService } from '../../src/core/services/SupportTicketService';
import { Call911Service } from '../../src/core/services/Call911Service';
import { DepartmentService } from '../../src/core/services/DepartmentService';
import type { ServicesContainer } from '../../src/types/services';
import { errorHandler } from '../../src/utils/error-handler';
import { createClient } from '@supabase/supabase-js';

// Мокируем все сервисы, которые используются в роутах
jest.mock('../../src/core/services/DepartmentService');
jest.mock('../../src/core/services/ApplicationService');
jest.mock('../../src/core/services/AuthService');
jest.mock('../../src/core/services/CabinetService');
jest.mock('../../src/core/services/CharacterService');
jest.mock('../../src/core/services/LoggerService');
jest.mock('../../src/core/services/ReportService');
jest.mock('../../src/core/services/TestService');
jest.mock('../../src/core/services/PublicService');
jest.mock('../../src/core/services/ReportTemplateService');
jest.mock('../../src/core/services/RealTimeService');
jest.mock('../../src/core/services/MDTService');
jest.mock('../../src/core/services/CacheService');
jest.mock('../../src/core/services/FilledReportService');
jest.mock('../../src/core/services/SupportTicketService');
jest.mock('../../src/core/services/Call911Service');
jest.mock('@supabase/supabase-js');

export function createTestApp() {
  const app = express();
  app.use(express.json());

  const mockSupabaseClient = createClient('http://localhost:54321', 'test-key');

  // Создаем моки сервисов с правильными конструкторами
  const applicationService = new ApplicationService() as jest.Mocked<ApplicationService>;
  const reportService = new ReportService() as jest.Mocked<ReportService>;
  const reportTemplateService = new ReportTemplateService() as jest.Mocked<ReportTemplateService>;

  const services: ServicesContainer = {
    applicationService,
    reportService,
    reportTemplateService,
    authService: new AuthService() as jest.Mocked<AuthService>,
    cabinetService: new CabinetService(mockSupabaseClient, applicationService, reportService) as jest.Mocked<CabinetService>,
    characterService: new CharacterService() as jest.Mocked<CharacterService>,
    loggerService: new LoggerService() as jest.Mocked<LoggerService>,
    testService: new TestService() as jest.Mocked<TestService>,
    publicService: new PublicService() as jest.Mocked<PublicService>,
    realTimeService: new RealTimeService() as jest.Mocked<RealTimeService>,
    mdtService: new MDTService() as jest.Mocked<MDTService>,
    cacheService: new CacheService() as jest.Mocked<CacheService>,
    filledReportService: new FilledReportService(reportService, reportTemplateService) as jest.Mocked<FilledReportService>,
    supportTicketService: new SupportTicketService() as jest.Mocked<SupportTicketService>,
    call911Service: new Call911Service() as jest.Mocked<Call911Service>,
    departmentService: new DepartmentService() as jest.Mocked<DepartmentService>,
  };

  // Подключаем реальный роутер v1
  const v1Router = createV1Router(services);
  app.use('/api/v1', v1Router);

  // Подключаем обработчик ошибок
  app.use(errorHandler);

  return { app, services };
}
