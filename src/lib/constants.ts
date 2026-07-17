import type { DemoAccount, NavItem } from '@/types';

export const APP_NAME = 'سامانه خودمراقبتی';
export const APP_TAGLINE = 'پلتفرم دیجیتال سلامت برای شهروندان';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'خانه', path: '/', icon: 'Home' },
  { id: 'health-record', label: 'پرونده سلامت', path: '/health-record', icon: 'FileHeart' },
  { id: 'appointments', label: 'نوبت‌ها', path: '/appointments', icon: 'Calendar' },
  { id: 'screenings', label: 'خودارزیابی', path: '/screenings', icon: 'ClipboardCheck' },
  { id: 'reminders', label: 'یادآوری‌ها', path: '/reminders', icon: 'Bell' },
  { id: 'centers', label: 'مراکز نزدیک', path: '/centers', icon: 'MapPin' },
  { id: 'education', label: 'آموزش سلامت', path: '/education', icon: 'BookOpen' },
  { id: 'assistant', label: 'دستیار سلامت', path: '/assistant', icon: 'Bot' },
  { id: 'family', label: 'خانواده من', path: '/family', icon: 'Users' },
  { id: 'profile', label: 'پروفایل و تنظیمات', path: '/profile', icon: 'Settings' },
];

/** Phrases that trigger emergency escalation in the AI health assistant. */
export const EMERGENCY_PHRASES: string[] = [
  'درد قفسه سینه',
  'تنگی نفس شدید',
  'از هوش رفتن',
  'تشنج',
  'خونریزی شدید',
  'سکته',
  'حمله قلبی',
  'فکر خودکشی',
  'می‌خواهم خودم را بکشم',
  'بی‌حسی یک طرف بدن',
  'درد شدید شکم',
  'تب بالای ۴۰',
  'مسمومیت',
  'تصادف',
  'سوختگی شدید',
  'افت فشار ناگهانی',
  'تپش قلب نامنظم',
  'کاهش بینایی ناگهانی',
  'سردرد شدید ناگهانی',
  'شکستگی',
];

export const EMERGENCY_RESPONSE =
  '⚠️ این علائم ممکن است نیازمند مراقبت فوری باشد. لطفاً فوراً با اورژانس ۱۱۵ تماس بگیرید یا به نزدیک‌ترین مرکز درمانی مراجعه کنید.';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'sara.mohammadi@demo.selfcare.ir',
    password: 'Demo@1404',
    role: 'citizen',
    profileId: 'p-citizen-1',
    label: 'سارا محمدی — شهروند',
  },
  {
    email: 'dr.rezaei@demo.selfcare.ir',
    password: 'Demo@1404',
    role: 'care_team',
    profileId: 'p-careteam-1',
    label: 'دکتر علی رضایی — تیم مراقبت',
  },
  {
    email: 'admin@demo.selfcare.ir',
    password: 'Admin@1404',
    role: 'admin',
    profileId: 'p-admin-1',
    label: 'مدیر سامانه',
  },
];

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  nutrition: 'تغذیه',
  physical_activity: 'فعالیت بدنی',
  mental_health: 'سلامت روان',
  chronic_disease: 'بیماری‌های مزمن',
  maternal_health: 'سلامت مادر و کودک',
  child_health: 'سلامت کودک',
  preventive_care: 'مراقبت پیشگیرانه',
  medication_safety: 'ایمنی دارویی',
  emergency_preparedness: 'آمادگی اضطراری',
  dental_health: 'سلامت دهان و دندان',
};

export const CENTER_CATEGORY_LABELS: Record<string, string> = {
  hospital: 'بیمارستان',
  clinic: 'کلینیک',
  pharmacy: 'داروخانه',
  laboratory: 'آزمایشگاه',
  imaging: 'مرکز تصویربرداری',
  dental: 'دندانپزشکی',
  rehabilitation: 'توانبخشی',
  mental_health: 'سلامت روان',
  maternal: 'مادر و کودک',
  emergency: 'اورژانس',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  low: 'کم',
  moderate: 'متوسط',
  high: 'بالا',
  critical: 'بحرانی',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  self_reported: 'گزارش شخصی',
  pending_review: 'در انتظار بررسی',
  verified: 'تأیید شده',
  rejected: 'رد شده',
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  user_entered: 'ثبت توسط کاربر',
  care_team: 'تیم مراقبت',
  integrated_system: 'سامانه یکپارچه',
  imported_document: 'بارگذاری سند',
};

export const APPOINTMENT_MODE_LABELS: Record<string, string> = {
  in_person: 'حضوری',
  video: 'ویدئویی',
  phone: 'تلفنی',
  home_care: 'مراقبت در منزل',
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FAMILY_MEMBERS = 6;

/** Tehran center coordinates for map defaults */
export const DEFAULT_MAP_CENTER = {
  latitude: 35.6892,
  longitude: 51.389,
  zoom: 12,
};

/** National emergency numbers */
export const EMERGENCY_NUMBERS = {
  ambulance: '115',
  fire: '125',
  police: '110',
  mentalHealth: '1480',
};
