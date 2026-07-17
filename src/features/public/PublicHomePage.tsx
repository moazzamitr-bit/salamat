import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Building2,
  ClipboardCheck,
  HeartPulse,
  Hospital,
  Pill,
  Search,
  ShieldCheck,
  Smile,
  Stethoscope,
  Syringe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmergencyBanner } from '@/components/EmergencyBanner'
import { ServiceTile } from '@/components/ServiceTile'
import { APP_NAME, APP_TAGLINE, ARTICLE_CATEGORY_LABELS } from '@/lib/constants'
import { screenings } from '@/mock-data'

const SERVICE_SHORTCUTS = [
  { label: 'بیمارستان', category: 'hospital', description: 'مراکز درمانی بستری', icon: Hospital },
  { label: 'داروخانه', category: 'pharmacy', description: 'داروخانه‌های نزدیک', icon: Pill },
  { label: 'پزشک خانواده', category: 'clinic', description: 'ویزیت و پیگیری', icon: Stethoscope },
  { label: 'دندانپزشک', category: 'dental', description: 'مراقبت دهان و دندان', icon: Smile },
  { label: 'روان‌درمانگر', category: 'mental_health', description: 'سلامت روان', icon: HeartPulse },
  { label: 'مرکز واکسیناسیون', category: 'maternal', description: 'واکسن و پیشگیری', icon: Syringe },
] as const

const NATIONAL_CAMPAIGNS = [
  {
    id: 'campaign-1',
    title: 'پویش ملی واکسیناسیون آنفولانزا — پاییز ۱۴۰۴',
    period: 'مهر تا آذر ۱۴۰۴',
    description: 'واکسیناسیون رایگان گروه‌های پرخطر در مراکز بهداشت سراسر کشور.',
    status: 'فعال',
  },
  {
    id: 'campaign-2',
    title: 'هفته سلامت روان — ۱۰ تا ۱۶ مهر',
    period: '۱۰–۱۶ مهر ۱۴۰۴',
    description: 'برنامه‌های آموزشی، غربالگری افسردگی و دسترسی به خط مشاوره ۱۴۸۰.',
    status: 'آینده',
  },
  {
    id: 'campaign-3',
    title: 'غربالگری سرطان پستان',
    period: 'سالانه',
    description: 'ماموگرافی رایگان برای زنان ۴۰ تا ۷۰ سال در مراکز معرفی‌شده.',
    status: 'در جریان',
  },
]

const FAQ_ITEMS = [
  {
    question: 'سامانه خودمراقبتی چیست؟',
    answer:
      'سامانه خودمراقبتی بستر دیجیتال ملی برای دسترسی شهروندان به پرونده سلامت، نوبت‌دهی، آموزش سلامت و ابزارهای خودارزیابی است. این سامانه جایگزین مراجعه حضوری به مراکز درمانی نیست.',
  },
  {
    question: 'آیا اطلاعات پرونده سلامت من امن است؟',
    answer:
      'بله. دسترسی به پرونده سلامت بر اساس احراز هویت و رضایت‌نامه انجام می‌شود. اعضای خانواده تنها با رضایت صریح شما به پرونده دسترسی دارند.',
  },
  {
    question: 'چگونه نوبت پزشک بگیرم؟',
    answer:
      'پس از ورود به سامانه، از بخش «نوبت‌ها» می‌توانید نوبت حضوری، تلفنی یا ویدئویی رزرو کنید. همچنین از طریق «مراکز نزدیک» می‌توانید مرکز مورد نظر را پیدا کنید.',
  },
  {
    question: 'خودارزیابی‌ها چه کاربردی دارند؟',
    answer:
      'ابزارهای خودارزیابی برای آگاهی اولیه از وضعیت سلامت طراحی شده‌اند و جایگزین تشخیص پزشکی نیستند. در صورت مشاهده علائم خطر، با اورژانس ۱۱۵ تماس بگیرید.',
  },
  {
    question: 'آیا می‌توانم پرونده اعضای خانواده را ببینم؟',
    answer:
      'بله، با ثبت رضایت‌نامه می‌توانید پرونده همسر، فرزند یا والدین را مدیریت کنید. هر پرونده به‌صورت جداگانه نمایش داده می‌شود.',
  },
]

