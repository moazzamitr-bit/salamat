import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Accessibility,
  Clock,
  Filter,
  MapPin,
  Navigation,
  Phone,
  Search,
  Shield,
  Star,
  X,
} from 'lucide-react'
import { healthCenters } from '@/mock-data/centers'
import {
  CENTER_CATEGORY_LABELS,
  DEFAULT_MAP_CENTER,
} from '@/lib/constants'
import {
  cn,
  formatPersianNumber,
  toPersianDigits,
} from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import CentersMap from '@/features/centers/CentersMap'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CenterCategory, DayOfWeek, HealthCenter } from '@/types'

const USER_LAT = DEFAULT_MAP_CENTER.latitude
const USER_LNG = DEFAULT_MAP_CENTER.longitude

const DAY_LABELS: Record<DayOfWeek, string> = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه',
  thursday: 'پنجشنبه',
  friday: 'جمعه',
}

const JS_DAY_TO_WEEKDAY: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function getTodayWeekday(): DayOfWeek {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()]
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function is24HourCenter(center: HealthCenter): boolean {
  return center.operatingHours.every(
    (h) => !h.isClosed && h.open === '00:00' && (h.close === '23:59' || h.close === '24:00')
  )
}

function isOpenNow(center: HealthCenter): boolean {
  const today = getTodayWeekday()
  const hours = center.operatingHours.find((h) => h.day === today)
  if (!hours || hours.isClosed) return false
  if (hours.open === '00:00' && (hours.close === '23:59' || hours.close === '24:00')) return true

  const now = new Date()
  const [openH, openM] = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes
}

function hasAccessibility(center: HealthCenter): boolean {
  return (
    center.isEmergency === true ||
    ['hospital', 'clinic', 'emergency', 'maternal', 'rehabilitation'].includes(center.category)
  )
}

function formatAddress(center: HealthCenter): string {
  const { city, district, street } = center.address
  return [city, district, street].filter(Boolean).join('، ')
}

function mapsUrl(center: HealthCenter): string {
  return `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`
}

interface CenterWithDistance extends HealthCenter {
  distanceKm: number
}

