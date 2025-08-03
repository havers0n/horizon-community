export const EntryApplicationFeature = {
  ApplicationForm: () => import('./ui/application-form').then(m => m.ApplicationForm),
  MyApplications: () => import('./ui/my-applications').then(m => m.MyApplications)
} 