export default function PublicHomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/centers?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/centers')
    }
  }

  const educationCategories = Object.entries(ARTICLE_CATEGORY_LABELS)
  const activeScreenings = screenings.filter((s) => s.isActive)

  return (
    <div className="page-container space-y-10 pb-12 animate-fade-in">
      <section aria-labelledby="portal-intro" className="hero-band p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-overline">درگاه خدمات سلامت</p>
            <h1 id="portal-intro" className="mt-2 text-display">
              {APP_NAME}
            </h1>
            <p className="mt-3 text-body-lg text-muted-foreground">
              {APP_TAGLINE}. از این درگاه می‌توانید به پرونده سلامت، مراکز درمانی، آموزش‌های
              بهداشتی و ابزارهای خودارزیابی دسترسی داشته باشید.
            </p>

            <form onSubmit={handleSearch} className="mt-6" role="search">
              <label htmlFor="service-search" className="sr-only">
                جستجوی خدمات و مراکز
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="service-search"
                    type="search"
                    placeholder="جستجوی مرکز درمانی، خدمت یا موضوع آموزشی…"
                    className="h-12 rounded-xl border-border/70 bg-white/90 ps-10 shadow-inset"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="sm:min-w-[7rem]">
                  جستجو
                </Button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-navy shadow-soft">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                اطلاعات شما محرمانه است
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-navy shadow-soft">
                <Building2 className="h-4 w-4 text-secondary" aria-hidden />
                خدمات عمومی سلامت
              </span>
            </div>
          </div>

          <Card variant="elevated" className="bg-white/95">
            <CardHeader>
              <CardTitle>شروع سریع</CardTitle>
              <CardDescription>
                برای دسترسی به پرونده، نوبت و یادآوری‌ها وارد شوید.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/login">ورود به سامانه</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/register">ثبت‌نام شهروندی</Link>
              </Button>
              <p className="text-caption text-center">
                ورود آزمایشی بدون OTP از صفحه ورود در دسترس است.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="shortcuts-heading">
        <div className="mb-4">
          <h2 id="shortcuts-heading" className="section-title">
            دسترسی سریع به خدمات
          </h2>
          <p className="section-subtitle">یافتن مراکز درمانی بر اساس نوع خدمت</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_SHORTCUTS.map((item) => (
            <ServiceTile
              key={item.category}
              to={`/centers?category=${item.category}`}
              label={item.label}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="education-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="education-heading" className="section-title">
              آموزش سلامت
            </h2>
            <p className="section-subtitle">مطالب آموزشی تأییدشده بر اساس موضوع</p>
          </div>
          <Button asChild variant="soft" size="sm">
            <Link to="/education">همه مطالب</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {educationCategories.map(([key, label]) => (
            <Link
              key={key}
              to={`/education?category=${key}`}
              className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm text-navy transition-colors hover:border-border hover:bg-white"
            >
              <span className="status-dot bg-secondary" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <Card variant="default" aria-labelledby="screenings-heading">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="icon-well">
                <ClipboardCheck className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <CardTitle id="screenings-heading" className="text-lg">
                  ابزارهای خودارزیابی
                </CardTitle>
                <CardDescription className="mt-1">
                  ارزیابی اولیه BMI، فشار خون، دیابت، سلامت روان و سایر موارد — جایگزین تشخیص
                  پزشکی نیست.
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link to="/screenings">شروع خودارزیابی</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/80 rounded-xl border border-border/70 bg-surface-2/80">
            {activeScreenings.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/screenings/${s.slug}`}
                  className="flex items-center justify-between px-4 py-3.5 text-sm transition-colors hover:bg-white"
                >
                  <span className="font-medium text-navy">{s.title}</span>
                  <span className="text-caption">حدود {s.estimatedMinutes} دقیقه</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section aria-labelledby="campaigns-heading">
        <h2 id="campaigns-heading" className="section-title">
          پویش‌ها و برنامه‌های ملی
        </h2>
        <p className="section-subtitle">برنامه‌های بهداشتی وزارت بهداشت و مراکز استانی</p>
        <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {NATIONAL_CAMPAIGNS.map((campaign) => (
            <Card key={campaign.id} variant="interactive" className="min-w-[16rem] flex-1 sm:min-w-0">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="leading-snug">{campaign.title}</CardTitle>
                  <Badge variant={campaign.status === 'فعال' ? 'success' : 'outline'}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>{campaign.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{campaign.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card variant="accent" aria-labelledby="assistant-heading">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id="assistant-heading" className="text-lg font-semibold text-navy">
                دستیار سلامت
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                پاسخ به سؤالات عمومی سلامت، راهنمای استفاده از سامانه و ارجاع در شرایط اضطراری.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link to="/assistant">
              <Stethoscope className="h-4 w-4" />
              گفتگو با دستیار
            </Link>
          </Button>
        </CardContent>
      </Card>

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-title">
          سؤالات متداول
        </h2>
        <div className="mt-4 space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-border/80 bg-white shadow-soft [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 font-medium text-navy transition-colors hover:bg-muted/40">
                {item.question}
                <ArrowLeft
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:-rotate-90"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-border/80 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <EmergencyBanner />
        <Card variant="muted" className="text-center">
          <CardContent className="p-6">
            <p className="font-semibold text-navy">برای دسترسی به پرونده سلامت شخصی، وارد شوید</p>
            <p className="mt-1 text-sm text-muted-foreground">
              پس از ورود می‌توانید نوبت بگیرید، یادآوری‌ها را مدیریت کنید و با تیم مراقبت در ارتباط
              باشید.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild size="lg">
                <Link to="/login">ورود به سامانه</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">ایجاد حساب کاربری</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
