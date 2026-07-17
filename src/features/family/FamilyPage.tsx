import { useMemo, useState } from 'react'
import {
  Baby,
  Check,
  Heart,
  Plus,
  Shield,
  User,
  UserCircle,
  Users,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { careTeamByPatient } from '@/mock-data/care-team'
import { MAX_FAMILY_MEMBERS } from '@/lib/constants'
import { cn, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FamilyMember, Gender, Profile, RelationshipType } from '@/types'

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'spouse', label: 'همسر' },
  { value: 'child', label: 'فرزند' },
  { value: 'parent', label: 'والد (سالمند)' },
  { value: 'sibling', label: 'خواهر/برادر' },
  { value: 'guardian', label: 'سرپرست' },
  { value: 'other', label: 'سایر' },
]

const ACCESS_LEVELS = [
  { value: 'full', label: 'دسترسی کامل' },
  { value: 'limited', label: 'دسترسی محدود' },
  { value: 'emergency', label: 'فقط اورژانس' },
  { value: 'view', label: 'فقط مشاهده' },
]

function RelationshipIcon({ type }: { type: RelationshipType }) {
  if (type === 'child') return <Baby className="h-5 w-5" />
  if (type === 'spouse') return <Heart className="h-5 w-5" />
  if (type === 'parent') return <UserCircle className="h-5 w-5" />
  return <User className="h-5 w-5" />
}

interface LocalMember extends FamilyMember {
  accessLevel: string
  insurancePlaceholder: string
  healthCenterPlaceholder: string
}

