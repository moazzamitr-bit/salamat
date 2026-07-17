import { AlertTriangle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EMERGENCY_NUMBERS } from '@/lib/constants'

interface EmergencyBannerProps {
  compact?: boolean
}

export function EmergencyBanner({ compact }: EmergencyBannerProps) {
  if (compact) {
    return (
      <a
        href={`tel:${EMERGENCY_NUMBERS.ambulance}`}
        className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        aria-label="تماس با اورژانس ۱۱۵"
      >
        <Phone className="h-4 w-4" />
        اورژانس ۱۱۵
      </a>
    )
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      role="region"
      aria-label="دسترسی اضطراری"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="font-medium text-navy">در شرایط اضطراری</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            برای فوریت‌های پزشکی با اورژانس تماس بگیرید. این سامانه جایگزین خدمات اورژانسی نیست.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="destructive" size="sm">
          <a href={`tel:${EMERGENCY_NUMBERS.ambulance}`}>
            <Phone className="h-4 w-4" />
            اورژانس ۱۱۵
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${EMERGENCY_NUMBERS.mentalHealth}`}>خط سلامت روان</a>
        </Button>
      </div>
    </div>
  )
}
