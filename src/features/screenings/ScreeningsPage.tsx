import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Apple,
  Baby,
  Brain,
  ChevronLeft,
  Heart,
  Moon,
  Scale,
  Stethoscope,
} from 'lucide-react'
import { screenings } from '@/mock-data/screenings'
import { toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ScreeningCategory } from '@/types'

const CATEGORY_META: Record<
  ScreeningCategory,
  { icon: typeof Scale; route: string; color: string }
> = {
  bmi: { icon: Scale, route: '/screenings/bmi', color: 'text-primary bg-primary/10' },
  cardiovascular: {
    icon: Heart,
    route: '/screenings/cardiovascular',
    color: 'text-destructive bg-destructive/10',
  },
  diabetes: {
    icon: Stethoscope,
    route: '/screenings/diabetes',
    color: 'text-warning-foreground bg-warning/20',
  },
  gestational_diabetes: {
    icon: Baby,
    route: '/screenings/gestational-diabetes',
    color: 'text-secondary bg-secondary/10',
  },
  mental_health: {
    icon: Brain,
    route: '/screenings/mental-health',
    color: 'text-purple-600 bg-purple-100',
  },
  sleep: { icon: Moon, route: '/screenings/sleep', color: 'text-indigo-600 bg-indigo-100' },
  nutrition: { icon: Apple, route: '/screenings/nutrition', color: 'text-success bg-success/10' },
  activity: {
    icon: Activity,
    route: '/screenings/activity',
    color: 'text-orange-600 bg-orange-100',
  },
}

/** Display order for screening tools on the list page. */
const DISPLAY_ORDER: ScreeningCategory[] = [
  'bmi',
  'cardiovascular',
  'diabetes',
  'gestational_diabetes',
  'mental_health',
  'sleep',
  'nutrition',
  'activity',
]

export function ScreeningsPage() {
  const ordered = DISPLAY_ORDER.map((cat) => screenings.find((s) => s.category === cat)).filter(
    Boolean
  ) as typeof screenings

  return (
    <div className="page-container">
      <PageHeader
        title="خودارزیابی سلامت"
        subtitle="ابزارهای غربالگری و ارزیابی — جایگزین تشخیص پزشکی نیستند"
      />

      <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-navy">
        <strong>توجه:</strong> نتایج این ابزارها صرفاً برای آگاهی‌بخشی است و تشخیص پزشکی محسوب
        نمی‌شود. در صورت نگرانی، با تیم سلامت خود مشورت کنید.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((screening) => {
          const meta = CATEGORY_META[screening.category]
          const Icon = meta.icon
          return (
            <Link key={screening.id} to={meta.route} className="group block">
              <Card className="h-full transition-shadow hover:shadow-panel">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">
                      {toPersianDigits(screening.estimatedMinutes)} دقیقه
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 group-hover:text-primary">{screening.title}</CardTitle>
                  <CardDescription>{screening.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {screening.targetAudience && (
                    <p className="text-xs text-muted-foreground">
                      مخاطب: {screening.targetAudience}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    شروع ارزیابی
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ScreeningsPage
