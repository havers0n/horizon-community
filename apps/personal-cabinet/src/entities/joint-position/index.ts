// Экспорт типов
export type { JointPositionStatus, JointPositionStatusConfig } from './model/types';
export { JOINT_POSITION_STATUS_CONFIG, formatCreatedAt } from './model/types';

// Экспорт типов из API
export type { CreateJointPositionRequestDto } from '../../shared/api/cabinet-service';

// Экспорт API хуков
export { 
  useAvailableJointDepartments,
  useMyJointPositionRequests,
  useCreateJointPositionRequest,
  JOINT_POSITION_KEYS
} from './api/hooks';