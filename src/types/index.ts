// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type SourceType =
  | 'user_entered'
  | 'care_team'
  | 'integrated_system'
  | 'imported_document';

export type VerificationStatus =
  | 'self_reported'
  | 'pending_review'
  | 'verified'
  | 'rejected';

export type UserRole = 'citizen' | 'care_team' | 'admin' | 'provider';

export type AppointmentMode = 'in_person' | 'video' | 'phone' | 'home_care';

export type ReminderType =
  | 'medication'
  | 'appointment'
  | 'screening'
  | 'lab_followup'
  | 'vaccination'
  | 'custom';

export type CenterCategory =
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | 'laboratory'
  | 'imaging'
  | 'dental'
  | 'rehabilitation'
  | 'mental_health'
  | 'maternal'
  | 'emergency';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type RecordStatus =
  | 'active'
  | 'resolved'
  | 'inactive'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'pending';

export type Gender = 'male' | 'female' | 'other';

export type BloodType =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'unknown';

export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'guardian'
  | 'other';

export type ConsentScope =
  | 'full_record'
  | 'medications'
  | 'appointments'
  | 'lab_results'
  | 'emergency_only';

export type NotificationType =
  | 'appointment'
  | 'reminder'
  | 'lab_result'
  | 'message'
  | 'system'
  | 'screening'
  | 'consent';

export type MessagePriority = 'normal' | 'urgent' | 'emergency';

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'verify'
  | 'reject'
  | 'export'
  | 'login'
  | 'logout';

export type ArticleCategory =
  | 'nutrition'
  | 'physical_activity'
  | 'mental_health'
  | 'chronic_disease'
  | 'maternal_health'
  | 'child_health'
  | 'preventive_care'
  | 'medication_safety'
  | 'emergency_preparedness'
  | 'dental_health';

export type ScreeningCategory =
  | 'bmi'
  | 'cardiovascular'
  | 'diabetes'
  | 'mental_health'
  | 'sleep'
  | 'nutrition'
  | 'activity'
  | 'gestational_diabetes';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'scale'
  | 'boolean'
  | 'text';

export type LabResultFlag = 'normal' | 'low' | 'high' | 'critical';

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export type ImmunizationRoute =
  | 'intramuscular'
  | 'oral'
  | 'subcutaneous'
  | 'intradermal'
  | 'nasal';

export type ImagingModality =
  | 'xray'
  | 'ultrasound'
  | 'mri'
  | 'ct'
  | 'mammography'
  | 'dexa';

export type DayOfWeek =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

// ─── Base Types ───────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordBase extends BaseEntity {
  patientId: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  createdBy: string;
  verifiedBy?: string;
  title: string;
  date: string;
  status: RecordStatus;
  provider?: string;
  attachment?: string;
  lastUpdate: string;
  notes?: string;
}

export interface Address {
  province: string;
  city: string;
  district?: string;
  street?: string;
  postalCode?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  specialty?: string;
  organization?: string;
  licenseNumber?: string;
}

export interface OperatingHours {
  day: DayOfWeek;
  open: string;
  close: string;
  isClosed?: boolean;
}

// ─── User & Profile ─────────────────────────────────────────────────────────────

export interface Profile extends BaseEntity {
  userId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string;
  birthDate: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  avatarUrl?: string;
  address: Address;
  bloodType?: BloodType;
  emergencyContact?: EmergencyContact;
  preferredLanguage: 'fa' | 'en';
  isActive: boolean;
}

export interface FamilyMember extends BaseEntity {
  ownerId: string;
  patientId: string;
  relationship: RelationshipType;
  relationshipLabel: string;
  profile: Profile;
  hasConsent: boolean;
  consentId?: string;
}

export interface Consent extends BaseEntity {
  ownerId: string;
  granteeId: string;
  granteeName: string;
  patientId: string;
  scope: ConsentScope;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  revokedAt?: string;
}

// ─── Health Records ───────────────────────────────────────────────────────────

export interface Condition extends MedicalRecordBase {
  icd10Code?: string;
  severity?: RiskLevel;
  onsetDate?: string;
  resolvedDate?: string;
  isChronic: boolean;
  description?: string;
}

export interface Medication extends MedicalRecordBase {
  genericName: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  refillsRemaining?: number;
  instructions?: string;
  isOngoing: boolean;
}

export interface Allergy extends MedicalRecordBase {
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  onsetDate?: string;
  verifiedDate?: string;
}

export interface Immunization extends MedicalRecordBase {
  vaccineName: string;
  doseNumber?: number;
  lotNumber?: string;
  site?: string;
  route: ImmunizationRoute;
  administeredBy?: string;
  nextDueDate?: string;
}

