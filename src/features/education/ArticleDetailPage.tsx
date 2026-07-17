import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Share2,
  User,
} from 'lucide-react'
import { educationalArticles } from '@/mock-data/education'
import { screenings } from '@/mock-data/screenings'
import { healthCenters } from '@/mock-data/centers'
import { formatPersianDate, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ArticleCategory } from '@/types'

const CATEGORY_SCREENING_MAP: Partial<Record<ArticleCategory, string>> = {
  nutrition: 'nutrition',
  physical_activity: 'activity',
  mental_health: 'mental-health',
  chronic_disease: 'diabetes',
  maternal_health: 'gestational-diabetes',
  preventive_care: 'cardiovascular',
  child_health: 'bmi',
}

const CATEGORY_CENTER_MAP: Partial<Record<ArticleCategory, string>> = {
  nutrition: 'center-clinic-2',
  mental_health: 'center-mental-1',
  child_health: 'center-clinic-3',
  maternal_health: 'center-clinic-4',
  dental_health: 'center-dental-1',
  chronic_disease: 'center-hospital-1',
  emergency_preparedness: 'center-emergency-1',
  medication_safety: 'center-pharmacy-1',
  preventive_care: 'center-lab-1',
  physical_activity: 'center-rehab-1',
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-6 mb-2 text-lg font-semibold text-navy">
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          className="my-3 border-s-4 border-primary/40 bg-accent/50 px-4 py-2 text-sm italic text-muted-foreground"
        >
          {trimmed.slice(2)}
        </blockquote>
      )
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={i} className="ms-4 list-disc text-sm leading-relaxed text-foreground">
          {trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
        </li>
      )
    } else if (/^\d+\./.test(trimmed)) {
      elements.push(
        <li key={i} className="ms-4 list-decimal text-sm leading-relaxed text-foreground">
          {trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
        </li>
      )
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-foreground">
          {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      )
    }
  })

  return <div className="space-y-2">{elements}</div>
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [saved, setSaved] = useState(false)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)

  const article = useMemo(
    () => educationalArticles.find((a) => a.id === id),
    [id]
  )

  const relatedScreening = useMemo(() => {
    if (!article) return undefined
    const slug = CATEGORY_SCREENING_MAP[article.category]
    return slug ? screenings.find((s) => s.slug === slug) : undefined
  }, [article])

  const relatedCenter = useMemo(() => {
    if (!article) return undefined
    const centerId = CATEGORY_CENTER_MAP[article.category]
    return centerId ? healthCenters.find((c) => c.id === centerId) : undefined
  }, [article])

  const relatedArticles = useMemo(() => {
    if (!article) return []
    return educationalArticles
      .filter((a) => a.id !== article.id && a.category === article.category)
      .slice(0, 3)
  }, [article])

  const handleShare = async () => {
    const url = window.location.href
    const shareData = {
      title: article?.title ?? 'مطلب آموزشی',
      text: article?.summary,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        /* fall through to copy */
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareFeedback('لینک کپی شد')
      setTimeout(() => setShareFeedback(null), 2500)
    } catch {
      setShareFeedback('کپی لینک ممکن نشد')
    }
  }

  if (!article) {
    return (
      <div className="page-container">
        <EmptyState
          title="مطلب یافت نشد"
          description="این مطلب وجود ندارد یا حذف شده است."
          action={
            <Button asChild variant="outline">
              <Link to="/education">بازگشت به کتابخانه</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={article.title}
        subtitle={article.summary}
        breadcrumb={[
          { label: 'آموزش سلامت', href: '/education' },
          { label: article.categoryLabel },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaved((v) => !v)}
            >
              {saved ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                  ذخیره شده
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  ذخیره مطلب
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              {shareFeedback ?? 'اشتراک‌گذاری'}
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="outline">{article.categoryLabel}</Badge>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {toPersianDigits(article.readTimeMinutes)} دقیقه مطالعه
        </span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          {article.author}
        </span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          بازبینی: {formatPersianDate(article.publishedAt, 'long')}
        </span>
      </div>

      {article.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">{renderContent(article.content)}</CardContent>
      </Card>

      <p className="mb-6 text-xs text-muted-foreground">
        منبع: {article.author} — سامانه خودمراقبتی (محتوای آموزشی، جایگزین مشاوره پزشکی نیست)
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {relatedScreening && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">خودارزیابی مرتبط</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">{relatedScreening.description}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/screenings/${relatedScreening.slug}`}>
                  <ExternalLink className="h-4 w-4" />
                  {relatedScreening.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {relatedCenter && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">خدمت سلامت مرتبط</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-1 font-medium text-navy">{relatedCenter.name}</p>
              <p className="mb-3 text-sm text-muted-foreground">{relatedCenter.description}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/centers?category=${relatedCenter.category}`}>
                  <ExternalLink className="h-4 w-4" />
                  مشاهده مرکز
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {relatedArticles.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-navy">موضوعات مرتبط</h2>
          <div className="space-y-3">
            {relatedArticles.map((a) => (
              <Link
                key={a.id}
                to={`/education/${a.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <p className="font-medium text-navy">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{a.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/education">
            <Copy className="h-4 w-4" />
            بازگشت به کتابخانه
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ArticleDetailPage
