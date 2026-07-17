import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EmergencyBanner } from '@/components/EmergencyBanner'
import { useAuth } from '@/features/auth/AuthContext'
import { APP_NAME, APP_TAGLINE, DEMO_ACCOUNTS } from '@/lib/constants'
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
    <div className="page-container flex min-h-[calc(100vh-4rem)] flex-col justify-center py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-navy">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ورود به سامانه</CardTitle>
            <CardDescription>
              با ایمیل و رمز عبور خود وارد شوید یا از حساب‌های آزمایشی استفاده کنید.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errors.form && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogIn className="h-4 w-4" />
                {isSubmitting ? 'در حال ورود…' : 'ورود'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-3">
              <p className="text-center text-xs text-muted-foreground">ورود سریع با حساب آزمایشی</p>
              <div className="flex flex-col gap-2">
                {demoRoles.map((role) => {
                  const account = DEMO_ACCOUNTS.find((a) => a.role === role)
                  if (!account) return null
                  return (
                    <Button
                      key={role}
                      type="button"
                      variant="outline"
                      size="sm"
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

        <p className="text-center text-sm text-muted-foreground">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            ثبت‌نام
          </Link>
          {' · '}
          <Link to="/" className="text-primary hover:underline">
            بازگشت به صفحه اصلی
          </Link>
        </p>

        <EmergencyBanner compact />
      </div>
    </div>
  )
}
