import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, User } from 'lucide-react'
import { educationalArticles } from '@/mock-data/education'
import { ARTICLE_CATEGORY_LABELS } from '@/lib/constants'
import { formatPersianDate, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ArticleCategory } from '@/types'

function ArticleCard({ article }: { article: (typeof educationalArticles)[0] }) {
  return (
    <Link to={`/education/${article.id}`} className="group block">
      <Card className="h-full transition-colors hover:border-primary/40 hover:shadow-panel">
        <CardHeader className="pb-2">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{article.categoryLabel}</Badge>
            {article.isFeatured && <Badge variant="secondary">ویژه</Badge>}
          </div>
          <CardTitle className="text-base leading-relaxed group-hover:text-primary">
            {article.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{article.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {toPersianDigits(article.readTimeMinutes)} دقیقه مطالعه
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {article.author}
            </span>
            <span>بازبینی: {formatPersianDate(article.publishedAt, 'medium')}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function EducationPage() {
  const [category, setCategory] = useState<ArticleCategory | 'all'>('all')

  const filtered = useMemo(() => {
    const list =
      category === 'all'
        ? [...educationalArticles]
        : educationalArticles.filter((a) => a.category === category)
    return list.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }, [category])

  const featured = useMemo(
    () => educationalArticles.filter((a) => a.isFeatured).slice(0, 3),
    []
  )

  return (
    <div className="page-container">
      <PageHeader
        title="آموزش سلامت"
        subtitle="مطالب آموزشی معتبر برای خودمراقبتی و پیشگیری — بازبینی‌شده توسط متخصصان"
      />

      {category === 'all' && featured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-navy">پیشنهاد ویژه</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy">دسته‌بندی موضوعات</h2>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={category === 'all' ? 'default' : 'outline'}
            onClick={() => setCategory('all')}
          >
            همه
          </Button>
          {(Object.entries(ARTICLE_CATEGORY_LABELS) as [ArticleCategory, string][]).map(
            ([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={category === key ? 'default' : 'outline'}
                onClick={() => setCategory(key)}
                className="shrink-0"
              >
                {label}
              </Button>
            )
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="مطلبی در این دسته نیست"
            description="دسته دیگری را انتخاب کنید یا به زودی مطالب جدید اضافه می‌شود."
            icon={<BookOpen className="h-6 w-6" />}
            action={
              <Button variant="outline" onClick={() => setCategory('all')}>
                مشاهده همه مطالب
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default EducationPage
