import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  ClipboardCheck,
  Search,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmergencyBanner } from '@/components/EmergencyBanner'
import { APP_NAME, APP_TAGLINE, ARTICLE_CATEGORY_LABELS } from '@/lib/constants'
import { screenings } from '@/mock-data'

const SERVICE_SHORTCUTS = [
  { label: 'بیمارستان', category: 'hospital' },
  { label: 'داروخانه', category: 'pharmacy' },
  { label: 'پزشک خانواده', category: 'clinic' },
  { label: 'دندانپزشک', category: 'dental' },
  { label: 'روان‌درمانگر', category: 'mental_health' },
  { label: 'مرکز واکسیناسیون', category: 'maternal' },
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
    <div className="page-container space-y-10 pb-10">
      {/* Hero / intro — service-oriented, not marketing */}
      <section aria-labelledby="portal-intro" className="border-b border-border pb-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-secondary">درگاه خدمات سلامت</p>
          <h1 id="portal-intro" className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
            {APP_NAME}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {APP_TAGLINE}. از این درگاه می‌توانید به پرونده سلامت، مراکز درمانی، آموزش‌های
            بهداشتی و ابزارهای خودارزیابی دسترسی داشته باشید.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 max-w-xl" role="search">
          <label htmlFor="service-search" className="sr-only">
            جستجوی خدمات و مراکز
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="service-search"
                type="search"
                placeholder="جستجوی مرکز درمانی، خدمت یا موضوع آموزشی…"
                className="ps-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">جستجو</Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="default" size="sm">
            <Link to="/login">ورود</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/register">ثبت‌نام</Link>
          </Button>
        </div>
      </section>

      {/* Service shortcuts */}
      <section aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="section-title">
          دسترسی سریع به خدمات
        </h2>
        <p className="section-subtitle">یافتن مراکز درمانی بر اساس نوع خدمت</p>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-white">
          {SERVICE_SHORTCUTS.map((item) => (
            <li key={item.category}>
              <Link
                to={`/centers?category=${item.category}`}
                className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-navy">{item.label}</span>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Health education */}
      <section aria-labelledby="education-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="education-heading" className="section-title">
              آموزش سلامت
            </h2>
            <p className="section-subtitle">مطالب آموزشی بر اساس موضوع</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/education">همه مطالب</Link>
          </Button>
        </div>
        <ul className="mt-4 columns-1 gap-x-8 sm:columns-2">
          {educationCategories.map(([key, label]) => (
            <li key={key} className="mb-2 break-inside-avoid">
              <Link
                to={`/education?category=${key}`}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-navy transition-colors hover:bg-muted"
              >
                <span className="status-dot bg-secondary" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Self-assessment */}
      <section
        aria-labelledby="screenings-heading"
        className="rounded-xl border border-border bg-white p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id="screenings-heading" className="text-lg font-semibold text-navy">
                ابزارهای خودارزیابی
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ارزیابی اولیه BMI، فشار خون، دیابت، سلامت روان و سایر موارد — جایگزین
                تشخیص پزشکی نیست.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/screenings">شروع خودارزیابی</Link>
          </Button>
        </div>
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {activeScreenings.slice(0, 4).map((s) => (
            <li key={s.id}>
              <Link
                to={`/screenings/${s.slug}`}
                className="flex items-center justify-between py-2 text-sm transition-colors hover:text-primary"
              >
                <span>{s.title}</span>
                <span className="text-xs text-muted-foreground">
                  حدود {s.estimatedMinutes} دقیقه
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* National campaigns */}
      <section aria-labelledby="campaigns-heading">
        <h2 id="campaigns-heading" className="section-title">
          پویش‌ها و برنامه‌های ملی
        </h2>
        <p className="section-subtitle">برنامه‌های بهداشتی وزارت بهداشت و مراکز استانی</p>
        <ul className="mt-4 space-y-0 divide-y divide-border rounded-xl border border-border bg-white">
          {NATIONAL_CAMPAIGNS.map((campaign) => (
            <li key={campaign.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium text-navy">{campaign.title}</h3>
                <Badge variant={campaign.status === 'فعال' ? 'success' : 'outline'}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{campaign.period}</p>
              <p className="mt-2 text-sm text-muted-foreground">{campaign.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* AI assistant */}
      <section
        aria-labelledby="assistant-heading"
        className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-accent/50 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-title">
          سؤالات متداول
        </h2>
        <div className="mt-4 space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border bg-white [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 font-medium text-navy transition-colors hover:bg-muted/50">
                {item.question}
                <ArrowLeft
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:-rotate-90"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Emergency + CTA */}
      <section className="space-y-6">
        <EmergencyBanner />
        <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
          <p className="font-medium text-navy">برای دسترسی به پرونده سلامت شخصی، وارد شوید</p>
          <p className="mt-1 text-sm text-muted-foreground">
            پس از ورود می‌توانید نوبت بگیرید، یادآوری‌ها را مدیریت کنید و با تیم مراقبت در
            ارتباط باشید.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/login">ورود به سامانه</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">ایجاد حساب کاربری</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
