import { useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  BellOff,
  Calendar,
  Check,
  Clock,
  FlaskConical,
  HeartPulse,
  MoreVertical,
  Pencil,
  Pill,
  Ruler,
  Syringe,
  Trash2,
  ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { reminders as mockReminders } from '@/mock-data/reminders'
import { cn, formatPersianDate, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Reminder, ReminderType } from '@/types'

/** UI reminder type labels — maps mock types to user-facing categories. */
const REMINDER_TYPE_LABELS: Record<string, string> = {
  medication: 'دارو',
  appointment: 'نوبت',
  vaccination: 'واکسن',
  screening: 'غربالگری',
  lab: 'آزمایش',
  lab_followup: 'آزمایش',
  activity: 'فعالیت',
  custom: 'فعالیت',
  measurement: 'اندازه‌گیری',
  followup: 'پیگیری',
}

const REMINDER_TYPE_ICONS: Record<string, typeof Pill> = {
  medication: Pill,
  appointment: Calendar,
  vaccination: Syringe,
  screening: ClipboardCheck,
  lab: FlaskConical,
  lab_followup: FlaskConical,
  activity: Activity,
  custom: Activity,
  measurement: Ruler,
  followup: HeartPulse,
}

function getTypeLabel(type: ReminderType): string {
  return REMINDER_TYPE_LABELS[type] ?? type
}

function getTypeIcon(type: ReminderType) {
  return REMINDER_TYPE_ICONS[type] ?? Bell
}

function getHourFromIso(iso: string): number {
  return new Date(iso).getHours()
}

function getDayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const WEEKDAY_LABELS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

function getWeekDays(baseDate = new Date()): { key: string; label: string; date: Date }[] {
  const day = baseDate.getDay()
  const saturdayOffset = (day + 1) % 7
  const saturday = new Date(baseDate)
  saturday.setDate(baseDate.getDate() - saturdayOffset)
  saturday.setHours(0, 0, 0, 0)

  return WEEKDAY_LABELS.map((label, i) => {
    const date = new Date(saturday)
    date.setDate(saturday.getDate() + i)
    return {
      key: getDayKey(date.toISOString()),
      label,
      date,
    }
  })
}

interface ReminderItemProps {
  reminder: Reminder
  snoozed?: boolean
  onSnooze: () => void
  onComplete: () => void
  onEdit: () => void
  onDelete: () => void
}

function ReminderItem({
  reminder,
  snoozed,
  onSnooze,
  onComplete,
  onEdit,
  onDelete,
}: ReminderItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = getTypeIcon(reminder.type)

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-4 transition-colors',
        reminder.isCompleted ? 'border-border/60 opacity-70' : 'border-border hover:border-primary/30',
        snoozed && 'border-warning/40 bg-warning/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            reminder.isCompleted ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={cn(
                  'font-medium text-navy',
                  reminder.isCompleted && 'line-through'
                )}
              >
                {reminder.title}
              </p>
              {reminder.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{reminder.description}</p>
              )}
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="عملیات"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="بستن منو"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute end-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border border-border bg-white py-1 shadow-panel">
                    {!reminder.isCompleted && (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            onSnooze()
                            setMenuOpen(false)
                          }}
                        >
                          <Clock className="h-4 w-4" />
                          تعویق ۱ ساعت
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => {
                            onComplete()
                            setMenuOpen(false)
                          }}
                        >
                          <Check className="h-4 w-4" />
                          انجام شد
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => {
                        onEdit()
                        setMenuOpen(false)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        onDelete()
                        setMenuOpen(false)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatPersianDate(reminder.scheduledAt, 'time')}
            </span>
            {reminder.isRecurring && (
              <Badge variant="secondary" className="text-xs">
                تکرارشونده
              </Badge>
            )}
            {snoozed && (
              <Badge variant="warning" className="text-xs">
                به تعویق افتاده
              </Badge>
            )}
            {reminder.isCompleted && reminder.completedAt && (
              <span className="text-xs text-success">
                انجام شده — {formatPersianDate(reminder.completedAt, 'datetime')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RemindersPage() {
  const { activePatientId, activePatientName } = useAuth()
  const [items, setItems] = useState<Reminder[]>(mockReminders)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily')
  const [listTab, setListTab] = useState<'upcoming' | 'completed'>('upcoming')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [snoozedIds, setSnoozedIds] = useState<Set<string>>(new Set())
  const [editTarget, setEditTarget] = useState<Reminder | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', time: '' })

  const patientReminders = useMemo(
    () => items.filter((r) => r.patientId === activePatientId),
    [items, activePatientId]
  )

  const upcoming = useMemo(
    () =>
      patientReminders
        .filter((r) => !r.isCompleted)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [patientReminders]
  )

  const completed = useMemo(
    () =>
      patientReminders
        .filter((r) => r.isCompleted)
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? b.scheduledAt).getTime() -
            new Date(a.completedAt ?? a.scheduledAt).getTime()
        ),
    [patientReminders]
  )

  const weekDays = useMemo(() => getWeekDays(), [])

  const timelineHours = Array.from({ length: 15 }, (_, i) => i + 6)

  const handleSnooze = (id: string) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const newTime = new Date(r.scheduledAt)
        newTime.setHours(newTime.getHours() + 1)
        return { ...r, scheduledAt: newTime.toISOString(), updatedAt: new Date().toISOString() }
      })
    )
    setSnoozedIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setSnoozedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 5000)
  }

  const handleComplete = (id: string) => {
    const now = new Date().toISOString()
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isCompleted: true, completedAt: now, updatedAt: now } : r
      )
    )
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id))
    setDeleteTarget(null)
  }

  const openEdit = (reminder: Reminder) => {
    setEditTarget(reminder)
    setEditForm({
      title: reminder.title,
      description: reminder.description ?? '',
      time: formatPersianDate(reminder.scheduledAt, 'time'),
    })
  }

  const saveEdit = () => {
    if (!editTarget) return
    setItems((prev) =>
      prev.map((r) =>
        r.id === editTarget.id
          ? {
              ...r,
              title: editForm.title,
              description: editForm.description,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    )
    setEditTarget(null)
  }


  return (
    <div className="page-container">
      <PageHeader
        title="یادآوری‌ها"
        subtitle={`مدیریت یادآوری‌های ${activePatientName}`}
        actions={
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="notif-toggle" className="cursor-pointer text-sm">
              اعلان‌ها
            </Label>
            <Switch
              id="notif-toggle"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        }
      />

      {!notificationsEnabled && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <BellOff className="h-4 w-4 shrink-0 text-warning-foreground" />
          اعلان‌های push غیرفعال است. یادآوری‌ها فقط در برنامه نمایش داده می‌شوند.
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <Button
          variant={viewMode === 'daily' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('daily')}
        >
          <Clock className="h-4 w-4" />
          نمای روزانه
        </Button>
        <Button
          variant={viewMode === 'weekly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('weekly')}
        >
          <Calendar className="h-4 w-4" />
          نمای هفتگی
        </Button>
      </div>

      {viewMode === 'daily' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">جدول زمانی امروز</CardTitle>
            <CardDescription>{formatPersianDate(new Date(), 'long')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {timelineHours.map((hour) => {
                const hourReminders = upcoming.filter(
                  (r) => getHourFromIso(r.scheduledAt) === hour
                )
                return (
                  <div key={hour} className="flex gap-4 border-b border-border/50 py-2 last:border-0">
                    <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                      {toPersianDigits(hour.toString().padStart(2, '0'))}:۰۰
                    </span>
                    <div className="min-h-[2rem] flex-1 space-y-2">
                      {hourReminders.length === 0 ? (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      ) : (
                        hourReminders.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5 text-sm"
                          >
                            {(() => {
                              const Icon = getTypeIcon(r.type)
                              return <Icon className="h-3.5 w-3.5 text-primary" />
                            })()}
                            <span className="font-medium text-navy">{r.title}</span>
                            <Badge variant="outline" className="ms-auto text-xs">
                              {getTypeLabel(r.type)}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'weekly' && (
        <Card className="mb-6 overflow-x-auto">
          <CardHeader>
            <CardTitle className="text-base">نمای هفتگی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid min-w-[640px] grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayReminders = upcoming.filter(
                  (r) => getDayKey(r.scheduledAt) === day.key
                )
                const isToday = getDayKey(new Date().toISOString()) === day.key
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'rounded-xl border p-3',
                      isToday ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <p className={cn('text-sm font-medium', isToday ? 'text-primary' : 'text-navy')}>
                      {day.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPersianDate(day.date, 'short')}
                    </p>
                    <div className="mt-2 space-y-1">
                      {dayReminders.length === 0 ? (
                        <p className="text-xs text-muted-foreground/50">—</p>
                      ) : (
                        dayReminders.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-lg bg-muted/70 px-2 py-1 text-xs text-navy"
                          >
                            {formatPersianDate(r.scheduledAt, 'time')} — {r.title}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={listTab} onValueChange={(v) => setListTab(v as 'upcoming' | 'completed')}>
        <TabsList>
          <TabsTrigger value="upcoming">
            پیش‌رو ({toPersianDigits(upcoming.length)})
          </TabsTrigger>
          <TabsTrigger value="completed">
            انجام‌شده ({toPersianDigits(completed.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              title="یادآوری پیش‌رو ندارید"
              description="یادآوری‌های جدید از پرونده سلامت یا نوبت‌ها اضافه می‌شوند."
              icon={<Bell className="h-6 w-6" />}
            />
          ) : (
            upcoming.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                snoozed={snoozedIds.has(r.id)}
                onSnooze={() => handleSnooze(r.id)}
                onComplete={() => handleComplete(r.id)}
                onEdit={() => openEdit(r)}
                onDelete={() => setDeleteTarget(r)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-3">
          {completed.length === 0 ? (
            <EmptyState
              title="یادآوری انجام‌شده‌ای نیست"
              description="پس از تکمیل یادآوری‌ها، اینجا نمایش داده می‌شوند."
              icon={<Check className="h-6 w-6" />}
            />
          ) : (
            completed.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                onSnooze={() => {}}
                onComplete={() => {}}
                onEdit={() => openEdit(r)}
                onDelete={() => setDeleteTarget(r)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش یادآوری</DialogTitle>
            <DialogDescription>عنوان و توضیحات یادآوری را ویرایش کنید</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">عنوان</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">توضیحات</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div>
              <Label>ساعت</Label>
              <Input value={editForm.time} disabled className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                تغییر زمان از طریق «تعویق» یا تنظیمات تکرار امکان‌پذیر است.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              انصراف
            </Button>
            <Button onClick={saveEdit}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف یادآوری</DialogTitle>
            <DialogDescription>
              آیا از حذف «{deleteTarget?.title}» اطمینان دارید؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RemindersPage
