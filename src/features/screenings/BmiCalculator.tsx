import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Scale } from 'lucide-react'
import { calculateBMI } from '@/mock-data/screenings'
import { cn, toEnglishDigits, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese'

const BMI_CATEGORIES: Record<
  BmiCategory,
  { label: string; description: string; color: string }
> = {
  underweight: {
    label: 'کم‌وزن',
    description: 'BMI کمتر از ۱۸.۵ — ممکن است نیاز به بررسی تغذیه داشته باشید.',
    color: 'border-blue-300 bg-blue-50 text-blue-800',
  },
  normal: {
    label: 'طبیعی',
    description: 'BMI بین ۱۸.۵ تا ۲۴.۹ — در محدوده وزن سالم.',
    color: 'border-success/40 bg-success/10 text-success',
  },
  overweight: {
    label: 'اضافه وزن',
    description: 'BMI بین ۲۵ تا ۲۹.۹ — توجه به تغذیه و فعالیت بدنی توصیه می‌شود.',
    color: 'border-warning/40 bg-warning/15 text-warning-foreground',
  },
  obese: {
    label: 'چاقی',
    description: 'BMI ۳۰ و بالاتر — مشورت با تیم سلامت برای برنامه مدیریت وزن.',
    color: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
}

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleCalculate = () => {
    const h = parseFloat(toEnglishDigits(height))
    const w = parseFloat(toEnglishDigits(weight))
    if (!h || !w || h < 100 || h > 250 || w < 30 || w > 300) {
      setBmi(null)
      return
    }
    setBmi(calculateBMI(h, w))
    setSaved(false)
    setSaveMessage('')
  }

  const handleSave = () => {
    if (bmi === null) return
    setSaved(true)
    setSaveMessage('نتیجه در پرونده خودمراقبتی شما ذخیره شد.')
  }

  const category = bmi !== null ? getBmiCategory(bmi) : null
  const categoryInfo = category ? BMI_CATEGORIES[category] : null

  const isValid =
    height.trim() !== '' &&
    weight.trim() !== '' &&
    !Number.isNaN(parseFloat(toEnglishDigits(height))) &&
    !Number.isNaN(parseFloat(toEnglishDigits(weight)))

  return (
    <div className="page-container">
      <PageHeader
        title="محاسبه BMI"
        subtitle="شاخص توده بدنی — ابزار آگاهی‌بخشی، نه تشخیص پزشکی"
        breadcrumb={[
          { label: 'خودارزیابی', href: '/screenings' },
          { label: 'محاسبه BMI' },
        ]}
      />

      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
            <p>
              <strong>سلب مسئولیت:</strong> BMI یک معیار کلی است و جایگزین معاینه پزشکی،
              ارزیابی ترکیب بدن یا تشخیص بیماری نیست. برای تفسیر دقیق با پزشک مشورت کنید.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              وارد کردن اندازه‌ها
            </CardTitle>
            <CardDescription>قد را به سانتی‌متر و وزن را به کیلوگرم وارد کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="height">قد (سانتی‌متر)</Label>
              <Input
                id="height"
                type="text"
                inputMode="decimal"
                placeholder="مثال: ۱۶۵"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="weight">وزن (کیلوگرم)</Label>
              <Input
                id="weight"
                type="text"
                inputMode="decimal"
                placeholder="مثال: ۶۸"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button className="w-full" onClick={handleCalculate} disabled={!isValid}>
              محاسبه BMI
            </Button>
          </CardContent>
        </Card>

        {bmi !== null && categoryInfo && (
          <Card className={cn('border-2', categoryInfo.color.split(' ')[0])}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">شاخص توده بدنی (BMI)</p>
              <p className="mt-1 text-5xl font-bold text-navy">{toPersianDigits(bmi)}</p>
              <p className="mt-2 text-lg font-semibold">{categoryInfo.label}</p>
              <p className="mt-2 text-sm text-muted-foreground">{categoryInfo.description}</p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={handleSave} disabled={saved} variant={saved ? 'secondary' : 'default'}>
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      ذخیره شد
                    </>
                  ) : (
                    'ذخیره نتیجه'
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/screenings">بازگشت به لیست</Link>
                </Button>
              </div>

              {saveMessage && (
                <p className="mt-3 text-sm text-success">{saveMessage}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">جدول مرجع BMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {[
                ['کمتر از ۱۸.۵', 'کم‌وزن'],
                ['۱۸.۵ — ۲۴.۹', 'طبیعی'],
                ['۲۵ — ۲۹.۹', 'اضافه وزن'],
                ['۳۰ و بالاتر', 'چاقی'],
              ].map(([range, label]) => (
                <div key={range} className="flex justify-between border-b border-border py-2 last:border-0">
                  <span className="text-muted-foreground">{range}</span>
                  <span className="font-medium text-navy">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default BmiCalculator
