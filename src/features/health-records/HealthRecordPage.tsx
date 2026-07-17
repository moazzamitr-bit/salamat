import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { SourceBadge } from '@/components/SourceBadge'
import { useAuth } from '@/features/auth/AuthContext'
import { healthRecordsByPatient, screeningResultsByPatient } from '@/mock-data'
import { RISK_LEVEL_LABELS } from '@/lib/constants'
import { cn, formatPersianDate, relativeTimePersian, toPersianDigits } from '@/lib/utils'
import type { MedicalRecordBase, RecordStatus, ScreeningResult } from '@/types'

const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  active: 'فعال',
  resolved: 'برطرف‌شده',
  inactive: 'غیرفعال',
  scheduled: 'برنامه‌ریزی‌شده',
  completed: 'انجام‌شده',
  cancelled: 'لغوشده',
  pending: 'در انتظار',
}

function statusVariant(status: RecordStatus) {
  if (status === 'active' || status === 'scheduled') return 'default' as const
  if (status === 'completed' || status === 'resolved') return 'success' as const
  if (status === 'pending') return 'pending' as const
  if (status === 'cancelled') return 'destructive' as const
  return 'outline' as const
}

interface RecordRowProps {
  title: string
  date: string
  status: RecordStatus
  sourceType: MedicalRecordBase['sourceType']
  verificationStatus: MedicalRecordBase['verificationStatus']
  provider?: string
  lastUpdate: string
  subtitle?: string
}