export interface Observation extends MedicalRecordBase {
  category: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  interpretation?: LabResultFlag;
}

export interface LabResult extends MedicalRecordBase {
  testName: string;
  testCode?: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  flag?: LabResultFlag;
  labName?: string;
  orderedBy?: string;
  specimenType?: string;
}

export interface ImagingRecord extends MedicalRecordBase {
  modality: ImagingModality;
  bodyPart: string;
  findings?: string;
  impression?: string;
  radiologist?: string;
  facility?: string;
}

export interface DentalRecord extends MedicalRecordBase {
  procedure: string;
  toothNumber?: string;
  dentist?: string;
  nextVisitDate?: string;
}

export interface HealthDocument extends MedicalRecordBase {
  documentType: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  description?: string;
}

// ─── Screenings ─────────────────────────────────────────────────────────────────

export interface ScreeningQuestionOption {
  id: string;
  label: string;
  value: number | string | boolean;
}

export interface ScreeningQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: ScreeningQuestionOption[];
  min?: number;
  max?: number;
  unit?: string;
  helpText?: string;
  dependsOn?: { questionId: string; value: string | number | boolean };
}

export interface ScreeningScoreRange {
  min: number;
  max: number;
  riskLevel: RiskLevel;
  label: string;
  recommendation: string;
}

export interface Screening extends BaseEntity {
  slug: string;
  category: ScreeningCategory;
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: ScreeningQuestion[];
  scoreRanges?: ScreeningScoreRange[];
  isActive: boolean;
  targetAudience?: string;
  disclaimer?: string;
}

export interface ScreeningAnswer {
  questionId: string;
  value: number | string | boolean | string[];
}

export interface ScreeningResult extends BaseEntity {
  patientId: string;
  screeningId: string;
  screeningTitle: string;
  answers: ScreeningAnswer[];
  score?: number;
  riskLevel?: RiskLevel;
  summary: string;
  recommendations: string[];
  completedAt: string;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
}

// ─── Appointments & Reminders ───────────────────────────────────────────────────

export interface Appointment extends BaseEntity {
  patientId: string;
  title: string;
  description?: string;
  providerId?: string;
  providerName: string;
  specialty?: string;
  centerId?: string;
  centerName?: string;
  mode: AppointmentMode;
  scheduledAt: string;
  durationMinutes: number;
  status: RecordStatus;
  location?: string;
  notes?: string;
  reminderSent?: boolean;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
}

export interface Reminder extends BaseEntity {
  patientId: string;
  type: ReminderType;
  title: string;
  description?: string;
  scheduledAt: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  isCompleted: boolean;
  completedAt?: string;
  relatedRecordId?: string;
  relatedRecordType?: string;
}

// ─── Health Centers & Services ──────────────────────────────────────────────────

export interface HealthService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isAvailable: boolean;
}

export interface HealthCenter extends BaseEntity {
  name: string;
  category: CenterCategory;
  description?: string;
  phone: string;
  email?: string;
  website?: string;
  address: Address;
  latitude: number;
  longitude: number;
  operatingHours: OperatingHours[];
  services: HealthService[];
  rating?: number;
  reviewCount?: number;
  isEmergency?: boolean;
  acceptsInsurance?: boolean;
  imageUrl?: string;
}

// ─── Education ──────────────────────────────────────────────────────────────────

export interface EducationalArticle extends BaseEntity {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  categoryLabel: string;
  author: string;
  readTimeMinutes: number;
  tags: string[];
  imageUrl?: string;
  isFeatured: boolean;
  publishedAt: string;
}

// ─── Notifications & Messages ───────────────────────────────────────────────────

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  relatedId?: string;
}

export interface HealthMessage extends BaseEntity {
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  priority: MessagePriority;
  isRead: boolean;
  readAt?: string;
  threadId?: string;
  attachments?: Attachment[];
}

// ─── Care Team ──────────────────────────────────────────────────────────────────

export interface CareTeamMember extends BaseEntity {
  providerId: string;
  patientId: string;
  providerName: string;
  specialty: string;
  organization: string;
  role: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  assignedAt: string;
}

// ─── Audit ──────────────────────────────────────────────────────────────────────

export interface AuditEvent extends BaseEntity {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// ─── Aggregates ─────────────────────────────────────────────────────────────────

export interface PatientHealthSummary {
  patientId: string;
  conditions: Condition[];
  medications: Medication[];
  allergies: Allergy[];
  immunizations: Immunization[];
  observations: Observation[];
  labResults: LabResult[];
  imagingRecords: ImagingRecord[];
  dentalRecords: DentalRecord[];
  documents: HealthDocument[];
}

export interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  profileId: string;
  label: string;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
}
