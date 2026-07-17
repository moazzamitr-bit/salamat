import { useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  RefreshCw,
  User,
  Video,
  XCircle,
  CheckSquare,
  Square,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { appointments as mockAppointments } from '@/mock-data/appointments'
import { APPOINTMENT_MODE_LABELS } from '@/lib/constants'
import { cn, formatPersianDate, toPersianDigits } from '@/lib/utils'
import { SourceBadge } from '@/components/SourceBadge'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { AppointmentRequestFlow } from './AppointmentRequestFlow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Appointment } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'رزرو شده',
  completed: 'انجام شده',
  cancelled: 'لغو شده',
}

const PRE_VISIT_ITEMS = [
  'لیست داروهای فعلی را آماده کنید',
  'نتایج آزمایش و تصویربرداری اخیر را همراه داشته باشید',
  'سوالات خود را یادداشت کنید',
  '۱۵ دقیقه زودتر حاضر شوید',
  'برای ویزیت ویدئویی، اتصال اینترنت را بررسی کنید',
]

const MOCK_DOCUMENTS = [
  { id: 'doc-1', name: 'فرم پذیرش', type: 'pdf' },
  { id: 'doc-2', name: 'راهنمای آمادگی قبل از ویزیت', type: 'pdf' },
  { id: 'doc-3', name: 'نتایج آزمایش قبلی', type: 'pdf' },
]

function ModeIcon({ mode }: { mode: Appointment['mode'] }) {
  if (mode === 'video' || mode === 'phone') return <Video className="h-4 w-4" />
  return <MapPin className="h-4 w-4" />
}

function AppointmentCard({
  appointment,
  selected,
  onSelect,
}: {
  appointment: Appointment
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-4 text-right transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-navy">{appointment.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            {appointment.providerName}
          </p>
        </div>
        <Badge
          variant={
            appointment.status === 'completed'
              ? 'success'
              : appointment.status === 'cancelled'
                ? 'destructive'
                : 'default'
          }
        >
          {STATUS_LABELS[appointment.status] ?? appointment.status}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatPersianDate(appointment.scheduledAt, 'medium')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatPersianDate(appointment.scheduledAt, 'time')}
        </span>
        <span className="flex items-center gap-1">
          <ModeIcon mode={appointment.mode} />
          {APPOINTMENT_MODE_LABELS[appointment.mode]}
        </span>
      </div>
    </button>
  )
}

