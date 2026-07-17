import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileHeart, Filter, User } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { cn, formatPersianDate } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { AuditAction, UserRole } from '@/types'

interface AccessLogEntry {
  id: string
  viewerName: string
  viewerRole: UserRole
  viewerOrganization?: string
  accessedAt: string
  purpose: string
  dataSection: string
  action: AuditAction
}

const MOCK_ACCESS_LOG: AccessLogEntry[] = [
  {
    id: 'audit-1',
    viewerName: 'دکتر علی رضایی',
    viewerRole: 'care_team',
    viewerOrganization: 'کلینیک سلامت ولیعصر',
    accessedAt: '2025-07-15T09:30:00.000Z',
    purpose: 'ویزیت دوره‌ای',
    dataSection: 'داروها و آلرژی‌ها',
    action: 'read',
  },
  {
    id: 'audit-2',
    viewerName: 'دکتر علی رضایی',
    viewerRole: 'care_team',
    viewerOrganization: 'کلینیک سلامت ولیعصر',
    accessedAt: '2025-07-10T14:15:00.000Z',
    purpose: 'بررسی نتایج آزمایش',
    dataSection: 'آزمایش‌ها',
    action: 'read',
  },
  {
    id: 'audit-3',
    viewerName: 'مهسا رحمانی',
    viewerRole: 'care_team',
    viewerOrganization: 'مرکز تغذیه سالم',
    accessedAt: '2025-07-05T11:00:00.000Z',
    purpose: 'مشاوره تغذیه',
    dataSection: 'علائم حیاتی و BMI',
    action: 'read',
  },
  {
    id: 'audit-4',
    viewerName: 'سارا محمدی',
    viewerRole: 'citizen',
    accessedAt: '2025-07-01T08:45:00.000Z',
    purpose: 'مشاهده شخصی',
    dataSection: 'پرونده کامل',
    action: 'read',
  },
  {
    id: 'audit-5',
    viewerName: 'سیستم یکپارچه',
    viewerRole: 'admin',
    viewerOrganization: 'سامانه خودمراقبتی',
    accessedAt: '2025-06-28T16:20:00.000Z',
    purpose: 'همگام‌سازی نتایج آزمایش',
    dataSection: 'آزمایش‌ها',
    action: 'create',
  },
  {
    id: 'audit-6',
    viewerName: 'دکتر علی رضایی',
    viewerRole: 'care_team',
    viewerOrganization: 'کلینیک سلامت ولیعصر',
    accessedAt: '2025-06-20T10:00:00.000Z',
    purpose: 'ثبت نسخه جدید',
    dataSection: 'داروها',
    action: 'update',
  },
  {
    id: 'audit-7',
    viewerName: 'رضا محمدی',
    viewerRole: 'citizen',
    accessedAt: '2025-06-15T19:30:00.000Z',
    purpose: 'دسترسی خانوادگی — اورژانس',
    dataSection: 'اطلاعات تماس و آلرژی',
    action: 'read',
  },
]

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'شهروند',
  care_team: 'تیم مراقبت',
  admin: 'مدیر سامانه',
  provider: 'ارائه‌دهنده',
}

const ACTION_LABELS: Record<AuditAction, string> = {
  read: 'مشاهده',
  create: 'ثبت',
  update: 'ویرایش',
  delete: 'حذف',
  verify: 'تأیید',
  reject: 'رد',
  export: 'خروجی',
  login: 'ورود',
  logout: 'خروج',
}

export function AccessHistoryPage() {
  const { user, activePatientName } = useAuth()
  const [filter, setFilter] = useState<'all' | 'care_team' | 'self'>('all')

  const entries = useMemo(() => {
    let list = [...MOCK_ACCESS_LOG]
    if (filter === 'care_team') {
      list = list.filter((e) => e.viewerRole === 'care_team')
    } else if (filter === 'self') {
      list = list.filter((e) => e.viewerRole === 'citizen')
    }
    return list.sort(
      (a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
    )
  }, [filter])

  if (!user) {
    return (
      <div className="page-container">
        <EmptyState title="ورود لازم است" description="برای مشاهده تاریخچه دسترسی وارد شوید." />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="تاریخچه دسترسی"
        subtitle={`ثبت مشاهده و دسترسی به پرونده ${activePatientName}`}
        breadcrumb={[
          { label: 'پروفایل', href: '/profile' },
          { label: 'تاریخچه دسترسی' },
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          <Filter className="h-4 w-4" />
          همه
        </Button>
        <Button
          size="sm"
          variant={filter === 'care_team' ? 'default' : 'outline'}
          onClick={() => setFilter('care_team')}
        >
          تیم درمان
        </Button>
        <Button
          size="sm"
          variant={filter === 'self' ? 'default' : 'outline'}
          onClick={() => setFilter('self')}
        >
          خودم / خانواده
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="رکوردی یافت نشد"
          description="هنوز دسترسی‌ای در این فیلتر ثبت نشده است."
          icon={<Eye className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {entry.viewerRole === 'care_team' ? (
                        <FileHeart className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-navy">{entry.viewerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {ROLE_LABELS[entry.viewerRole]}
                        {entry.viewerOrganization && ` — ${entry.viewerOrganization}`}
                      </p>
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">هدف: </span>
                        {entry.purpose}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">بخش داده: </span>
                        {entry.dataSection}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span className="text-sm text-muted-foreground">
                      {formatPersianDate(entry.accessedAt, 'datetime')}
                    </span>
                    <Badge
                      variant={entry.action === 'read' ? 'outline' : 'secondary'}
                      className={cn(entry.action === 'update' && 'bg-warning/15')}
                    >
                      {ACTION_LABELS[entry.action]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link to="/profile">بازگشت به پروفایل</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        این گزارش برای شفافیت و امنیت پرونده سلامت نگهداری می‌شود.
      </p>
    </div>
  )
}

export default AccessHistoryPage
