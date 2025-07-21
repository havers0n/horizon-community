
export enum Department {
  PD = 'Police Department',
  FD = 'Fire Department',
  DD = 'Dispatch Department',
  CD = 'Civilian Department'
}

export enum RequestStatus {
  SENT = 'Отправлено',
  REVIEWING = 'На рассмотрении',
  APPROVED = 'Одобрено',
  REJECTED = 'Отклонено'
}

export interface User {
  id: number;
  name: string;
  department: Department;
  isSupervisor: boolean;
}

export interface TransferRequest {
  id: number;
  userId: number;
  fromDepartment: Department;
  toDepartment: Department;
  reason: string;
  documentationRead: boolean;
  status: RequestStatus;
  submissionDate: Date;
  decisionDate?: Date;
  supervisorComment?: string;
}
