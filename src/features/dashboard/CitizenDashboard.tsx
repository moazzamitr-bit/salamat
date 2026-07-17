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
import { Separator } from '@/components/ui/separator'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { SourceBadge } from '@/components/SourceBadge'
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
    <div className="page-container">
      <PageHeader
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

      {/* Active patient selector */}
      {familyMembers.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <p className="mb-2 text-sm font-medium text-navy">پرونده فعال</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activePatientId === user?.profile.id ? 'default' : 'outline'}
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
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main health summary */}
        <div className="space-y-6 lg:col-span-2">
          <section
            aria-labelledby="summary-heading"
            className="rounded-xl border border-border bg-white p-5"
          >
            <h2 id="summary-heading" className="text-lg font-semibold text-navy">
              خلاصه سلامت
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              وضعیت فعلی {activePatientName} — {toPersianDigits(activeConditions.length)} بیماری
              فعال، {toPersianDigits(activeMedications.length)} داروی جاری
            </p>

            {attentionItems.length > 0 && (
              <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-sm font-medium text-navy">نیاز به توجه</p>
                <ul className="mt-2 space-y-1.5">
                  {attentionItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center gap-2 text-sm transition-colors hover:text-primary',
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
              </div>
            )}

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
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
              <div>
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
          </section>

          {/* Today's tasks */}
          <section aria-labelledby="today-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="today-heading" className="text-lg font-semibold text-navy">
              کارهای امروز
            </h2>
            {todayReminders.length === 0 && !nextAppointment ? (
              <EmptyState
                className="mt-4 py-8"
                title="کار فوری برای امروز ندارید"
                description="یادآوری‌ها و نوبت‌های آینده در بخ‌های زیر نمایش داده می‌شوند."
              />
            ) : (
              <ul className="mt-4 divide-y divide-border">
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
          </section>

          {/* Recent record updates */}
          <section aria-labelledby="updates-heading" className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 id="updates-heading" className="text-lg font-semibold text-navy">
                به‌روزرسانی‌های اخیر پرونده
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/health-record">همه</Link>
              </Button>
            </div>
            {recentUpdates.length === 0 ? (
              <EmptyState
                className="mt-4 py-8"
                title="به‌روزرسانی اخیری وجود ندارد"
                description="سوابق پزشکی پس از ثبت یا تأیید در اینجا نمایش داده می‌شوند."
              />
            ) : (
              <ul className="mt-4 divide-y divide-border">
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
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next appointment */}
          <section aria-labelledby="appt-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="appt-heading" className="flex items-center gap-2 text-base font-semibold text-navy">
              <Calendar className="h-4 w-4 text-primary" aria-hidden />
              نوبت بعدی
            </h2>
            {nextAppointment ? (
              <div className="mt-3">
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
              <p className="mt-3 text-sm text-muted-foreground">نوبت برنامه‌ریزی‌شده‌ای ندارید.</p>
            )}
          </section>

          {/* Medication reminder */}
          <section aria-labelledby="med-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="med-heading" className="flex items-center gap-2 text-base font-semibold text-navy">
              <Pill className="h-4 w-4 text-secondary" aria-hidden />
              یادآوری دارو
            </h2>
            {patientReminders.filter((r) => r.type === 'medication').length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">یادآوری داروی فعالی ندارید.</p>
            ) : (
              <ul className="mt-3 space-y-2">
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
          </section>

          {/* Pending screening */}
          <section aria-labelledby="screen-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="screen-heading" className="text-base font-semibold text-navy">
              غربالگری / خودارزیابی
            </h2>
            {pendingScreening.reminder || pendingScreening.recommended ? (
              <div className="mt-3">
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
              <p className="mt-3 text-sm text-muted-foreground">
                خودارزیابی معوقی ندارید.
              </p>
            )}
          </section>

          {/* Health team message */}
          <section aria-labelledby="msg-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="msg-heading" className="flex items-center gap-2 text-base font-semibold text-navy">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
              پیام تیم سلامت
            </h2>
            {latestTeamMessage ? (
              <div className="mt-3">
                <p className="text-sm font-medium">{latestTeamMessage.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  از {latestTeamMessage.senderName} · {relativeTimePersian(latestTeamMessage.createdAt)}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {latestTeamMessage.body.split('\n')[0]}
                </p>
                <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                  <Link to="/messages">مشاهده پیام‌ها</Link>
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">پیام خوانده‌نشده‌ای ندارید.</p>
            )}
          </section>

          {/* Non-clinical readiness index */}
          <section
            aria-labelledby="readiness-heading"
            className="rounded-xl border border-dashed border-border bg-muted/20 p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="readiness-heading" className="text-base font-semibold text-navy">
                شاخص آمادگی خودمراقبتی
              </h2>
              <Badge variant="outline" className="shrink-0 text-xs">
                غیربالینی
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              این شاخص صرفاً انگیزشی است و جایگزین ارزیابی پزشکی نیست.
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">
                {toPersianDigits(selfCareScore)}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">از ۱۰۰</span>
            </div>
            <Progress value={selfCareScore} className="mt-2" />
          </section>

          {/* Quick actions */}
          <section aria-labelledby="actions-heading" className="rounded-xl border border-border bg-white p-5">
            <h2 id="actions-heading" className="text-base font-semibold text-navy">
              دسترسی سریع
            </h2>
            <ul className="mt-3 space-y-1">
              {[
                { label: 'رزرو نوبت', href: '/appointments', icon: Calendar },
                { label: 'یادآوری‌ها', href: '/reminders', icon: Bell },
                { label: 'خودارزیابی', href: '/screenings', icon: FileHeart },
                { label: 'مراکز نزدیک', href: '/centers', icon: ArrowLeft },
              ].map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {label}
                    </span>
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