function AppointmentDetail({
  appointment,
  onCancel,
  onReschedule,
  actionState,
}: {
  appointment: Appointment
  onCancel: () => void
  onReschedule: () => void
  actionState: 'idle' | 'cancelling' | 'rescheduling' | 'cancelled' | 'rescheduled'
}) {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({})

  const toggleCheck = (index: number) => {
    setChecklist((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const checkedCount = Object.values(checklist).filter(Boolean).length
  const isUpcoming = appointment.status === 'scheduled'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{appointment.title}</CardTitle>
            <CardDescription className="mt-1">{appointment.description ?? appointment.specialty}</CardDescription>
          </div>
          <Badge
            variant={
              appointment.status === 'completed'
                ? 'success'
                : appointment.status === 'cancelled'
                  ? 'destructive'
                  : 'default'
            }
          >
            {STATUS_LABELS[appointment.status] ?? appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SourceBadge
          verificationStatus={appointment.verificationStatus}
          sourceType={appointment.sourceType}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['پزشک / ارائه‌دهنده', appointment.providerName],
            ['تخصص', appointment.specialty ?? '—'],
            ['مرکز', appointment.centerName ?? '—'],
            ['نحوه مراجعه', APPOINTMENT_MODE_LABELS[appointment.mode]],
            ['تاریخ', formatPersianDate(appointment.scheduledAt, 'long')],
            ['ساعت', formatPersianDate(appointment.scheduledAt, 'time')],
            ['مدت', `${toPersianDigits(appointment.durationMinutes)} دقیقه`],
            ['محل', appointment.location ?? (appointment.mode === 'video' ? 'آنلاین' : '—')],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-navy">{value}</p>
            </div>
          ))}
        </div>

        {appointment.notes && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
            <p className="font-medium text-navy">یادداشت</p>
            <p className="mt-1 text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {isUpcoming && actionState !== 'cancelled' && actionState !== 'rescheduled' && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={onReschedule}
              disabled={actionState === 'rescheduling' || actionState === 'cancelling'}
            >
              <RefreshCw className={cn('h-4 w-4', actionState === 'rescheduling' && 'animate-spin')} />
              {actionState === 'rescheduling' ? 'در حال زمان‌بندی...' : 'زمان‌بندی مجدد'}
            </Button>
            <Button
              variant="destructive"
              onClick={onCancel}
              disabled={actionState === 'cancelling' || actionState === 'rescheduling'}
            >
              <XCircle className="h-4 w-4" />
              {actionState === 'cancelling' ? 'در حال لغو...' : 'لغو نوبت'}
            </Button>
          </div>
        )}

        {actionState === 'cancelled' && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            این نوبت لغو شد. در صورت نیاز می‌توانید نوبت جدید درخواست دهید.
          </div>
        )}

        {actionState === 'rescheduled' && (
          <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            درخواست زمان‌بندی مجدد ثبت شد. مرکز درمانی با شما تماس خواهد گرفت.
          </div>
        )}

        {isUpcoming && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-navy">چک‌لیست قبل از ویزیت</h4>
              <span className="text-xs text-muted-foreground">
                {toPersianDigits(checkedCount)} از {toPersianDigits(PRE_VISIT_ITEMS.length)}
              </span>
            </div>
            <ul className="space-y-2">
              {PRE_VISIT_ITEMS.map((item, i) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggleCheck(i)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-2 text-right text-sm transition-colors hover:bg-muted/50"
                  >
                    {checklist[i] ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn(checklist[i] && 'text-muted-foreground line-through')}>
                      {item}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="mb-3 flex items-center gap-2 font-medium text-navy">
            <FileText className="h-4 w-4" />
            اسناد و مدارک
          </h4>
          <ul className="space-y-2">
            {MOCK_DOCUMENTS.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm text-navy">{doc.name}</span>
                </div>
                <Button variant="ghost" size="sm">
                  دانلود
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export function AppointmentsPage() {
  const { activePatientId, activePatientName } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionStates, setActionStates] = useState<
    Record<string, 'idle' | 'cancelling' | 'rescheduling' | 'cancelled' | 'rescheduled'>
  >({})
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  const patientAppointments = useMemo(
    () => appointments.filter((a) => a.patientId === activePatientId),
    [appointments, activePatientId]
  )

  const upcoming = useMemo(
    () =>
      patientAppointments
        .filter((a) => a.status === 'scheduled')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [patientAppointments]
  )

  const previous = useMemo(
    () =>
      patientAppointments
        .filter((a) => a.status === 'completed' || a.status === 'cancelled')
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [patientAppointments]
  )

  const selected =
    patientAppointments.find((a) => a.id === selectedId) ??
    (activeTab === 'upcoming' ? upcoming[0] : previous[0]) ??
    null

  const effectiveSelectedId = selected?.id ?? null

  const handleCancel = (id: string) => {
    setActionStates((s) => ({ ...s, [id]: 'cancelling' }))
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
      )
      setActionStates((s) => ({ ...s, [id]: 'cancelled' }))
      setCancelDialogId(null)
    }, 800)
  }

  const handleReschedule = (id: string) => {
    setActionStates((s) => ({ ...s, [id]: 'rescheduling' }))
    setTimeout(() => {
      setActionStates((s) => ({ ...s, [id]: 'rescheduled' }))
    }, 1000)
  }

  return (
    <div className="page-container">
      <PageHeader
        title="نوبت‌ها"
        subtitle={`مدیریت نوبت‌های ${activePatientName}`}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            آینده ({toPersianDigits(upcoming.length)})
          </TabsTrigger>
          <TabsTrigger value="previous">
            گذشته ({toPersianDigits(previous.length)})
          </TabsTrigger>
          <TabsTrigger value="request">درخواست نوبت جدید</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState
              title="نوبت آینده‌ای ندارید"
              description="برای رزرو نوبت جدید به تب «درخواست نوبت جدید» بروید."
              icon={<Calendar className="h-6 w-6" />}
              action={
                <Button variant="outline" onClick={() => setActiveTab('request')}>
                  درخواست نوبت
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-3 lg:col-span-2">
                {upcoming.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    selected={effectiveSelectedId === a.id}
                    onSelect={() => setSelectedId(a.id)}
                  />
                ))}
              </div>
              <div className="lg:col-span-3">
                {selected && selected.status === 'scheduled' && (
                  <AppointmentDetail
                    appointment={selected}
                    actionState={actionStates[selected.id] ?? 'idle'}
                    onCancel={() => setCancelDialogId(selected.id)}
                    onReschedule={() => handleReschedule(selected.id)}
                  />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="previous">
          {previous.length === 0 ? (
            <EmptyState
              title="سابقه نوبتی یافت نشد"
              description="نوبت‌های انجام‌شده و لغوشده اینجا نمایش داده می‌شوند."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-3 lg:col-span-2">
                {previous.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    selected={effectiveSelectedId === a.id}
                    onSelect={() => setSelectedId(a.id)}
                  />
                ))}
              </div>
              <div className="lg:col-span-3">
                {selected && selected.status !== 'scheduled' && (
                  <AppointmentDetail
                    appointment={selected}
                    actionState={actionStates[selected.id] ?? 'idle'}
                    onCancel={() => {}}
                    onReschedule={() => {}}
                  />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="request">
          <AppointmentRequestFlow onCancel={() => setActiveTab('upcoming')} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!cancelDialogId} onOpenChange={() => setCancelDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>لغو نوبت</DialogTitle>
            <DialogDescription>
              آیا از لغو این نوبت اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogId(null)}>
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialogId && handleCancel(cancelDialogId)}
            >
              تأیید لغو
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppointmentsPage
