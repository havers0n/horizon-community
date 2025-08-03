export const JointPositionsFeature = {
  AvailablePositions: () => import('./ui/available-positions').then(m => m.AvailablePositions),
  MyApplications: () => import('./ui/my-applications').then(m => m.MyApplications),
  CreatePosition: () => import('./ui/create-position').then(m => m.CreatePosition)
} 