export function FamilyPage() {
  const {
    user,
    activePatientId,
    activePatientName,
    familyMembers,
    setActivePatient,
  } = useAuth()

  const [localMembers, setLocalMembers] = useState<LocalMember[]>(() =>
    familyMembers.map((m) => ({
      ...m,
      accessLevel: m.hasConsent ? 'full' : 'view',
      insurancePlaceholder: 'بیمه تأمین اجتماعی',
      healthCenterPlaceholder: 'کلینیک سلامت ولیعصر',
    }))
  )
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    relationship: 'child' as RelationshipType,
    gender: 'female' as Gender,
    accessLevel: 'limited',
    birthDate: '',
  })

  const allPeople = useMemo(() => {
    if (!user) {
      return [] as Array<{
        id: string
        profile: Profile
        relationshipLabel: string
        isSelf: boolean
        member: LocalMember | null
      }>
    }
    return [
      {
        id: user.profile.id,
        profile: user.profile,
        relationshipLabel: 'خودم',
        isSelf: true,
        member: null,
      },
      ...localMembers.map((m) => ({
        id: m.patientId,
        profile: m.profile,
        relationshipLabel: m.relationshipLabel,
        isSelf: false,
        member: m,
      })),
    ]
  }, [user, localMembers])

  const activeCareTeam = useMemo(
    () => careTeamByPatient(activePatientId),
    [activePatientId]
  )

  const handleAddMember = () => {
    if (!user || !addForm.firstName.trim() || !addForm.lastName.trim()) return
    if (localMembers.length >= MAX_FAMILY_MEMBERS - 1) return

    const newId = `p-local-${Date.now()}`
    const newMember: LocalMember = {
      id: `fm-local-${Date.now()}`,
      ownerId: user.profile.id,
      patientId: newId,
      relationship: addForm.relationship,
      relationshipLabel:
        RELATIONSHIP_OPTIONS.find((r) => r.value === addForm.relationship)?.label ?? 'سایر',
      profile: {
        id: newId,
        userId: `u-local-${Date.now()}`,
        role: 'citizen',
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        fullName: `${addForm.firstName} ${addForm.lastName}`,
        nationalId: addForm.nationalId || '—',
        birthDate: addForm.birthDate || '2000-01-01',
        age: 0,
        gender: addForm.gender,
        phone: '—',
        email: user.profile.email,
        address: user.profile.address,
        preferredLanguage: 'fa',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      hasConsent: false,
      accessLevel: addForm.accessLevel,
      insurancePlaceholder: 'ثبت نشده',
      healthCenterPlaceholder: 'انتخاب نشده',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setLocalMembers((prev) => [...prev, newMember])
    setAddForm({
      firstName: '',
      lastName: '',
      nationalId: '',
      relationship: 'child',
      gender: 'female',
      accessLevel: 'limited',
      birthDate: '',
    })
    setAddOpen(false)
  }

  if (!user) {
    return (
      <div className="page-container">
        <EmptyState
          title="ورود لازم است"
          description="برای مدیریت اعضای خانواده ابتدا وارد سامانه شوید."
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="خانواده من"
        subtitle="مدیریت پروفایل اعضای خانواده — هر پرونده جداگانه نگهداری می‌شود"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button disabled={localMembers.length >= MAX_FAMILY_MEMBERS - 1}>
                <Plus className="h-4 w-4" />
                افزودن عضو
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن عضو خانواده</DialogTitle>
                <DialogDescription>
                  اطلاعات عضو جدید را وارد کنید. پس از تأیید رضایت، دسترسی فعال می‌شود.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">نام</Label>
                    <Input
                      id="firstName"
                      value={addForm.firstName}
                      onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">نام خانوادگی</Label>
                    <Input
                      id="lastName"
                      value={addForm.lastName}
                      onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nationalId">کد ملی</Label>
                  <Input
                    id="nationalId"
                    value={addForm.nationalId}
                    onChange={(e) => setAddForm((f) => ({ ...f, nationalId: e.target.value }))}
                    className="mt-1.5"
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">تاریخ تولد</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={addForm.birthDate}
                    onChange={(e) => setAddForm((f) => ({ ...f, birthDate: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>نسبت</Label>
                    <Select
                      value={addForm.relationship}
                      onValueChange={(v) =>
                        setAddForm((f) => ({ ...f, relationship: v as RelationshipType }))
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>جنسیت</Label>
                    <Select
                      value={addForm.gender}
                      onValueChange={(v) => setAddForm((f) => ({ ...f, gender: v as Gender }))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">زن</SelectItem>
                        <SelectItem value="male">مرد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>سطح دسترسی</Label>
                  <Select
                    value={addForm.accessLevel}
                    onValueChange={(v) => setAddForm((f) => ({ ...f, accessLevel: v }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  انصراف
                </Button>
                <Button onClick={handleAddMember}>افزودن</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 rounded-xl border-2 border-primary bg-primary/5 p-4">
        <p className="text-sm text-muted-foreground">پرونده فعال</p>
        <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-primary">
          <Check className="h-5 w-5" />
          {activePatientName}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          تمام بخش‌های سامانه (پرونده، نوبت، یادآوری و...) فقط برای این شخص نمایش داده می‌شود.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {allPeople.map((person) => {
          const isActive = person.id === activePatientId
          const member = person.member

          return (
            <button
              key={person.id}
              type="button"
              onClick={() => setActivePatient(person.id)}
              className={cn(
                'rounded-xl border p-4 text-right transition-all',
                isActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/25'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {person.isSelf ? (
                    <User className="h-5 w-5" />
                  ) : member ? (
                    <RelationshipIcon type={member.relationship} />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{person.profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">{person.relationshipLabel}</p>
                  {isActive && (
                    <Badge variant="default" className="mt-2">
                      انتخاب‌شده
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {localMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{member.profile.fullName}</CardTitle>
                  <CardDescription>{member.relationshipLabel}</CardDescription>
                </div>
                <Badge variant={member.hasConsent ? 'success' : 'pending'}>
                  {member.hasConsent ? 'رضایت فعال' : 'در انتظار رضایت'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="data-row border-0 py-0">
                <span className="text-muted-foreground">سطح دسترسی</span>
                <span>
                  {ACCESS_LEVELS.find((a) => a.value === member.accessLevel)?.label ??
                    member.accessLevel}
                </span>
              </div>
              <div className="data-row border-0 py-0">
                <span className="text-muted-foreground">بیمه</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {member.insurancePlaceholder}
                </span>
              </div>
              <div className="data-row border-0 py-0">
                <span className="text-muted-foreground">مرکز سلامت</span>
                <span>{member.healthCenterPlaceholder}</span>
              </div>
              <div className="data-row border-0 py-0">
                <span className="text-muted-foreground">کد ملی</span>
                <span>{member.profile.nationalId}</span>
              </div>
              {member.profile.age > 0 && (
                <div className="data-row border-0 py-0">
                  <span className="text-muted-foreground">سن</span>
                  <span>{toPersianDigits(member.profile.age)} سال</span>
                </div>
              )}
              <Button
                variant={member.patientId === activePatientId ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setActivePatient(member.patientId)}
              >
                {member.patientId === activePatientId
                  ? 'پرونده فعال'
                  : 'مشاهده پرونده این شخص'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeCareTeam.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-navy">
            تیم سلامت — {activePatientName}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeCareTeam.map((provider) => (
              <Card key={provider.id}>
                <CardContent className="pt-4">
                  <p className="font-medium text-navy">{provider.providerName}</p>
                  <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{provider.organization}</p>
                  {provider.isPrimary && (
                    <Badge variant="secondary" className="mt-2">
                      پزشک اصلی
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        حداکثر {toPersianDigits(MAX_FAMILY_MEMBERS)} عضو — {toPersianDigits(localMembers.length + 1)}/
        {toPersianDigits(MAX_FAMILY_MEMBERS)} ثبت‌شده
      </p>
    </div>
  )
}

export default FamilyPage
