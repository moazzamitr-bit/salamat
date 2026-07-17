import { useMemo, useState } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Phone,
  Stethoscope,
  User,
  Video,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { careTeamByPatient } from '@/mock-data/care-team'
import { APPOINTMENT_MODE_LABELS } from '@/lib/constants'
import { cn, formatPersianDate, toPersianDigits } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type { AppointmentMode } from '@/types'

const SERVICE_TYPES = [
  { id: 'general', label: 'ویزیت عمومی', description: 'معاینه و پیگیری عمومی' },
  { id: 'specialist', label: 'ویزیت تخصصی', description: 'مراجعه به پزشک متخصص' },
  { id: 'nutrition', label: 'مشاوره تغذیه', description: 'برنامه غذایی و تغذیه درمانی' },
  { id: 'mental', label: 'سلامت روان', description: 'مشاوره روانشناسی یا روان‌پزشکی' },
  { id: 'lab', label: 'آزمایش و تصویربرداری', description: 'نوبت آزمایش یا تصویربرداری' },
  { id: 'followup', label: 'پیگیری درمان', description: 'بررسی وضعیت درمان جاری' },
] as const

const MODE_OPTIONS: { mode: AppointmentMode; icon: typeof MapPin; description: string }[] = [
  { mode: 'in_person', icon: MapPin, description: 'مراجعه حضوری به مرکز درمانی' },
  { mode: 'video', icon: Video, description: 'تماس ویدئویی با پزشک' },
  { mode: 'phone', icon: Phone, description: 'مشاوره تلفنی' },
  { mode: 'home_care', icon: Home, description: 'خدمات در منزل' },
]

const MOCK_DATES = [
  { date: '2025-08-01', label: '۱۰ مرداد ۱۴۰۴' },
  { date: '2025-08-02', label: '۱۱ مرداد ۱۴۰۴' },
  { date: '2025-08-03', label: '۱۲ مرداد ۱۴۰۴' },
  { date: '2025-08-04', label: '۱۳ مرداد ۱۴۰۴' },
  { date: '2025-08-05', label: '۱۴ مرداد ۱۴۰۴' },
]

const MOCK_SLOTS = ['۰۹:۰۰', '۰۹:۳۰', '۱۰:۰۰', '۱۱:۰۰', '۱۴:۰۰', '۱۵:۳۰', '۱۶:۰۰', '۱۷:۰۰']

const STEP_LABELS = [
  'انتخاب بیمار',
  'نوع خدمت',
  'پزشک / ارائه‌دهنده',
  'نحوه مراجعه',
  'تاریخ و ساعت',
  'علت مراجعه',
  'بررسی',
  'تأیید',
]

interface RequestForm {
  patientId: string
  patientName: string
  serviceType: string
  providerId: string
  providerName: string
  specialty: string
  mode: AppointmentMode | ''
  date: string
  time: string
  reason: string
}

interface AppointmentRequestFlowProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function AppointmentRequestFlow({ onComplete, onCancel }: AppointmentRequestFlowProps) {
  const { user, activePatientId, activePatientName, familyMembers } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<RequestForm>({
    patientId: activePatientId,
    patientName: activePatientName,
    serviceType: '',
    providerId: '',
    providerName: '',
    specialty: '',
    mode: '',
    date: '',
    time: '',
    reason: '',
  })

  const patients = useMemo(() => {
    if (!user) return []
    return [
      { patientId: user.profile.id, name: user.profile.fullName, relationship: 'خودم' },
      ...familyMembers.map((m) => ({
        patientId: m.patientId,
        name: m.profile.fullName,
        relationship: m.relationshipLabel,
      })),
    ]
  }, [user, familyMembers])

  const providers = useMemo(
    () => (form.patientId ? careTeamByPatient(form.patientId) : []),
    [form.patientId]
  )

  const progress = (step / STEP_LABELS.length) * 100

