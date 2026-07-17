import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Building2,
  ChevronLeft,
  Eye,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { consents } from '@/mock-data/profiles'
import { careTeamByPatient } from '@/mock-data/care-team'
import { formatPersianDate } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const CONSENT_SCOPE_LABELS: Record<string, string> = {
  full_record: 'دسترسی کامل پرونده',
  medications: 'فقط داروها',
  appointments: 'فقط نوبت‌ها',
  lab_results: 'فقط آزمایش‌ها',
  emergency_only: 'فقط اورژانس',
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const [consentStates, setConsentStates] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(consents.map((c) => [c.id, c.isActive]))
  )
  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    labResults: true,
    messages: true,
    marketing: false,
  })
  const [privacy, setPrivacy] = useState({
    showProfile: false,
    shareAnalytics: true,
  })

  if (!user) {
    return (
      <div className="page-container">
        <EmptyState
          title="ورود لازم است"
          description="برای مشاهده پروفایل و تنظیمات ابتدا وارد سامانه شوید."
        />
      </div>
    )
  }

  const profile = user.profile
  const careTeam = careTeamByPatient(profile.id)
  const primaryProvider = careTeam.find((m) => m.isPrimary)
  const userConsents = consents.filter((c) => c.ownerId === profile.id)

  return (
    <div className="page-container">
      <PageHeader
        title="پروفایل و تنظیمات"
        subtitle="مدیریت اطلاعات شخصی، امنیت و حریم خصوصی"
      />

      <div className="space-y-6">
        <SettingsSection
          title="اطلاعات شخصی"
          description="نام، تاریخ تولد و اطلاعات هویتی"
          icon={<User className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>نام و نام خانوادگی</Label>
              <Input value={profile.fullName} disabled className="mt-1.5" />
            </div>
            <div>
              <Label>تاریخ تولد</Label>
              <Input
                value={formatPersianDate(profile.birthDate, 'medium')}
                disabled
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>جنسیت</Label>
              <Input
                value={profile.gender === 'female' ? 'زن' : profile.gender === 'male' ? 'مرد' : 'سایر'}
                disabled
                className="mt-1.5"
              />
            </div>
            {profile.bloodType && (
              <div>
                <Label>گروه خونی</Label>
                <Input value={profile.bloodType} disabled className="mt-1.5" />
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          title="اطلاعات تماس"
          icon={<Phone className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                موبایل
              </Label>
              <Input value={profile.phone} disabled className="mt-1.5" />
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                ایمیل
              </Label>
              <Input value={profile.email} disabled className="mt-1.5" dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                آدرس
              </Label>
              <Input
                value={[profile.address.city, profile.address.district, profile.address.street]
                  .filter(Boolean)
                  .join('، ')}
                disabled
                className="mt-1.5"
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="کد ملی"
          description="شناسه ملی — فقط نمایش (ویرایش از طریق احراز هویت)"
          icon={<Shield className="h-5 w-5" />}
        >
          <Input value={profile.nationalId} disabled className="max-w-xs" />
          <p className="mt-2 text-xs text-muted-foreground">
            کد ملی پس از تأیید اولیه قابل تغییر نیست.
          </p>
        </SettingsSection>

        <SettingsSection
          title="بیمه درمانی"
          icon={<Shield className="h-5 w-5" />}
        >
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="font-medium text-navy">بیمه تأمین اجتماعی</p>
            <p className="mt-1 text-sm text-muted-foreground">شماره دفترچه: ۱۲۳۴۵۶۷۸</p>
            <Badge variant="success" className="mt-2">
              فعال
            </Badge>
          </div>
        </SettingsSection>

        <SettingsSection
          title="مرکز سلامت"
          icon={<Building2 className="h-5 w-5" />}
        >
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="font-medium text-navy">کلینیک سلامت ولیعصر</p>
            <p className="mt-1 text-sm text-muted-foreground">
              خیابان ولیعصر، بالاتر از پارک ملت
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          title="تیم سلامت خانواده"
          icon={<Users className="h-5 w-5" />}
        >
          {careTeam.length === 0 ? (
            <p className="text-sm text-muted-foreground">تیم درمانی ثبت نشده است.</p>
          ) : (
            <ul className="space-y-3">
              {careTeam.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-navy">{member.providerName}</p>
                    <p className="text-sm text-muted-foreground">{member.specialty}</p>
                  </div>
                  {member.isPrimary && <Badge variant="secondary">اصلی</Badge>}
                </li>
              ))}
            </ul>
          )}
          {primaryProvider && (
            <p className="mt-3 text-xs text-muted-foreground">
              پزشک معالج اصلی: {primaryProvider.providerName}
            </p>
          )}
        </SettingsSection>

        <SettingsSection
          title="رمز عبور و امنیت"
          icon={<Lock className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <Button variant="outline">تغییر رمز عبور</Button>
            <Separator />
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
              <div>
                <p className="font-medium text-navy">احراز هویت دو مرحله‌ای (2FA)</p>
                <p className="text-sm text-muted-foreground">فعال‌سازی با پیامک — به‌زودی</p>
              </div>
              <Switch disabled checked={false} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="دسترسی‌های مجاز"
          description="افرادی که به پرونده شما دسترسی دارند"
          icon={<Eye className="h-5 w-5" />}
        >
          {userConsents.length === 0 ? (
            <p className="text-sm text-muted-foreground">دسترسی فعالی ثبت نشده.</p>
          ) : (
            <ul className="space-y-2">
              {userConsents.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <span>{c.granteeName}</span>
                  <Badge variant="outline">{CONSENT_SCOPE_LABELS[c.scope] ?? c.scope}</Badge>
                </li>
              ))}
            </ul>
          )}
        </SettingsSection>

        <SettingsSection
          title="مدیریت رضایت‌نامه‌ها"
          description="کنترل اشتراک‌گذاری پرونده با اعضای خانواده و ارائه‌دهندگان"
          icon={<Shield className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {userConsents.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-navy">{c.granteeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {CONSENT_SCOPE_LABELS[c.scope]}
                    {c.expiresAt && ` — انقضا: ${formatPersianDate(c.expiresAt, 'short')}`}
                  </p>
                </div>
                <Switch
                  checked={consentStates[c.id] ?? false}
                  onCheckedChange={(checked) =>
                    setConsentStates((prev) => ({ ...prev, [c.id]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="اعلان‌ها"
          icon={<Bell className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {(
              [
                ['appointments', 'نوبت‌ها'],
                ['reminders', 'یادآوری‌ها'],
                ['labResults', 'نتایج آزمایش'],
                ['messages', 'پیام‌ها'],
                ['marketing', 'اخبار و پیشنهادها'],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <Label htmlFor={`notif-${key}`} className="cursor-pointer">
                  {label}
                </Label>
                <Switch
                  id={`notif-${key}`}
                  checked={notifications[key]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="حریم خصوصی"
          icon={<Eye className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <Label htmlFor="privacy-profile" className="cursor-pointer">
                نمایش پروفایل برای تیم درمان
              </Label>
              <Switch
                id="privacy-profile"
                checked={privacy.showProfile}
                onCheckedChange={(checked) =>
                  setPrivacy((prev) => ({ ...prev, showProfile: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <Label htmlFor="privacy-analytics" className="cursor-pointer">
                اشتراک داده‌های ناشناس برای بهبود سامانه
              </Label>
              <Switch
                id="privacy-analytics"
                checked={privacy.shareAnalytics}
                onCheckedChange={(checked) =>
                  setPrivacy((prev) => ({ ...prev, shareAnalytics: checked }))
                }
              />
            </div>
          </div>
        </SettingsSection>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-navy">فعالیت حساب</p>
              <p className="text-sm text-muted-foreground">
                مشاهده تاریخچه دسترسی به پرونده سلامت
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/profile/access-history">
                تاریخچه دسترسی
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
