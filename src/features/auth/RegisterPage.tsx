import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { loginAsDemo } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    phone: '',
    email: '',
    password: '',
    consent: false,
  })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('نام و نام خانوادگی الزامی است.')
      return
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      setError('شماره موبایل معتبر وارد کنید.')
      return
    }
    if (!form.email.includes('@')) {
      setError('ایمیل معتبر وارد کنید.')
      return
    }
    if (form.password.length < 8) {
      setError('رمز عبور باید حداقل ۸ نویسه باشد.')
      return
    }
    if (!form.consent) {
      setError('پذیرش شرایط استفاده و حریم خصوصی الزامی است.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>درخواست ثبت‌نام دریافت شد</CardTitle>
            <CardDescription>
              در نسخه نمایشی، احراز هویت واقعی فعال نیست. برای ادامه می‌توانید با حساب آزمایشی شهروند
              وارد شوید.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                loginAsDemo('citizen')
                navigate('/dashboard')
              }}
            >
              ورود به‌عنوان شهروند آزمایشی
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">صفحه ورود</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 rotate-180" />
        بازگشت به صفحه اصلی
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>ثبت‌نام در {APP_NAME}</CardTitle>
          <CardDescription>
            حساب شهروندی برای مدیریت پرونده سلامت، نوبت‌ها و یادآوری‌ها ایجاد کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">نام</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی (نمایشی)</Label>
              <Input
                id="nationalId"
                inputMode="numeric"
                value={form.nationalId}
                onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
                placeholder="۱۰ رقم — داده واقعی ذخیره نمی‌شود"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">موبایل</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                className="text-left"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="0912•••••••"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                className="text-left"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="text-left"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              />
              <span>
                شرایط استفاده، حریم خصوصی و پردازش داده‌های سلامت را می‌پذیرم. در نسخه نمایشی هیچ داده
                واقعی پزشکی ذخیره نمی‌شود.
              </span>
            </label>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              ادامه ثبت‌نام
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              برای آزمایش سریع بدون ثبت‌نام، از{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                ورود آزمایشی
              </Link>{' '}
              استفاده کنید.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
