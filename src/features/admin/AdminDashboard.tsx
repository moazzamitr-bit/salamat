import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileText,
  Megaphone,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { healthCenters, screenings } from '@/mock-data'
import { CENTER_CATEGORY_LABELS } from '@/lib/constants'
import { cn, formatPersianDate, toPersianDigits } from '@/lib/utils'

type AdminSection =
  | 'users'
  | 'teams'
  | 'centers'
  | 'education'
  | 'screenings'
  | 'campaigns'
  | 'announcements'
  | 'providers'
  | 'roles'
  | 'audit'
  | 'ai-sources'
  | 'emergency'

const SECTIONS: { id: AdminSection; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'teams', label: 'تیم‌های سلامت', icon: Stethoscope },
  { id: 'centers', label: 'مراکز سلامت', icon: Building2 },
  { id: 'education', label: 'محتوای آموزشی', icon: BookOpen },
  { id: 'screenings', label: 'غربالگری‌ها', icon: ClipboardCheck },
  { id: 'campaigns', label: 'پویش‌ها', icon: Megaphone },
  { id: 'announcements', label: 'اطلاعیه‌ها', icon: Bell },
  { id: 'providers', label: 'ارائه‌دهندگان', icon: Building2 },
  { id: 'roles', label: 'نقش‌ها و دسترسی', icon: Shield },
  { id: 'audit', label: 'گزارش ممیزی', icon: FileText },
  { id: 'ai-sources', label: 'منابع محتوای AI', icon: Sparkles },
  { id: 'emergency', label: 'پیام‌های اضطراری', icon: Bell },
]

const MOCK_USERS = [
  { id: 'u1', name: 'سارا محمدی', email: 'sara.mohammadi@demo.selfcare.ir', role: 'شهروند', status: 'فعال' },
  { id: 'u2', name: 'دکتر علی رضایی', email: 'dr.rezaei@demo.selfcare.ir', role: 'تیم سلامت', status: 'فعال' },
  { id: 'u3', name: 'مدیر سامانه', email: 'admin@demo.selfcare.ir', role: 'مدیر', status: 'فعال' },
  { id: 'u4', name: 'مهسا رحمانی', email: 'mahsa.rahmani@demo.selfcare.ir', role: 'ارائه‌دهنده', status: 'فعال' },
  { id: 'u5', name: 'رضا محمدی', email: 'reza.mohammadi@demo.selfcare.ir', role: 'شهروند', status: 'غیرفعال' },
]

const MOCK_TEAMS = [
  { id: 't1', name: 'تیم مراقبت ولیعصر', lead: 'دکتر علی رضایی', members: 8, patients: 142 },
  { id: 't2', name: 'تیم دیابت امام', lead: 'دکتر حسین نوری', members: 5, patients: 89 },
  { id: 't3', name: 'تیم اطفال مهر', lead: 'دکتر زهرا موسوی', members: 4, patients: 56 },
]

const MOCK_CAMPAIGNS = [
  { id: 'c1', title: 'واکسیناسیون آنفولانزا ۱۴۰۴', status: 'فعال', reach: 12500 },
  { id: 'c2', title: 'هفته سلامت روان', status: 'برنامه‌ریزی', reach: 0 },
  { id: 'c3', title: 'غربالگری سرطان پستان', status: 'در جریان', reach: 3200 },
]

const MOCK_ANNOUNCEMENTS = [
  { id: 'a1', title: 'به‌روزرسانی سامانه — ۱۵ تیر', audience: 'همه', publishedAt: '2025-07-06T08:00:00.000Z' },
  { id: 'a2', title: 'تعطیلات رسمی مراکز', audience: 'شهروندان', publishedAt: '2025-06-28T10:00:00.000Z' },
]

const MOCK_PROVIDERS = [
  { id: 'pr1', name: 'کلینیک سلامت ولیعصر', type: 'کلینیک', verified: true },
  { id: 'pr2', name: 'آزمایشگاه پارس', type: 'آزمایشگاه', verified: true },
  { id: 'pr3', name: 'مرکز تغذیه سالم', type: 'کلینیک', verified: false },
]

const MOCK_ROLES = [
  { id: 'r1', name: 'شهروند', permissions: 'پرونده شخصی، نوبت، خودارزیابی' },
  { id: 'r2', name: 'تیم سلامت', permissions: 'مشاهده بیماران تحت پوشش، پیام، تأیید' },
  { id: 'r3', name: 'مدیر', permissions: 'مدیریت کاربران، محتوا، پیکربندی' },
  { id: 'r4', name: 'ارائه‌دهنده', permissions: 'نوبت، پیام محدود' },
]

const MOCK_AUDIT = [
  { id: 'log1', action: 'ورود', user: 'admin@demo.selfcare.ir', at: '2025-07-17T08:00:00.000Z' },
  { id: 'log2', action: 'ویرایش محتوا', user: 'admin@demo.selfcare.ir', at: '2025-07-16T14:30:00.000Z' },
  { id: 'log3', action: 'صدور اطلاعیه', user: 'admin@demo.selfcare.ir', at: '2025-07-15T09:00:00.000Z' },
  { id: 'log4', action: 'غیرفعال‌سازی کاربر', user: 'admin@demo.selfcare.ir', at: '2025-07-14T11:00:00.000Z' },
]

const MOCK_AI_SOURCES = [
  { id: 'ai1', name: 'راهنمای WHO — فشار خون', type: 'رسمی', lastSync: '2025-07-10T00:00:00.000Z' },
  { id: 'ai2', name: 'پروتکل ملی دیابت', type: 'داخلی', lastSync: '2025-06-01T00:00:00.000Z' },
  { id: 'ai3', name: 'FAQ سامانه', type: 'داخلی', lastSync: '2025-07-01T00:00:00.000Z' },
]

const MOCK_EMERGENCY = [
  { id: 'e1', title: 'هشدار گرما — تهران', message: 'مصرف مایعات را افزایش دهید.', active: true },
  { id: 'e2', title: 'قطعی برق بیمارستان X', message: 'از مراکز جایگزین استفاده کنید.', active: false },
]