  const canNext = (): boolean => {
    switch (step) {
      case 1:
        return !!form.patientId
      case 2:
        return !!form.serviceType
      case 3:
        return !!form.providerId
      case 4:
        return !!form.mode
      case 5:
        return !!form.date && !!form.time
      case 6:
        return form.reason.trim().length >= 10
      case 7:
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (step < STEP_LABELS.length && canNext()) setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleReset = () => {
    setForm({
      patientId: activePatientId,
      patientName: activePatientName,
      serviceType: '',
      providerId: '',
      providerName: '',
      specialty: '',
      mode: '',
      date: '',
      time: '',
      reason: '',
    })
    setStep(1)
    onComplete?.()
  }

  return (
    <div className="space-y-6">
      {step < 8 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-navy">
              مرحله {toPersianDigits(step)} از {toPersianDigits(STEP_LABELS.length)}
            </span>
            <span className="text-muted-foreground">{STEP_LABELS[step - 1]}</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              برای چه کسی نوبت می‌گیرید؟
            </CardTitle>
            <CardDescription>بیمار مورد نظر را از لیست خانواده انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {patients.map((p) => (
              <button
                key={p.patientId}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, patientId: p.patientId, patientName: p.name }))
                }
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-right transition-colors',
                  form.patientId === p.patientId
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.relationship}</p>
                </div>
                {form.patientId === p.patientId && (
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              نوع خدمت
            </CardTitle>
            <CardDescription>نوع مراجعه مورد نیاز را انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, serviceType: s.id }))}
                className={cn(
                  'rounded-xl border p-4 text-right transition-colors',
                  form.serviceType === s.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <p className="font-medium text-navy">{s.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>انتخاب پزشک / ارائه‌دهنده</CardTitle>
            <CardDescription>از تیم مراقبت {form.patientName} انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-sm text-muted-foreground">ارائه‌دهنده‌ای برای این بیمار یافت نشد.</p>
            ) : (
              providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      providerId: p.providerId,
                      providerName: p.providerName,
                      specialty: p.specialty,
                    }))
                  }
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-4 text-right transition-colors',
                    form.providerId === p.providerId
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy">{p.providerName}</p>
                    <p className="text-sm text-muted-foreground">{p.specialty}</p>
                    <p className="text-xs text-muted-foreground">{p.organization}</p>
                  </div>
                  {p.isPrimary && (
                    <span className="shrink-0 rounded-lg bg-secondary/10 px-2 py-0.5 text-xs text-secondary">
                      پزشک اصلی
                    </span>
                  )}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>نحوه مراجعه</CardTitle>
            <CardDescription>روش دریافت خدمت را مشخص کنید</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {MODE_OPTIONS.map(({ mode, icon: Icon, description }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setForm((f) => ({ ...f, mode }))}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-right transition-colors',
                  form.mode === mode
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-navy">{APPOINTMENT_MODE_LABELS[mode]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              تاریخ و ساعت
            </CardTitle>
            <CardDescription>زمان مناسب برای نوبت را انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">تاریخ</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_DATES.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, date: d.date }))}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm transition-colors',
                      form.date === d.date
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">ساعت</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, time: slot }))}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-sm transition-colors',
                      form.time === slot
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>علت مراجعه</CardTitle>
            <CardDescription>به طور خلاصه دلیل درخواست نوبت را بنویسید (حداقل ۱۰ کاراکتر)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="مثال: پیگیری فشار خون و بررسی نتایج آزمایش اخیر..."
              rows={5}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {toPersianDigits(form.reason.length)} کاراکتر
            </p>
          </CardContent>
        </Card>
      )}

      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>بررسی درخواست</CardTitle>
            <CardDescription>اطلاعات را قبل از ارسال تأیید کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['بیمار', form.patientName],
              ['نوع خدمت', SERVICE_TYPES.find((s) => s.id === form.serviceType)?.label ?? '—'],
              ['پزشک', form.providerName],
              ['تخصص', form.specialty],
              ['نحوه مراجعه', form.mode ? APPOINTMENT_MODE_LABELS[form.mode] : '—'],
              ['تاریخ', MOCK_DATES.find((d) => d.date === form.date)?.label ?? '—'],
              ['ساعت', form.time || '—'],
              ['علت مراجعه', form.reason],
            ].map(([label, value]) => (
              <div key={label} className="data-row">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-navy">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 8 && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
            <h3 className="text-xl font-semibold text-navy">درخواست نوبت ثبت شد</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              درخواست شما برای {form.patientName} با {form.providerName} در تاریخ{' '}
              {MOCK_DATES.find((d) => d.date === form.date)?.label} ساعت {form.time} ثبت شد.
              پس از تأیید مرکز، پیامک اطلاع‌رسانی دریافت خواهید کرد.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              کد پیگیری: {toPersianDigits('REQ-' + Date.now().toString().slice(-6))}
            </p>
            <Button className="mt-6" onClick={handleReset}>
              بازگشت به نوبت‌ها
            </Button>
          </CardContent>
        </Card>
      )}

      {step < 8 && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {step > 1 ? (
              <Button variant="outline" onClick={goBack}>
                <ChevronRight className="h-4 w-4" />
                قبلی
              </Button>
            ) : (
              onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  انصراف
                </Button>
              )
            )}
          </div>
          <Button onClick={goNext} disabled={!canNext()}>
            {step === 7 ? 'ثبت درخواست' : 'بعدی'}
            {step < 7 && <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}

export default AppointmentRequestFlow
