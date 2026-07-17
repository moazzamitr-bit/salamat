import { clsx, type ClassValue } from 'clsx';
import { format as formatJalali, parseISO } from 'date-fns-jalali';
import { twMerge } from 'tailwind-merge';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convert Western digits (0-9) to Persian digits (۰-۹). */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

/** Convert Persian/Arabic-Indic digits to Western digits (0-9). */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (char) => String(PERSIAN_DIGITS.indexOf(char as (typeof PERSIAN_DIGITS)[number])))
    .replace(/[٠-٩]/g, (char) => {
      const arabicIndex = '٠١٢٣٤٥٦٧٨٩'.indexOf(char);
      return arabicIndex >= 0 ? String(arabicIndex) : char;
    });
}

export type PersianDateFormat = 'short' | 'medium' | 'long' | 'datetime' | 'time';

const JALALI_FORMATS: Record<PersianDateFormat, string> = {
  short: 'yyyy/MM/dd',
  medium: 'd MMMM yyyy',
  long: 'EEEE، d MMMM yyyy',
  datetime: 'd MMMM yyyy، HH:mm',
  time: 'HH:mm',
};

/**
 * Format an ISO date string or Date object as a Jalali (Persian) date.
 * Output digits are converted to Persian numerals by default.
 */
export function formatPersianDate(
  date: string | Date,
  format: PersianDateFormat = 'medium',
  usePersianDigits = true,
): string {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  const formatted = formatJalali(parsed, JALALI_FORMATS[format]);
  return usePersianDigits ? toPersianDigits(formatted) : formatted;
}

/** Format a number with Persian digit grouping (e.g. 1,234 → ۱٬۲۳۴). */
export function formatPersianNumber(value: number, locale = 'fa-IR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Calculate age in years from an ISO birth date. */
export function calculateAge(birthDate: string, referenceDate = new Date()): number {
  const birth = parseISO(birthDate);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Truncate Persian/English text with ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/** Generate a relative time label in Persian (simplified). */
export function relativeTimePersian(isoDate: string): string {
  const diffMs = Date.now() - parseISO(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return 'همین الان';
  if (minutes < 60) return `${toPersianDigits(minutes)} دقیقه پیش`;
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  if (days < 30) return `${toPersianDigits(days)} روز پیش`;
  return formatPersianDate(isoDate, 'short');
}