function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | ReactNode)[][]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-right font-medium text-navy">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterOptions,
}: {
  search: string
  onSearchChange: (v: string) => void
  filter: string
  onFilterChange: (v: string) => void
  filterOptions: { value: string; label: string }[]
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        placeholder="جستجو..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
      >
        {filterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('users')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.includes(search) ||
        u.email.includes(search) ||
        u.role.includes(search)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.status === 'فعال') ||
        (statusFilter === 'inactive' && u.status === 'غیرفعال')
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const filteredCenters = useMemo(() => {
    return healthCenters.filter(
      (c) =>
        !search ||
        c.name.includes(search) ||
        CENTER_CATEGORY_LABELS[c.category]?.includes(search) ||
        c.address.city.includes(search)
    )
  }, [search])

  return (
    <div className="page-container">
      <PageHeader
        title="پنل مدیریت سامانه"
        subtitle="عملیات مدیریتی — کاربران، محتوا، پیکربندی و گزارش‌ها"
        actions={
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            دسترسی مدیر
          </Badge>
        }
      />

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as AdminSection)}>
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 p-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="gap-1.5 text-xs sm:text-sm">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="users">
          <SectionToolbar
            search={search}
            onSearchChange={setSearch}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[
              { value: 'all', label: 'همه وضعیت‌ها' },
              { value: 'active', label: 'فعال' },
              { value: 'inactive', label: 'غیرفعال' },
            ]}
          />
          <DataTable
            headers={['نام', 'ایمیل', 'نقش', 'وضعیت', 'عملیات']}
            rows={filteredUsers.map((u) => [
              u.name,
              u.email,
              u.role,
              <Badge key={u.id} variant={u.status === 'فعال' ? 'default' : 'outline'}>
                {u.status}
              </Badge>,
              <Button key={`btn-${u.id}`} size="sm" variant="ghost">
                ویرایش
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="teams">
          <SectionToolbar
            search={search}
            onSearchChange={setSearch}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[{ value: 'all', label: 'همه' }]}
          />
          <DataTable
            headers={['نام تیم', 'سرپرست', 'اعضا', 'بیماران', 'عملیات']}
            rows={MOCK_TEAMS.filter((t) => !search || t.name.includes(search)).map((t) => [
              t.name,
              t.lead,
              toPersianDigits(t.members),
              toPersianDigits(t.patients),
              <Button key={t.id} size="sm" variant="ghost">
                مدیریت
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="centers">
          <SectionToolbar
            search={search}
            onSearchChange={setSearch}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[{ value: 'all', label: 'همه دسته‌ها' }]}
          />
          <DataTable
            headers={['نام مرکز', 'دسته', 'شهر', 'تلفن', 'عملیات']}
            rows={filteredCenters.slice(0, 10).map((c) => [
              c.name,
              CENTER_CATEGORY_LABELS[c.category] ?? c.category,
              c.address.city,
              c.phone,
              <Button key={c.id} size="sm" variant="ghost">
                ویرایش
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="education">
          <p className="mb-4 text-sm text-muted-foreground">
            مدیریت مقالات آموزشی — بدون نمایش محتوای بالینی کامل
          </p>
          <DataTable
            headers={['عنوان', 'دسته', 'وضعیت', 'عملیات']}
            rows={[
              ['رژیم فشار خون', 'تغذیه', 'منتشر شده', 'ویرایش'],
              ['پیاده‌روی روزانه', 'فعالیت بدنی', 'منتشر شده', 'ویرایش'],
              ['مدیریت دیابت', 'بیماری مزمن', 'پیش‌نویس', 'ویرایش'],
            ]}
          />
        </TabsContent>

        <TabsContent value="screenings">
          <DataTable
            headers={['عنوان', 'دسته', 'مدت (دقیقه)', 'فعال', 'عملیات']}
            rows={screenings.map((s) => [
              s.title,
              s.category,
              toPersianDigits(s.estimatedMinutes),
              s.isActive ? 'بله' : 'خیر',
              <Button key={s.id} size="sm" variant="ghost">
                پیکربندی
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="campaigns">
          <DataTable
            headers={['عنوان', 'وضعیت', 'پوشش', 'عملیات']}
            rows={MOCK_CAMPAIGNS.map((c) => [
              c.title,
              c.status,
              toPersianDigits(c.reach),
              <Button key={c.id} size="sm" variant="ghost">
                جزئیات
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <DataTable
            headers={['عنوان', 'مخاطب', 'تاریخ انتشار', 'عملیات']}
            rows={MOCK_ANNOUNCEMENTS.map((a) => [
              a.title,
              a.audience,
              formatPersianDate(a.publishedAt, 'medium'),
              <Button key={a.id} size="sm" variant="ghost">
                ویرایش
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="providers">
          <SectionToolbar
            search={search}
            onSearchChange={setSearch}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[
              { value: 'all', label: 'همه' },
              { value: 'verified', label: 'تأیید شده' },
              { value: 'pending', label: 'در انتظار' },
            ]}
          />
          <DataTable
            headers={['نام', 'نوع', 'تأیید', 'عملیات']}
            rows={MOCK_PROVIDERS.filter((p) => !search || p.name.includes(search)).map((p) => [
              p.name,
              p.type,
              p.verified ? 'تأیید شده' : 'در انتظار',
              <Button key={p.id} size="sm" variant="ghost">
                بررسی
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="roles">
          <DataTable
            headers={['نقش', 'دسترسی‌ها', 'عملیات']}
            rows={MOCK_ROLES.map((r) => [
              r.name,
              r.permissions,
              <Button key={r.id} size="sm" variant="ghost">
                ویرایش
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="audit">
          <DataTable
            headers={['عملیات', 'کاربر', 'زمان', 'جزئیات']}
            rows={MOCK_AUDIT.map((l) => [
              l.action,
              l.user,
              formatPersianDate(l.at, 'datetime'),
              <Button key={l.id} size="sm" variant="ghost">
                مشاهده
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="ai-sources">
          <DataTable
            headers={['منبع', 'نوع', 'آخرین همگام‌سازی', 'عملیات']}
            rows={MOCK_AI_SOURCES.map((s) => [
              s.name,
              s.type,
              formatPersianDate(s.lastSync, 'medium'),
              <Button key={s.id} size="sm" variant="ghost">
                همگام‌سازی
              </Button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="emergency">
          <div className="space-y-3">
            {MOCK_EMERGENCY.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'rounded-xl border p-4',
                  msg.active ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-white'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-navy">{msg.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{msg.message}</p>
                  </div>
                  <Badge variant={msg.active ? 'destructive' : 'outline'}>
                    {msg.active ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="mt-3">
                  {msg.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
