// Model types and interfaces for admin reports
export interface ReportStats {
  totalReports: number
  pendingReports: number
  approvedReports: number
  rejectedReports: number
  averageProcessingTime: number
} 