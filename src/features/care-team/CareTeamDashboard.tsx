import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  Stethoscope,
  User,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SourceBadge } from '@/components/SourceBadge'
import { useAuth } from '@/features/auth/AuthContext'
import {
  appointments,
  careTeamMembers,
  educationalArticles,
  healthMessages,
  healthRecordsByPatient,
  profilesById,
  reminders,
  screeningResults,
} from '@/mock-data'
import {
  APPOINTMENT_MODE_LABELS,
  RISK_LEVEL_LABELS,
  VERIFICATION_STATUS_LABELS,
} from '@/lib/constants'
import { cn, formatPersianDate, relativeTimePersian, toPersianDigits } from '@/lib/utils'
import type { Profile, ScreeningResult, SourceType, VerificationStatus } from '@/types'

const PROVIDER_ID = 'p-careteam-1'

interface PatientSubmission {
  id: string
  patientId: string
  patientName: string
  title: string
  type: string
  date: string
  verificationStatus: VerificationStatus
  sourceType: SourceType
}

interface CareTask {
  id: string
  patientId: string
  patientName: string
  title: string
  dueAt: string
  priority: 'high' | 'normal'
  done: boolean
}

export default function CareTeamDashboard() {
  const { user } = useAuth()
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p-citizen-1')
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set())
  const [reviewedScreeningIds, setReviewedScreeningIds] = useState<Set<string>>(new Set())
  const [reminderOpen, setReminderOpen] = useState(false)
  const [educationOpen, setEducationOpen] = useState(false)
  const [reminderText, setReminderText] = useState('')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [clinicalNote, setClinicalNote] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [activeScreening, setActiveScreening] = useState<ScreeningResult | null>(null)

  const coveredPatients = useMemo(() => {
    const patientIds = [
      ...new Set(
        careTeamMembers
          .filter((m) => m.providerId === PROVIDER_ID && m.isPrimary)
          .map((m) => m.patientId)
      ),
    ]
    return patientIds
      .map((id) => profilesById[id])
      .filter((p): p is Profile => !!p)
  }, [])

  const selectedPatient = profilesById[selectedPatientId]

  const providerAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.providerId === PROVIDER_ID && a.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    []
  )

  const providerMessages = useMemo(
    () =>
      healthMessages
        .filter(
          (m) =>
            m.recipientId === PROVIDER_ID &&
            m.senderRole === 'citizen' &&
            !m.isRead
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    []
  )

  const pendingScreenings = useMemo(
    () =>
      screeningResults.filter(
        (r) =>
          coveredPatients.some((p) => p.id === r.patientId) &&
          (r.verificationStatus === 'pending_review' || r.verificationStatus === 'self_reported') &&
          !reviewedScreeningIds.has(r.id)
      ),
    [coveredPatients, reviewedScreeningIds]
  )

  const highPriorityFollowUps = useMemo(() => {
    const items: { id: string; patientName: string; label: string; href?: string }[] = []

    reminders
      .filter(
        (r) =>
          coveredPatients.some((p) => p.id === r.patientId) &&
          !r.isCompleted &&
          (r.type === 'lab_followup' || r.type === 'screening')
      )
      .forEach((r) => {
        const patient = profilesById[r.patientId]
        items.push({
          id: r.id,
          patientName: patient?.fullName ?? '—',
          label: r.title,
        })
      })

    screeningResults
      .filter((r) => r.riskLevel === 'high' && coveredPatients.some((p) => p.id === r.patientId))
      .forEach((r) => {
        const patient = profilesById[r.patientId]
        items.push({
          id: `risk-${r.id}`,
          patientName: patient?.fullName ?? '—',
          label: `خطر ${RISK_LEVEL_LABELS[r.riskLevel ?? 'moderate'] ?? 'متوسط'} — ${r.screeningTitle}`,
        })
      })

    return items.slice(0, 6)
  }, [coveredPatients])

  const recentSubmissions = useMemo((): PatientSubmission[] => {
    const items: PatientSubmission[] = []
    for (const patient of coveredPatients) {
      const records = healthRecordsByPatient[patient.id]
      if (!records) continue
      const pending = [
        ...records.conditions,
        ...records.allergies,
        ...records.documents,
      ]
        .filter((r) => r.verificationStatus === 'pending_review' && !verifiedIds.has(r.id))
        .map((r) => ({
          id: r.id,
          patientId: patient.id,
          patientName: patient.fullName,
          title: r.title,
          type:
            'allergen' in r
              ? 'حساسیت'
              : 'documentType' in r
                ? 'سند'
                : 'بیماری',
          date: r.date,
          verificationStatus: r.verificationStatus,
          sourceType: r.sourceType,
        }))
      items.push(...pending)
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
  }, [coveredPatients, verifiedIds])

  const careTasks: CareTask[] = useMemo(
    () => [
      {
        id: 'task-1',
        patientId: 'p-citizen-1',
        patientName: 'سارا محمدی',
        title: 'بررسی LDL و پاسخ به سؤال لوزارتان',
        dueAt: '2025-07-18T12:00:00.000Z',
        priority: 'high',
        done: false,
      },
      {
        id: 'task-2',
        patientId: 'p-mother-1',
        patientName: 'مریم احمدی',
        title: 'پیگیری HbA1c و تنظیم متفورمین',
        dueAt: '2025-07-19T09:00:00.000Z',
        priority: 'high',
        done: false,
      },
      {
        id: 'task-3',
        patientId: 'p-citizen-1',
        patientName: 'سارا محمدی',
        title: 'تأیید حساسیت بادام زمینی',
        dueAt: '2025-07-20T10:00:00.000Z',
        priority: 'normal',
        done: false,
      },
      {
        id: 'task-4',
        patientId: 'p-citizen-1',
        patientName: 'سارا محمدی',
        title: 'ارسال بسته آموزشی فشار خون',
        dueAt: '2025-07-21T14:00:00.000Z',
        priority: 'normal',
        done: true,
      },
    ],
    []
  )

  const [tasks, setTasks] = useState(careTasks)

  const patientRecords = healthRecordsByPatient[selectedPatientId]
  const patientPendingCount = recentSubmissions.filter((s) => s.patientId === selectedPatientId).length

  const toggleVerified = (id: string) => {
    setVerifiedIds((prev) => new Set(prev).add(id))
  }

  const openScreeningReview = (result: ScreeningResult) => {
    setActiveScreening(result)
    setReviewDialogOpen(true)
  }

  const confirmScreeningReview = () => {
    if (activeScreening) {
      setReviewedScreeningIds((prev) => new Set(prev).add(activeScreening.id))
    }
    setReviewDialogOpen(false)
    setActiveScreening(null)
  }

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    )
  }

  const toggleArticle = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    )
  }

  const stats = [
    { label: 'بیماران تحت پوشش', value: coveredPatients.length, icon: User },
    { label: 'غربالگری معوق', value: pendingScreenings.length, icon: ClipboardList },
    { label: 'پیام خوانده‌نشده', value: providerMessages.length, icon: MessageSquare },
    { label: 'نوبت پیش‌رو', value: providerAppointments.length, icon: Calendar },
  ]

  return (
    <div className="page-container">
      <PageHeader
        title={`پنل تیم سلامت — ${user?.profile.fullName ?? 'دکتر علی رضایی'}`}
        subtitle="مدیریت بیماران، پیگیری‌ها و ارتباطات بالینی"
        actions={
          <Badge variant="secondary" className="gap-1">
            <Stethoscope className="h-3 w-3" />
            پزشک عمومی / داخلی
          </Badge>
        }
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold text-navy">{toPersianDigits(value)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Main column */}
        <div className="space-y-4 xl:col-span-8">
          {/* Covered patients */}
          <section className="rounded-xl border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-navy">بیماران تحت پوشش</h2>
              <span className="text-xs text-muted-foreground">
                {toPersianDigits(coveredPatients.length)} نفر
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {coveredPatients.map((patient) => {
                const pending = recentSubmissions.filter((s) => s.patientId === patient.id).length
                const isSelected = selectedPatientId === patient.id
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-right transition-colors',
                      isSelected
                        ? 'border-primary bg-accent/50'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-navy">
                      {patient.firstName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">{patient.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {toPersianDigits(patient.age ?? 0)} سال · {patient.phone}
                      </p>
                      {pending > 0 && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {toPersianDigits(pending)} مورد در انتظار بررسی
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pending screenings */}
            <section className="rounded-xl border border-border bg-white p-4">
              <h2 className="mb-3 text-base font-semibold text-navy">غربالگری‌های در انتظار</h2>
              {pendingScreenings.length === 0 ? (
                <p className="text-sm text-muted-foreground">مورد معوقی نیست.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {pendingScreenings.slice(0, 4).map((result) => {
                    const patient = profilesById[result.patientId]
                    return (
                      <li key={result.id} className="py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{result.screeningTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {patient?.fullName} · {relativeTimePersian(result.completedAt)}
                            </p>
                            <Badge
                              variant={result.riskLevel === 'high' ? 'destructive' : 'outline'}
                              className="mt-1 text-xs"
                            >
                              خطر {RISK_LEVEL_LABELS[result.riskLevel ?? 'moderate'] ?? 'متوسط'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openScreeningReview(result)}
                          >
                            بررسی
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* High-priority follow-ups */}
            <section className="rounded-xl border border-border bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
                <AlertTriangle className="h-4 w-4 text-warning" />
                پیگیری‌های اولویت بالا
              </h2>
              {highPriorityFollowUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">پیگیری فوری ندارید.</p>
              ) : (
                <ul className="space-y-2">
                  {highPriorityFollowUps.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2"
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.patientName}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Recent submissions */}
          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="mb-3 text-base font-semibold text-navy">ارسال‌های اخیر بیماران</h2>
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">همه موارد بررسی شده‌اند.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentSubmissions.map((item) => (
                  <li key={item.id} className="data-row py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.patientName} · {item.type} ·{' '}
                        {formatPersianDate(item.date, 'medium')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SourceBadge
                        verificationStatus={item.verificationStatus}
                        sourceType={item.sourceType}
                        compact
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`verify-${item.id}`} className="text-xs">
                          تأیید
                        </Label>
                        <Switch
                          id={`verify-${item.id}`}
                          checked={verifiedIds.has(item.id)}
                          onCheckedChange={() => toggleVerified(item.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Appointments */}
            <section className="rounded-xl border border-border bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
                <Calendar className="h-4 w-4 text-primary" />
                نوبت‌ها
              </h2>
              <ul className="divide-y divide-border">
                {providerAppointments.slice(0, 5).map((appt) => {
                  const patient = profilesById[appt.patientId]
                  return (
                    <li key={appt.id} className="py-2.5">
                      <p className="text-sm font-medium">{appt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient?.fullName} ·{' '}
                        {formatPersianDate(appt.scheduledAt, 'datetime')}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {APPOINTMENT_MODE_LABELS[appt.mode]}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* Messages */}
            <section className="rounded-xl border border-border bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
                <MessageSquare className="h-4 w-4 text-primary" />
                پیام‌ها
              </h2>
              {providerMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">پیام جدیدی ندارید.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {providerMessages.map((msg) => (
                    <li key={msg.id} className="py-2.5">
                      <p className="text-sm font-medium">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {msg.senderName} · {relativeTimePersian(msg.createdAt)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {msg.body.split('\n')[0]}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Care tasks */}
          <section className="rounded-xl border border-border bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-navy">
              <ClipboardList className="h-4 w-4 text-secondary" />
              وظایف مراقبتی
            </h2>
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      task.done
                        ? 'border-success bg-success text-white'
                        : 'border-border bg-white'
                    )}
                    aria-label={task.done ? 'انجام شده' : 'انجام نشده'}
                  >
                    {task.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm',
                        task.done && 'text-muted-foreground line-through'
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.patientName} ·{' '}
                      {formatPersianDate(task.dueAt, 'datetime')}
                    </p>
                  </div>
                  <Badge
                    variant={task.priority === 'high' ? 'destructive' : 'outline'}
                    className="shrink-0 text-xs"
                  >
                    {task.priority === 'high' ? 'فوری' : 'عادی'}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Patient detail panel */}
        <aside className="xl:col-span-4">
          <div className="sticky top-4 space-y-4 rounded-xl border border-border bg-white p-4">
            <h2 className="text-base font-semibold text-navy">جزئیات بیمار</h2>
            {selectedPatient ? (
              <>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="font-medium text-navy">{selectedPatient.fullName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {toPersianDigits(selectedPatient.age ?? 0)} سال ·{' '}
                    {selectedPatient.gender === 'female' ? 'زن' : 'مرد'} ·{' '}
                    {selectedPatient.bloodType ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedPatient.phone}</p>
                  {patientPendingCount > 0 && (
                    <Badge variant="outline" className="mt-2">
                      {toPersianDigits(patientPendingCount)} مورد در انتظار تأیید
                    </Badge>
                  )}
                </div>

                {patientRecords && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        بیماری‌های فعال
                      </p>
                      <ul className="space-y-1">
                        {patientRecords.conditions
                          .filter((c) => c.status === 'active')
                          .slice(0, 3)
                          .map((c) => (
                            <li key={c.id} className="flex items-center justify-between gap-2">
                              <span>{c.title}</span>
                              <SourceBadge
                                verificationStatus={c.verificationStatus}
                                sourceType={c.sourceType}
                                compact
                              />
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">داروهای جاری</p>
                      <ul className="space-y-1">
                        {patientRecords.medications
                          .filter((m) => m.status === 'active')
                          .slice(0, 3)
                          .map((m) => (
                            <li key={m.id}>{m.title}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => setReminderOpen(true)}>
                    <Bell className="h-4 w-4" />
                    ارسال یادآوری
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEducationOpen(true)}>
                    <BookOpen className="h-4 w-4" />
                    ارسال بسته آموزشی
                  </Button>
                </div>

                <div>
                  <Label htmlFor="clinical-note" className="flex items-center gap-1 text-sm">
                    <FileText className="h-3.5 w-3.5" />
                    یادداشت بالینی
                  </Label>
                  <Textarea
                    id="clinical-note"
                    placeholder="یادداشت بالینی برای ثبت در پرونده (نمایشی)..."
                    value={clinicalNote}
                    onChange={(e) => setClinicalNote(e.target.value)}
                    className="mt-2 min-h-[80px] text-sm"
                  />
                  <Button size="sm" variant="secondary" className="mt-2" disabled={!clinicalNote.trim()}>
                    ذخیره یادداشت
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">بیماری انتخاب نشده است.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Send reminder dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ارسال یادآوری</DialogTitle>
            <DialogDescription>
              یادآوری برای {selectedPatient?.fullName} — ارسال از طریق سامانه (نمایشی)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="reminder-text">متن یادآوری</Label>
              <Textarea
                id="reminder-text"
                placeholder="مثال: لطفاً آزمایش LDL را تا پایان هفته انجام دهید."
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={() => {
                setReminderOpen(false)
                setReminderText('')
              }}
              disabled={!reminderText.trim()}
            >
              ارسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send educational package dialog */}
      <Dialog open={educationOpen} onOpenChange={setEducationOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ارسال بسته آموزشی</DialogTitle>
            <DialogDescription>
              انتخاب مقالات برای {selectedPatient?.fullName}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {educationalArticles.slice(0, 6).map((article) => (
              <li key={article.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => toggleArticle(article.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.categoryLabel}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEducationOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={() => {
                setEducationOpen(false)
                setSelectedArticles([])
              }}
              disabled={selectedArticles.length === 0}
            >
              ارسال ({toPersianDigits(selectedArticles.length)} مقاله)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review screening dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>بررسی نتیجه خودارزیابی</DialogTitle>
            <DialogDescription>
              {activeScreening?.screeningTitle} —{' '}
              {profilesById[activeScreening?.patientId ?? '']?.fullName}
            </DialogDescription>
          </DialogHeader>
          {activeScreening && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="font-medium">{activeScreening.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  امتیاز: {toPersianDigits(activeScreening.score ?? '—')} · خطر{' '}
                  {RISK_LEVEL_LABELS[activeScreening.riskLevel ?? 'moderate'] ?? 'متوسط'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  وضعیت: {VERIFICATION_STATUS_LABELS[activeScreening.verificationStatus]}
                </p>
              </div>
              {activeScreening.recommendations.length > 0 && (
                <div>
                  <p className="mb-1 font-medium">توصیه‌ها</p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {activeScreening.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              بستن
            </Button>
            <Button onClick={confirmScreeningReview}>ثبت بررسی</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
