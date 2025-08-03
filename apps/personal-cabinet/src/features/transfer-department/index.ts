export const TransferDepartmentFeature = {
  TransferForm: () => import('./ui/transfer-form').then(m => m.TransferForm),
  MyRequests: () => import('./ui/my-requests').then(m => m.MyRequests)
} 