function CenterListItem({
  center,
  selected,
  onSelect,
}: {
  center: CenterWithDistance
  selected: boolean
  onSelect: () => void
}) {
  const open = isOpenNow(center)
  const is24 = is24HourCenter(center)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-4 text-right transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-navy">{center.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
            {formatAddress(center)}
          </p>
        </div>
        {center.rating != null && (
          <span className="flex shrink-0 items-center gap-0.5 text-sm text-warning-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {toPersianDigits(center.rating.toFixed(1))}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{CENTER_CATEGORY_LABELS[center.category]}</Badge>
        <Badge variant={open ? 'success' : 'secondary'}>
          {open ? 'باز است' : 'بسته'}
        </Badge>
        {is24 && <Badge variant="secondary">۲۴ ساعته</Badge>}
        {center.acceptsInsurance && (
          <Badge variant="verified">
            <Shield className="me-1 h-3 w-3" />
            بیمه
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {toPersianDigits(center.distanceKm.toFixed(1))} کیلومتر
        </span>
      </div>
    </button>
  )
}

function CenterDetailPanel({ center, onClose }: { center: HealthCenter; onClose: () => void }) {
  const open = isOpenNow(center)
  const is24 = is24HourCenter(center)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{center.name}</DialogTitle>
          <DialogDescription>{CENTER_CATEGORY_LABELS[center.category]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {center.description && (
            <p className="text-sm text-muted-foreground">{center.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{formatAddress(center)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href={`tel:${center.phone}`} className="text-primary hover:underline">
                {center.phone}
              </a>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-navy">ساعات کاری</p>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant={open ? 'success' : 'secondary'}>
                  {open ? 'هم‌اکنون باز' : 'هم‌اکنون بسته'}
                </Badge>
                {is24 && <Badge variant="secondary">۲۴ ساعته</Badge>}
              </div>
              <ul className="space-y-1 text-sm">
                {center.operatingHours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{DAY_LABELS[h.day]}</span>
                    <span>
                      {h.isClosed
                        ? 'تعطیل'
                        : `${toPersianDigits(h.open)} – ${toPersianDigits(h.close)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-navy">خدمات</p>
            <ul className="space-y-2">
              {center.services.map((svc) => (
                <li
                  key={svc.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{svc.name}</span>
                  {svc.price != null && (
                    <span className="text-muted-foreground">
                      {formatPersianNumber(svc.price)} ریال
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {center.acceptsInsurance && (
              <Badge variant="verified">
                <Shield className="me-1 h-3 w-3" />
                پذیرش بیمه
              </Badge>
            )}
            {hasAccessibility(center) && (
              <Badge variant="outline">
                <Accessibility className="me-1 h-3 w-3" />
                دسترسی wheelchair
              </Badge>
            )}
            {center.isEmergency && <Badge variant="destructive">اورژانس</Badge>}
          </div>

          <Button asChild className="w-full">
            <a href={mapsUrl(center)} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" />
              مسیریابی
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CentersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') as CenterCategory | null

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CenterCategory | 'all'>(categoryParam ?? 'all')
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [hour24Only, setHour24Only] = useState(false)
  const [insuranceOnly, setInsuranceOnly] = useState(false)
  const [accessibilityOnly, setAccessibilityOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const setCategoryFilter = useCallback(
    (cat: CenterCategory | 'all') => {
      setCategory(cat)
      if (cat === 'all') {
        searchParams.delete('category')
      } else {
        searchParams.set('category', cat)
      }
      setSearchParams(searchParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const centersWithDistance = useMemo<CenterWithDistance[]>(
    () =>
      healthCenters.map((c) => ({
        ...c,
        distanceKm: distanceKm(USER_LAT, USER_LNG, c.latitude, c.longitude),
      })),
    []
  )

  const filtered = useMemo(() => {
    let list = [...centersWithDistance]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.includes(q) ||
          c.description?.includes(q) ||
          formatAddress(c).includes(q) ||
          c.services.some((s) => s.name.includes(q))
      )
    }

    if (category !== 'all') {
      list = list.filter((c) => c.category === category)
    }

    if (openNowOnly) list = list.filter(isOpenNow)
    if (hour24Only) list = list.filter(is24HourCenter)
    if (insuranceOnly) list = list.filter((c) => c.acceptsInsurance)
    if (accessibilityOnly) list = list.filter(hasAccessibility)

    return list.sort((a, b) => a.distanceKm - b.distanceKm)
  }, [
    centersWithDistance,
    search,
    category,
    openNowOnly,
    hour24Only,
    insuranceOnly,
    accessibilityOnly,
  ])

  const selectedCenter = selectedId
    ? filtered.find((c) => c.id === selectedId) ?? healthCenters.find((c) => c.id === selectedId)
    : null

  return (
    <div className="page-container">
      <PageHeader
        title="مراکز نزدیک"
        subtitle="جستجو و یافتن بیمارستان، داروخانه، کلینیک و سایر مراکز درمانی"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجوی نام، آدرس یا خدمات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(showFilters && 'border-primary text-primary')}
        >
          <Filter className="h-4 w-4" />
          فیلترها
        </Button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={category === 'all' ? 'default' : 'outline'}
          onClick={() => setCategoryFilter('all')}
        >
          همه
        </Button>
        {(Object.entries(CENTER_CATEGORY_LABELS) as [CenterCategory, string][]).map(
          ([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={category === key ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(key)}
              className="shrink-0"
            >
              {label}
            </Button>
          )
        )}
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>فیلترهای پیشرفته</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowFilters(false)}
                aria-label="بستن فیلترها"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <Label htmlFor="open-now" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4 text-primary" />
                فقط باز
              </Label>
              <Switch id="open-now" checked={openNowOnly} onCheckedChange={setOpenNowOnly} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <Label htmlFor="hour-24" className="cursor-pointer">
                ۲۴ ساعته
              </Label>
              <Switch id="hour-24" checked={hour24Only} onCheckedChange={setHour24Only} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <Label htmlFor="insurance" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4 text-secondary" />
                پذیرش بیمه
              </Label>
              <Switch id="insurance" checked={insuranceOnly} onCheckedChange={setInsuranceOnly} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <Label htmlFor="accessibility" className="flex items-center gap-2 cursor-pointer">
                <Accessibility className="h-4 w-4 text-primary" />
                دسترسی‌پذیر
              </Label>
              <Switch
                id="accessibility"
                checked={accessibilityOnly}
                onCheckedChange={setAccessibilityOnly}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-panel lg:aspect-auto lg:min-h-[480px]">
          <CentersMap
            centers={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            userLocation={{ latitude: USER_LAT, longitude: USER_LNG }}
          />
          <div className="pointer-events-none absolute bottom-4 start-4 z-[1000] rounded-xl bg-white/90 px-3 py-1.5 text-xs shadow-soft backdrop-blur-sm">
            {toPersianDigits(filtered.length)} مرکز
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="مرکزی یافت نشد"
              description="فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید."
              icon={<MapPin className="h-6 w-6" />}
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setCategoryFilter('all')
                    setOpenNowOnly(false)
                    setHour24Only(false)
                    setInsuranceOnly(false)
                    setAccessibilityOnly(false)
                  }}
                >
                  پاک کردن فیلترها
                </Button>
              }
            />
          ) : (
            filtered.map((center) => (
              <CenterListItem
                key={center.id}
                center={center}
                selected={center.id === selectedId}
                onSelect={() => setSelectedId(center.id)}
              />
            ))
          )}
        </div>
      </div>

      {selectedCenter && (
        <CenterDetailPanel center={selectedCenter} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

export default CentersPage
