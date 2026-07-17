import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Calendar,
  FileHeart,
  MessageSquare,
  Pill,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { SourceBadge } from '@/components/SourceBadge'
import { ServiceTile } from '@/components/ServiceTile'
import { useAuth } from '@/features/auth/AuthContext'
import {
  appointmentsByPatient,
  healthRecordsByPatient,
  healthMessages,
  remindersByPatient,
  screeningResultsByPatient,
  screenings,
} from '@/mock-data'
import { APPOINTMENT_MODE_LABELS } from '@/lib/constants'
import { cn, formatPersianDate, relativeTimePersian, toPersianDigits } from '@/lib/utils'
import type { MedicalRecordBase, Reminder } from '@/types'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'صبح بخیر'
  if (hour < 17) return 'ظهر بخیر'
  if (hour < 21) return 'عصر بخیر'
  return 'شب بخیر'
}

interface RecentUpdate {
  id: string
  title: string
  date: string
  lastUpdate: string
  sourceType: MedicalRecordBase['sourceType']
  verificationStatus: MedicalRecordBase['verificationStatus']
  provider?: string
}

export default function CitizenDashboard() {
  const { activePatientId, activePatientName, user, familyMembers, setActivePatient } =
    useAuth()

  const patientRecords = healthRecordsByPatient[activePatientId] ?? {
    conditions: [],
    medications: [],
    allergies: [],
    immunizations: [],
    observations: [],
    labResults: [],
    imagingRecords: [],
    dentalRecords: [],
    documents: [],
  }

  const patientAppointments = useMemo(
    () =>
      appointmentsByPatient(activePatientId)
        .filter((a) => a.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [activePatientId]
  )

  const nextAppointment = patientAppointments[0]

  const patientReminders = useMemo(
    () =>
      remindersByPatient(activePatientId)
        .filter((r) => !r.isCompleted)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [activePatientId]
  )

  const todayReminders = patientReminders.filter((r) => {
    const scheduled = new Date(r.scheduledAt)
    const now = new Date()
    return (
      scheduled.getFullYear() === now.getFullYear() &&
      scheduled.getMonth() === now.getMonth() &&
      scheduled.getDate() === now.getDate()
    )
  })

  const followUpReminders = patientReminders.filter(
    (r) => r.type === 'lab_followup' || r.type === 'screening'
  )

  const activeMedications = patientRecords.medications.filter(
    (m) => m.status === 'active' && m.isOngoing
  )

  const teamMessages = useMemo(
    () =>
      healthMessages
        .filter(
          (m) =>
            m.recipientId === activePatientId &&
            m.senderRole !== 'citizen' &&
            !m.isRead
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activePatientId]
  )

  const latestTeamMessage = teamMessages[0]

  const completedScreenings = screeningResultsByPatient(activePatientId)
  const pendingScreening = useMemo(() => {
    const completedIds = new Set(completedScreenings.map((r) => r.screeningId))
    const screeningReminder = patientReminders.find((r) => r.type === 'screening')
    const recommended = screenings.find(
      (s) => s.isActive && !completedIds.has(s.id) && s.category === 'cardiovascular'
    )
    return { reminder: screeningReminder, recommended }
  }, [completedScreenings, patientReminders])

  const recentUpdates = useMemo(() => {
    const allRecords: RecentUpdate[] = [
      ...patientRecords.conditions,
      ...patientRecords.medications,
      ...patientRecords.labResults,
      ...patientRecords.documents,
    ].map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      lastUpdate: r.lastUpdate,
      sourceType: r.sourceType,
      verificationStatus: r.verificationStatus,
      provider: r.provider,
    }))
    return allRecords
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
      .slice(0, 4)
  }, [patientRecords])

  const attentionItems = useMemo(() => {
    const items: { id: string; label: string; href: string; priority: 'high' | 'normal' }[] = []
    if (patientRecords.allergies.some((a) => a.severity === 'severe' || a.severity === 'life_threatening')) {
      items.push({ id: 'allergy', label: 'حساسیت شدید ثبت‌شده — مراقب باشید', href: '/health-record', priority: 'high' })
    }
    if (patientRecords.conditions.some((c) => c.verificationStatus === 'pending_review')) {
      items.push({ id: 'cond-pending', label: 'بیماری در انتظار تأیید تیم سلامت', href: '/health-record', priority: 'normal' })
    }
    if (followUpReminders.length > 0) {
      items.push({
        id: 'followup',
        label: `${toPersianDigits(followUpReminders.length)} پیگیری معوق`,
        href: '/reminders',
        priority: 'normal',
      })
    }
    if (pendingScreening.reminder) {
      items.push({
        id: 'screening',
        label: pendingScreening.reminder.title,
        href: '/screenings',
        priority: 'normal',
      })
    }
    return items
  }, [patientRecords, followUpReminders, pendingScreening])

  const selfCareScore = useMemo(() => {
    const totalReminders = remindersByPatient(activePatientId).length
    const completedCount = remindersByPatient(activePatientId).filter((r) => r.isCompleted).length
    const reminderScore = totalReminders > 0 ? (completedCount / totalReminders) * 40 : 20
    const screeningScore = completedScreenings.length > 0 ? 25 : 10
    const recordScore = recentUpdates.some((r) => r.verificationStatus === 'verified') ? 25 : 15
    const apptScore = nextAppointment ? 10 : 5
    return Math.min(100, Math.round(reminderScore + screeningScore + recordScore + apptScore))
  }, [activePatientId, completedScreenings, recentUpdates, nextAppointment])

  const activeConditions = patientRecords.conditions.filter((c) => c.status === 'active')
  const isViewingFamily = user && activePatientId !== user.profile.id

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        variant="hero"
        kicker="میز کار شهروند"
        title={`${getGreeting()}، ${activePatientName}`}
        subtitle="خلاصه وضعیت سلامت و کارهای امروز"
        actions={
          isViewingFamily ? (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              پرونده عضو خانواده
            </Badge>
          ) : undefined
        }
      />

      {attentionItems.length > 0 && (
        <Card variant="muted" className="mb-6 border border-warning/25 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">نیاز به توجه امروز</CardTitle>
            <CardDescription>مواردی که بهتر است زودتر بررسی شوند</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {attentionItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-white/70',
                      item.priority === 'high' && 'font-medium text-destructive'
                    )}
                  >
                    <span
                      className={cn(
                        'status-dot',
                        item.priority === 'high' ? 'bg-destructive' : 'bg-warning'
                      )}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {familyMembers.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <p className="me-2 text-sm font-medium text-navy">پرونده فعال:</p>
          <Button
            size="sm"
            variant={activePatientId === user?.profile.id ? 'default' : 'soft'}
            onClick={() => user && setActivePatient(user.profile.id)}
          >
            {user?.profile.fullName} (خودم)
          </Button>
          {familyMembers.map((member) => (
            <Button
              key={member.patientId}
              size="sm"
              variant={activePatientId === member.patientId ? 'default' : 'outline'}
              onClick={() => setActivePatient(member.patientId)}
            >
              {member.profile.fullName}
              <span className="text-xs opacity-75">({member.relationshipLabel})</span>
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card aria-labelledby="summary-heading">
            <CardHeader>
              <CardTitle id="summary-heading" className="text-lg">
                خلاصه سلامت
              </CardTitle>
              <CardDescription>
                وضعیت فعلی {activePatientName} — {toPersianDigits(activeConditions.length)} بیماری
                فعال، {toPersianDigits(activeMedications.length)} داروی جاری
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-2 p-4">
                  <h3 className="text-sm font-medium text-navy">بیماری‌های فعال</h3>
                  {activeConditions.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">موردی ثبت نشده</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {activeConditions.slice(0, 3).map((c) => (
                        <li key={c.id} className="text-sm">
                          <span>{c.title}</span>
                          {c.provider && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {c.provider}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl bg-surface-2 p-4">
                  <h3 className="text-sm font-medium text-navy">داروهای جاری</h3>
                  {activeMedications.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">موردی ثبت نشده</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {activeMedications.slice(0, 3).map((m) => (
                        <li key={m.id} className="text-sm">
                          <span>{m.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {m.frequency}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/health-record">
                    <FileHeart className="h-4 w-4" />
                    مشاهده پرونده کامل
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card aria-labelledby="today-heading">
            <CardHeader>
              <CardTitle id="today-heading" className="text-lg">
                کارهای امروز
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayReminders.length === 0 && !nextAppointment ? (
                <EmptyState
                  className="py-8"
                  title="کار فوری برای امروز ندارید"
                  description="یادآوری‌ها و نوبت‌های آینده در بخش‌های کناری نمایش داده می‌شوند."
                />
              ) : (
                <ul className="divide-y divide-border/80">
                  {todayReminders.map((r) => (
                    <ReminderRow key={r.id} reminder={r} />
                  ))}
                  {nextAppointment &&
                    new Date(nextAppointment.scheduledAt).toDateString() ===
                      new Date().toDateString() && (
                      <li className="py-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                          <div>
                            <p className="text-sm font-medium">{nextAppointment.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPersianDate(nextAppointment.scheduledAt, 'datetime')} —{' '}
                              {APPOINTMENT_MODE_LABELS[nextAppointment.mode]}
                            </p>
                          </div>
                        </div>
                      </li>
                    )}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card aria-labelledby="updates-heading">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle id="updates-heading" className="text-lg">
                  به‌روزرسانی‌های اخیر پرونده
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/health-record">همه</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentUpdates.length === 0 ? (
                <EmptyState
                  className="py-8"
                  title="به‌روزرسانی اخیری وجود ندارد"
                  description="سوابق پزشکی پس از ثبت یا تأیید در اینجا نمایش داده می‌شوند."
                />
              ) : (
                <ul className="divide-y divide-border/80">
                  {recentUpdates.map((item) => (
                    <li key={item.id} className="data-row">
                      <div>
                        <p className="text-sm font-medium text-navy">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPersianDate(item.date, 'medium')}
                          {item.provider && ` · ${item.provider}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-1 sm:items-end">
                        <SourceBadge
                          verificationStatus={item.verificationStatus}
                          sourceType={item.sourceType}
                          compact
                        />
                        <span className="text-xs text-muted-foreground">
                          {relativeTimePersian(item.lastUpdate)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card aria-labelledby="appt-heading">
            <CardHeader>
              <CardTitle id="appt-heading" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" aria-hidden />
                نوبت بعدی
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div>
                  <p className="font-medium">{nextAppointment.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPersianDate(nextAppointment.scheduledAt, 'datetime')}
                  </p>
                  <p className="text-sm text-muted-foreground">{nextAppointment.providerName}</p>
                  {nextAppointment.centerName && (
                    <p className="text-xs text-muted-foreground">{nextAppointment.centerName}</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {APPOINTMENT_MODE_LABELS[nextAppointment.mode]}
                  </Badge>
                  <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                    <Link to="/appointments">جزئیات نوبت‌ها</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">نوبت برنامه‌ریزی‌شده‌ای ندارید.</p>
              )}
            </CardContent>
          </Card>

          <Card aria-labelledby="med-heading">
            <CardHeader>
              <CardTitle id="med-heading" className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-secondary" aria-hidden />
                یادآوری دارو
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientReminders.filter((r) => r.type === 'medication').length === 0 ? (
                <p className="text-sm text-muted-foreground">یادآوری داروی فعالی ندارید.</p>
              ) : (
                <ul className="space-y-2">
                  {patientReminders
                    .filter((r) => r.type === 'medication')
                    .slice(0, 2)
                    .map((r) => (
                      <li key={r.id} className="text-sm">
                        <p className="font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card aria-labelledby="screen-heading">
            <CardHeader>
              <CardTitle id="screen-heading">غربالگری / خودارزیابی</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingScreening.reminder || pendingScreening.recommended ? (
                <div>
                  {pendingScreening.reminder && (
                    <p className="text-sm">{pendingScreening.reminder.title}</p>
                  )}
                  {pendingScreening.recommended && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      پیشنهاد: {pendingScreening.recommended.title}
                    </p>
                  )}
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/screenings">انجام خودارزیابی</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">خودارزیابی معوقی ندارید.</p>
              )}
            </CardContent>
          </Card>

          <Card aria-labelledby="msg-heading">
            <CardHeader>
              <CardTitle id="msg-heading" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
                پیام تیم سلامت
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestTeamMessage ? (
                <div>
                  <p className="text-sm font-medium">{latestTeamMessage.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    از {latestTeamMessage.senderName} ·{' '}
                    {relativeTimePersian(latestTeamMessage.createdAt)}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {latestTeamMessage.body.split('\n')[0]}
                  </p>
                  <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                    <Link to="/messages">مشاهده پیام‌ها</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">پیام خوانده‌نشده‌ای ندارید.</p>
              )}
            </CardContent>
          </Card>

          <Card variant="muted" aria-labelledby="readiness-heading">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle id="readiness-heading">شاخص آمادگی خودمراقبتی</CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs">
                  غیربالینی
                </Badge>
              </div>
              <CardDescription>
                این شاخص صرفاً انگیزشی است و جایگزین ارزیابی پزشکی نیست.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">
                  {toPersianDigits(selfCareScore)}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">از ۱۰۰</span>
              </div>
              <Progress value={selfCareScore} className="mt-3" />
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-base font-semibold text-navy">دسترسی سریع</h2>
            <div className="grid grid-cols-2 gap-3">
              <ServiceTile to="/appointments" label="رزرو نوبت" icon={Calendar} />
              <ServiceTile to="/reminders" label="یادآوری‌ها" icon={Bell} />
              <ServiceTile to="/screenings" label="خودارزیابی" icon={FileHeart} />
              <ServiceTile to="/centers" label="مراکز نزدیک" icon={ArrowLeft} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const typeLabels: Record<Reminder['type'], string> = {
    medication: 'دارو',
    appointment: 'نوبت',
    screening: 'خودارزیابی',
    lab_followup: 'پیگیری آزمایش',
    vaccination: 'واکسیناسیون',
    custom: 'سفارشی',
  }

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{reminder.title}</p>
          {reminder.description && (
            <p className="text-xs text-muted-foreground">{reminder.description}</p>
          )}
        </div>
        <Badge variant="outline">{typeLabels[reminder.type]}</Badge>
      </div>
    </li>
  )
}