function RecordRow({
  title,
  date,
  status,
  sourceType,
  verificationStatus,
  provider,
  lastUpdate,
  subtitle,
}: RecordRowProps) {
  return (
    <li className="data-row">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-navy">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatPersianDate(date, 'medium')}</span>
          {provider && <span>{provider}</span>}
          <span>آخرین به‌روزرسانی: {relativeTimePersian(lastUpdate)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <Badge variant={statusVariant(status)}>{RECORD_STATUS_LABELS[status]}</Badge>
        <SourceBadge verificationStatus={verificationStatus} sourceType={sourceType} compact />
      </div>
    </li>
  )
}

function RecordList<T>({
  items,
  emptyTitle,
  emptyDescription,
  renderItem,
}: {
  items: T[]
  emptyTitle: string
  emptyDescription: string
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="mt-4" />
  }
  return <ul className="divide-y divide-border">{items.map(renderItem)}</ul>
}

function ScreeningRow({ result }: { result: ScreeningResult }) {
  return (
    <li className="data-row">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-navy">{result.screeningTitle}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{result.summary}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatPersianDate(result.completedAt, 'datetime')}</span>
          {result.riskLevel && (
            <span>سطح ریسک: {RISK_LEVEL_LABELS[result.riskLevel]}</span>
          )}
          {result.score !== undefined && (
            <span>امتیاز: {toPersianDigits(result.score)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <Badge variant="success">انجام‌شده</Badge>
        <SourceBadge
          verificationStatus={result.verificationStatus}
          sourceType={result.sourceType}
          compact
        />
      </div>
    </li>
  )
}

export default function HealthRecordPage() {
  const { activePatientId, activePatientName, user, familyMembers, setActivePatient } =
    useAuth()

  const records = healthRecordsByPatient[activePatientId] ?? {
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

  const screeningResults = screeningResultsByPatient(activePatientId)

  const covidRecords = useMemo(() => {
    const vaccines = records.immunizations.filter(
      (i) =>
        i.title.includes('کووید') ||
        i.vaccineName.toLowerCase().includes('covid')
    )
    const docs = records.documents.filter(
      (d) =>
        d.title.includes('کووید') ||
        d.documentType === 'vaccination_certificate' &&
          d.description?.includes('کووید')
    )
    return { vaccines, docs }
  }, [records.immunizations, records.documents])

  const isViewingFamily = user && activePatientId !== user.profile.id

  const activeConditions = records.conditions.filter((c) => c.status === 'active')
  const activeMeds = records.medications.filter((m) => m.status === 'active')
  const severeAllergies = records.allergies.filter(
    (a) => a.severity === 'severe' || a.severity === 'life_threatening'
  )

  const tabTriggerClass = 'text-xs sm:text-sm'

  return (
    <div className="page-container">
      <PageHeader
        title="پرونده سلامت"
        subtitle={`سوابق پزشکی ${activePatientName}`}
        breadcrumb={[
          { label: 'خانه', href: '/dashboard' },
          { label: 'پرونده سلامت' },
        ]}
        actions={
          isViewingFamily ? (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              عضو خانواده
            </Badge>
          ) : undefined
        }
      />

      {familyMembers.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <p className="mb-2 text-sm font-medium text-navy">نمایش پرونده</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activePatientId === user?.profile.id ? 'default' : 'outline'}
              onClick={() => user && setActivePatient(user.profile.id)}
            >
              {user?.profile.fullName}
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
          <p className="mt-2 text-xs text-muted-foreground">
            فقط سوابق {activePatientName} نمایش داده می‌شود. سوابق اعضای خانواده با هم
            ترکیب نمی‌شوند.
          </p>
        </div>
      )}

      <Tabs defaultValue="summary" dir="rtl">
        <TabsList className="h-auto gap-1">
          <TabsTrigger value="summary" className={tabTriggerClass}>
            خلاصه سلامت
          </TabsTrigger>
          <TabsTrigger value="conditions" className={tabTriggerClass}>
            بیماری‌ها
          </TabsTrigger>
          <TabsTrigger value="medications" className={tabTriggerClass}>
            داروها
          </TabsTrigger>
          <TabsTrigger value="allergies" className={tabTriggerClass}>
            حساسیت‌ها
          </TabsTrigger>
          <TabsTrigger value="labs" className={tabTriggerClass}>
            آزمایش‌ها
          </TabsTrigger>
          <TabsTrigger value="imaging" className={tabTriggerClass}>
            تصویربرداری
          </TabsTrigger>
          <TabsTrigger value="immunizations" className={tabTriggerClass}>
            واکسیناسیون
          </TabsTrigger>
          <TabsTrigger value="screenings" className={tabTriggerClass}>
            غربالگری‌ها
          </TabsTrigger>
          <TabsTrigger value="procedures" className={tabTriggerClass}>
            اقدامات پزشکی
          </TabsTrigger>
          <TabsTrigger value="dental" className={tabTriggerClass}>
            سلامت دهان و دندان
          </TabsTrigger>
          <TabsTrigger value="covid" className={tabTriggerClass}>
            سوابق کووید
          </TabsTrigger>
          <TabsTrigger value="documents" className={tabTriggerClass}>
            اسناد پزشکی
          </TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-lg font-semibold text-navy">خلاصه وضعیت {activePatientName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              نمای کلی پرونده — برای جزئیات هر بخش، زبانه مربوطه را انتخاب کنید.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <SummaryBlock
                title="بیماری‌های فعال"
                count={activeConditions.length}
                emptyText="بیماری فعالی ثبت نشده"
                items={activeConditions.map((c) => c.title)}
              />
              <SummaryBlock
                title="داروهای جاری"
                count={activeMeds.length}
                emptyText="داروی فعالی ثبت نشده"
                items={activeMeds.map((m) => m.title)}
              />
              <SummaryBlock
                title="حساسیت‌ها"
                count={records.allergies.length}
                emptyText="حساسیت ثبت نشده"
                items={records.allergies.map((a) => a.allergen)}
                highlight={severeAllergies.length > 0}
              />
              <SummaryBlock
                title="آخرین آزمایش"
                count={records.labResults.length}
                emptyText="آزمایشی ثبت نشده"
                items={
                  records.labResults.length > 0
                    ? [
                        `${records.labResults[0]!.title}: ${records.labResults[0]!.value}${records.labResults[0]!.unit ? ` ${records.labResults[0]!.unit}` : ''}`,
                      ]
                    : []
                }
              />
            </div>

            {records.observations.length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <h3 className="text-sm font-medium text-navy">علائم حیاتی اخیر</h3>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {records.observations.slice(0, 4).map((o) => (
                    <li
                      key={o.id}
                      className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{o.title}: </span>
                      <span>
                        {typeof o.value === 'number' ? toPersianDigits(o.value) : o.value}
                        {o.unit && ` ${o.unit}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Conditions */}
        <TabsContent value="conditions">
          <SectionPanel title="بیماری‌ها و شرایط پزشکی">
            <RecordList
              items={records.conditions}
              emptyTitle="بیماری ثبت نشده"
              emptyDescription="بیماری‌ها و شرایط پزشکی پس از ثبت یا دریافت از سامانه یکپارچه در اینجا نمایش داده می‌شوند."
              renderItem={(c) => (
                <RecordRow
                  key={c.id}
                  title={c.title}
                  date={c.date}
                  status={c.status}
                  sourceType={c.sourceType}
                  verificationStatus={c.verificationStatus}
                  provider={c.provider}
                  lastUpdate={c.lastUpdate}
                  subtitle={c.description}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications">
          <SectionPanel title="داروها">
            <RecordList
              items={records.medications}
              emptyTitle="دارویی ثبت نشده"
              emptyDescription="نسخه‌ها و داروهای مصرفی پس از ثبت در این بخش نمایش داده می‌شوند."
              renderItem={(m) => (
                <RecordRow
                  key={m.id}
                  title={m.title}
                  date={m.date}
                  status={m.status}
                  sourceType={m.sourceType}
                  verificationStatus={m.verificationStatus}
                  provider={m.provider ?? m.prescribedBy}
                  lastUpdate={m.lastUpdate}
                  subtitle={`${m.dosage} — ${m.frequency}${m.isOngoing ? ' · در حال مصرف' : ''}`}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Allergies */}
        <TabsContent value="allergies">
          <SectionPanel title="حساسیت‌ها">
            <RecordList
              items={records.allergies}
              emptyTitle="حساسیت ثبت نشده"
              emptyDescription="حساسیت‌های دارویی و غذایی برای ایمنی درمان در این بخش ثبت می‌شوند."
              renderItem={(a) => (
                <RecordRow
                  key={a.id}
                  title={a.title}
                  date={a.date}
                  status={a.status}
                  sourceType={a.sourceType}
                  verificationStatus={a.verificationStatus}
                  provider={a.provider}
                  lastUpdate={a.lastUpdate}
                  subtitle={`${a.allergen} — واکنش: ${a.reaction}`}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Labs */}
        <TabsContent value="labs">
          <SectionPanel title="نتایج آزمایش">
            <RecordList
              items={records.labResults}
              emptyTitle="نتیجه آزمایشی ثبت نشده"
              emptyDescription="نتایج آزمایشگاه پس از دریافت از مراکز طرف قرارداد در اینجا نمایش داده می‌شوند."
              renderItem={(l) => (
                <RecordRow
                  key={l.id}
                  title={l.title}
                  date={l.date}
                  status={l.status}
                  sourceType={l.sourceType}
                  verificationStatus={l.verificationStatus}
                  provider={l.provider ?? l.orderedBy ?? l.labName}
                  lastUpdate={l.lastUpdate}
                  subtitle={`${l.value}${l.unit ? ` ${l.unit}` : ''}${l.referenceRange ? ` (محدوده: ${l.referenceRange})` : ''}${l.flag && l.flag !== 'normal' ? ` — ${l.flag === 'high' ? 'بالا' : l.flag === 'low' ? 'پایین' : 'بحرانی'}` : ''}`}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Imaging */}
        <TabsContent value="imaging">
          <SectionPanel title="تصویربرداری">
            <RecordList
              items={records.imagingRecords}
              emptyTitle="سابقه تصویربرداری ثبت نشده"
              emptyDescription="گزارش‌های رادیولوژی، سونوگرافی، MRI و سایر تصویربرداری‌ها در این بخش قرار می‌گیرند."
              renderItem={(i) => (
                <RecordRow
                  key={i.id}
                  title={i.title}
                  date={i.date}
                  status={i.status}
                  sourceType={i.sourceType}
                  verificationStatus={i.verificationStatus}
                  provider={i.provider ?? i.radiologist ?? i.facility}
                  lastUpdate={i.lastUpdate}
                  subtitle={i.impression ?? i.findings}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Immunizations */}
        <TabsContent value="immunizations">
          <SectionPanel title="واکسیناسیون">
            <RecordList
              items={records.immunizations.filter(
                (i) =>
                  !i.title.includes('کووید') &&
                  !i.vaccineName.toLowerCase().includes('covid')
              )}
              emptyTitle="سابقه واکسیناسیون ثبت نشده"
              emptyDescription="سوابق واکسن‌های دریافتی (به‌جز کووید) در این بخش نمایش داده می‌شوند."
              renderItem={(i) => (
                <RecordRow
                  key={i.id}
                  title={i.title}
                  date={i.date}
                  status={i.status}
                  sourceType={i.sourceType}
                  verificationStatus={i.verificationStatus}
                  provider={i.provider ?? i.administeredBy}
                  lastUpdate={i.lastUpdate}
                  subtitle={
                    i.nextDueDate
                      ? `دوز بعدی: ${formatPersianDate(i.nextDueDate, 'medium')}`
                      : i.vaccineName
                  }
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Screenings */}
        <TabsContent value="screenings">
          <SectionPanel title="غربالگری‌ها و خودارزیابی">
            {screeningResults.length === 0 ? (
              <EmptyState
                title="نتیجه غربالگری ثبت نشده"
                description="پس از انجام خودارزیابی در سامانه، نتایج در این بخش نمایش داده می‌شوند."
                action={
                  <Button asChild size="sm">
                    <Link to="/screenings">شروع خودارزیابی</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {screeningResults.map((r) => (
                  <ScreeningRow key={r.id} result={r} />
                ))}
              </ul>
            )}
          </SectionPanel>
        </TabsContent>

        {/* Procedures / observations */}
        <TabsContent value="procedures">
          <SectionPanel title="اقدامات و اندازه‌گیری‌های پزشکی">
            <RecordList
              items={records.observations}
              emptyTitle="اقدام پزشکی ثبت نشده"
              emptyDescription="علائم حیاتی، اندازه‌گیری‌ها و اقدامات ثبت‌شده در این بخش قرار می‌گیرند."
              renderItem={(o) => (
                <RecordRow
                  key={o.id}
                  title={o.title}
                  date={o.date}
                  status={o.status}
                  sourceType={o.sourceType}
                  verificationStatus={o.verificationStatus}
                  provider={o.provider}
                  lastUpdate={o.lastUpdate}
                  subtitle={`${typeof o.value === 'number' ? toPersianDigits(o.value) : o.value}${o.unit ? ` ${o.unit}` : ''}${o.referenceRange ? ` (مرجع: ${o.referenceRange})` : ''}`}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* Dental */}
        <TabsContent value="dental">
          <SectionPanel title="سلامت دهان و دندان">
            <RecordList
              items={records.dentalRecords}
              emptyTitle="سابقه دندانپزشکی ثبت نشده"
              emptyDescription="معاینات، درمان‌ها و پیگیری‌های دندانپزشکی در این بخش ثبت می‌شوند."
              renderItem={(d) => (
                <RecordRow
                  key={d.id}
                  title={d.title}
                  date={d.date}
                  status={d.status}
                  sourceType={d.sourceType}
                  verificationStatus={d.verificationStatus}
                  provider={d.provider ?? d.dentist}
                  lastUpdate={d.lastUpdate}
                  subtitle={
                    d.nextVisitDate
                      ? `${d.procedure} — ویزیت بعدی: ${formatPersianDate(d.nextVisitDate, 'medium')}`
                      : d.procedure
                  }
                />
              )}
            />
          </SectionPanel>
        </TabsContent>

        {/* COVID */}
        <TabsContent value="covid">
          <SectionPanel title="سوابق کووید-۱۹">
            {covidRecords.vaccines.length === 0 && covidRecords.docs.length === 0 ? (
              <EmptyState
                title="سابقه کووید ثبت نشده"
                description="واکسیناسیون و گواهی‌های مرتبط با کووید-۱۹ در این بخش نمایش داده می‌شوند."
              />
            ) : (
              <ul className="divide-y divide-border">
                {covidRecords.vaccines.map((i) => (
                  <RecordRow
                    key={i.id}
                    title={i.title}
                    date={i.date}
                    status={i.status}
                    sourceType={i.sourceType}
                    verificationStatus={i.verificationStatus}
                    provider={i.provider ?? i.administeredBy}
                    lastUpdate={i.lastUpdate}
                    subtitle={`${i.vaccineName}${i.doseNumber ? ` — دوز ${toPersianDigits(i.doseNumber)}` : ''}`}
                  />
                ))}
                {covidRecords.docs.map((d) => (
                  <RecordRow
                    key={d.id}
                    title={d.title}
                    date={d.date}
                    status={d.status}
                    sourceType={d.sourceType}
                    verificationStatus={d.verificationStatus}
                    lastUpdate={d.lastUpdate}
                    subtitle={d.description}
                  />
                ))}
              </ul>
            )}
          </SectionPanel>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <SectionPanel title="اسناد پزشکی">
            <RecordList
              items={records.documents.filter(
                (d) =>
                  !d.title.includes('کووید') &&
                  !d.description?.includes('کووید')
              )}
              emptyTitle="سندی بارگذاری نشده"
              emptyDescription="گزارش‌ها، نسخه‌ها و سایر اسناد پزشکی بارگذاری‌شده در این بخش قرار می‌گیرند."
              renderItem={(d) => (
                <RecordRow
                  key={d.id}
                  title={d.title}
                  date={d.date}
                  status={d.status}
                  sourceType={d.sourceType}
                  verificationStatus={d.verificationStatus}
                  lastUpdate={d.lastUpdate}
                  subtitle={`${d.documentType} — ${d.fileName}`}
                />
              )}
            />
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function SummaryBlock({
  title,
  count,
  items,
  emptyText,
  highlight,
}: {
  title: string
  count: number
  items: string[]
  emptyText: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        highlight ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/20'
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-navy">{title}</h3>
        <Badge variant="outline">{toPersianDigits(count)}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.slice(0, 3).map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              · {item}
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs text-muted-foreground">
              و {toPersianDigits(items.length - 3)} مورد دیگر…
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
