export { EntryApplicationModal } from './ui/entry-application-modal'
export { ApplicationForm } from './ui/application-form'
export { MyApplications } from './ui/my-applications'

// Feature object for lazy loading
export const EntryApplicationFeature = {
  ApplicationForm: () => import('./ui/application-form').then(m => ({ default: m.ApplicationForm })),
  MyApplications: () => import('./ui/my-applications').then(m => ({ default: m.MyApplications })),
  EntryApplicationModal: () => import('./ui/entry-application-modal').then(m => ({ default: m.EntryApplicationModal }))
} 