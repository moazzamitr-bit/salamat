import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Phone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/AuthContext'
import { APP_NAME, APP_TAGLINE, DEMO_ACCOUNTS, EMERGENCY_NUMBERS } from '@/lib/constants'
import type { UserRole } from '@/types'

const ROLE_ROUTES: Record<UserRole, string> = {
  citizen: '/dashboard',
  care_team: '/care-team',
  admin: '/admin',
  provider: '/care-team',
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'لطفاً ایمیل را وارد کنید.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'فرمت ایمیل صحیح نیست.'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'لطفاً رمز عبور را وارد کنید.'
  if (password.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.'
  return null
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginAsDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const result = login(email, password)
    if (!result.ok) {
      setErrors({ form: result.error ?? 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.' })
      setIsSubmitting(false)
      return
    }

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (account) {
      navigate(ROLE_ROUTES[account.role])
    } else {
      navigate('/dashboard')
    }
    setIsSubmitting(false)
  }

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role)
    navigate(ROLE_ROUTES[role])
  }

  const demoRoles: UserRole[] = ['citizen', 'care_team', 'admin']

  return (
    <div className="page-container py-8 sm:py-12 animate-fade-in">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-white shadow-elevated lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-bl from-primary to-navy p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_55%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </div>
              <p className="text-sm text-white/75">ورود امن به</p>
              <h1 className="mt-1 text-3xl font-bold leading-tight">{APP_NAME}</h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">{APP_TAGLINE}</p>
            </div>

            <ul className="space-y-3 text-sm text-white/85">
              <li className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                دسترسی به پرونده فقط با رضایت و نقش مجاز
              </li>
              <li className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                تفکیک اطلاعات ثبت‌شده توسط کاربر و تأییدشده توسط تیم سلامت
              </li>
              <li className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                در فوریت‌های پزشکی با اورژانس ۱۱۵ تماس بگیرید
              </li>
            </ul>

            <a
              href={`tel:${EMERGENCY_NUMBERS.ambulance}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
            >
              <Phone className="h-4 w-4" />
              تماس اضطراری ۱۱۵
            </a>
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <div className="mb-6 lg:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-navy">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>

          <Card variant="ghost">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">ورود به سامانه</CardTitle>
              <CardDescription>
                با ایمیل و رمز عبور وارد شوید یا از حساب آزمایشی استفاده کنید.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {errors.form && (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    {errors.form}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    className="h-11"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    dir="ltr"
                    className="h-11"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <LogIn className="h-4 w-4" />
                  {isSubmitting ? 'در حال ورود…' : 'ورود امن'}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-3">
                <p className="text-center text-xs text-muted-foreground">ورود سریع با حساب آزمایشی</p>
                <div className="grid gap-2">
                  {demoRoles.map((role) => {
                    const account = DEMO_ACCOUNTS.find((a) => a.role === role)
                    if (!account) return null
                    return (
                      <Button
                        key={role}
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-start"
                        onClick={() => handleDemoLogin(role)}
                      >
                        {account.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            حساب کاربری ندارید؟{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              ثبت‌نام
            </Link>
            {' · '}
            <Link to="/" className="text-primary hover:underline">
              بازگشت به صفحه اصلی
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
