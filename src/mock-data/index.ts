/**
 * Mock data barrel export — data backbone for سامانه خودمراقبتی MVP
 */

// Profiles & family
export {
  adminProfile,
  allProfiles,
  careTeamProfile,
  childProfile,
  citizenProfile,
  consents,
  familyMembers,
  motherProfile,
  profilesById,
  spouseProfile,
} from './profiles';

// Health records (EHR)
export {
  allergies,
  conditions,
  dentalRecords,
  healthDocuments,
  healthRecordsByPatient,
  imagingRecords,
  immunizations,
  labResults,
  medications,
  observations,
} from './health-records';

// Appointments & reminders
export {
  appointments,
  appointmentsByPatient,
  upcomingAppointments,
} from './appointments';

export {
  activeReminders,
  reminders,
  remindersByPatient,
} from './reminders';

// Care team
export {
  careTeamByPatient,
  careTeamMembers,
  primaryCareProvider,
} from './care-team';

// Health centers
export {
  centersByCategory,
  healthCenters,
  nearestCenters,
} from './centers';

// Education
export {
  articleBySlug,
  articlesByCategory,
  educationalArticles,
  featuredArticles,
} from './education';

// Notifications & messages
export {
  notifications,
  notificationsByUser,
  unreadCount,
  unreadNotifications,
} from './notifications';

export {
  healthMessages,
  messagesByThread,
  messagesByUser,
  unreadMessages,
} from './messages';

// Screenings
export {
  calculateBMI,
  getBMIRiskLevel,
  screeningBySlug,
  screeningResults,
  screeningResultsByPatient,
  screenings,
} from './screenings';

// Re-export types for convenience
export type * from '@/types';
