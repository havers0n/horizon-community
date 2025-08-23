// Re-export API hooks
export { 
  useAvailableTransferDepartments,
  useMyTransferRequests,
  useCreateTransferRequest,
  TRANSFER_REQUEST_KEYS
} from './api/hooks';

// Re-export model types and utilities
export type { 
  TransferRequest, 
  AvailableTransferDepartment, 
  CreateTransferRequestDto,
  TransferRequestStatus,
  TransferRequestStatusConfig
} from './model/types';

export { 
  formatTransferRequestStatus,
  formatDepartmentName,
  formatCreatedAt,
  TRANSFER_REQUEST_STATUS_CONFIG
} from './model/types';