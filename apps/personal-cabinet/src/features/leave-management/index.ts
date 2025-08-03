export const LeaveManagementFeature = {
  MyLeaves: () => import('./ui/my-leaves').then(m => m.MyLeaves),
  NewRequest: () => import('./ui/new-request').then(m => m.NewRequest),
  History: () => import('./ui/history').then(m => m.History)
} 