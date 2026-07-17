import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShieldAlert,
} from 'lucide-react'
import { screeningBySlug, screenings } from '@/mock-data/screenings'
import { cn, toEnglishDigits, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import type { RiskLevel, Screening, ScreeningAnswer, ScreeningQuestion } from '@/types'

/** User-facing risk wording — never diagnostic labels. */
const SCREENING_RISK_LABELS: Record<RiskLevel, string> = {
  low: 'ریسک پایین',
  moderate: 'نیازمند توجه',
  high: 'پیشنهاد مراجعه به تیم سلامت',
  critical: 'نیازمند ارزیابی فوری',
}

const RISK_BADGE_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'destructive' | 'default'> = {
  low: 'success',
  moderate: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

type FlowPhase = 'intro' | 'disclaimer' | 'questions' | 'result'

function isQuestionVisible(
  question: ScreeningQuestion,
  answers: Record<string, ScreeningAnswer['value']>
): boolean {
  if (!question.dependsOn) return true
  return answers[question.dependsOn.questionId] === question.dependsOn.value
}

function calculateScore(
  screening: Screening,
  answers: Record<string, ScreeningAnswer['value']>
): number {
  let score = 0
  for (const q of screening.questions) {
    if (!isQuestionVisible(q, answers)) continue
    const val = answers[q.id]
    if (val === undefined || val === '') continue

    if (q.type === 'boolean') {
      score += val === true ? 1 : 0
    } else if (q.type === 'single_choice' && q.options) {
      const opt = q.options.find((o) => o.value === val || o.id === val)
      if (opt && typeof opt.value === 'number') score += opt.value
    } else if (q.type === 'number') {
      score += typeof val === 'number' ? val : parseFloat(String(val)) || 0
    }
  }
  return score
}

function resolveRiskLevel(
  screening: Screening,
  score: number,
  answers: Record<string, ScreeningAnswer['value']>
): RiskLevel {
  if (screening.slug === 'mental-health' && answers['mh-self-harm'] === true) {
    return 'critical'
  }

  const range = screening.scoreRanges?.find((r) => score >= r.min && score <= r.max)
  return range?.riskLevel ?? 'moderate'
}

function buildRecommendations(screening: Screening, score: number): string[] {
  const range = screening.scoreRanges?.find((r) => score >= r.min && score <= r.max)
  if (range) return [range.recommendation]
  return ['سبک زندگی سالم را حفظ کنید و در صورت نیاز با تیم سلامت مشورت کنید.']
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ScreeningQuestion
  value: ScreeningAnswer['value'] | undefined
  onChange: (val: ScreeningAnswer['value']) => void
}) {
  if (question.type === 'boolean') {
    return (
      <div className="flex gap-3">
        {[
          { label: 'بله', val: true },
          { label: 'خیر', val: false },
        ].map(({ label, val }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              'flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
              value === val
                ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                : 'border-border hover:border-primary/40'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'single_choice' && question.options) {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex w-full rounded-xl border px-4 py-3 text-right text-sm transition-colors',
              value === opt.value
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/40'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'number') {
    return (
      <div>
        <Input
          type="text"
          inputMode="decimal"
          placeholder={question.helpText ?? `مثال: ${toPersianDigits(question.min ?? 0)}`}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => {
            const raw = toEnglishDigits(e.target.value)
            const num = parseFloat(raw)
            onChange(Number.isNaN(num) ? raw : num)
          }}
        />
        {question.unit && (
          <p className="mt-1 text-xs text-muted-foreground">واحد: {question.unit}</p>
        )}
      </div>
    )
  }

  return (
    <Textarea
      value={value !== undefined ? String(value) : ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  )
}

export function ScreeningFlow() {
  const { slug: paramSlug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const slug = paramSlug ?? searchParams.get('id') ?? searchParams.get('slug') ?? ''

  const screening = useMemo(() => {
    if (!slug) return undefined
    return screeningBySlug(slug) ?? screenings.find((s) => s.id === slug)
  }, [slug])

  const [phase, setPhase] = useState<FlowPhase>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, ScreeningAnswer['value']>>({})
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)

  const visibleQuestions = useMemo(
    () => (screening ? screening.questions.filter((q) => isQuestionVisible(q, answers)) : []),
    [screening, answers]
  )

  const currentQuestion = visibleQuestions[questionIndex]

  const score = screening ? calculateScore(screening, answers) : 0
  const riskLevel = screening ? resolveRiskLevel(screening, score, answers) : 'low'
  const recommendations = screening ? buildRecommendations(screening, score) : []

  const questionProgress =
    visibleQuestions.length > 0 ? ((questionIndex + 1) / visibleQuestions.length) * 100 : 0

  const setAnswer = (questionId: string, value: ScreeningAnswer['value']) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const canProceedQuestion = (): boolean => {
    if (!currentQuestion) return false
    if (!currentQuestion.required) return true
    const val = answers[currentQuestion.id]
    return val !== undefined && val !== ''
  }

  const goNextQuestion = () => {
    if (questionIndex < visibleQuestions.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      setPhase('result')
    }
  }

  const goPrevQuestion = () => {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1)
    else setPhase('disclaimer')
  }

  if (!screening) {
    return (
      <div className="page-container">
        <PageHeader title="ابزار یافت نشد" subtitle="شناسه غربالگری معتبر نیست" />
        <Button asChild>
          <Link to="/screenings">بازگشت به خودارزیابی</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={screening.title}
        subtitle={screening.description}
        breadcrumb={[
          { label: 'خودارزیابی', href: '/screenings' },
          { label: screening.title },
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {phase === 'intro' && (
          <Card>
            <CardHeader>
              <CardTitle>معرفی ابزار</CardTitle>
              <CardDescription>{screening.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  زمان تقریبی: {toPersianDigits(screening.estimatedMinutes)} دقیقه
                </Badge>
                {screening.targetAudience && (
                  <Badge variant="outline">مخاطب: {screening.targetAudience}</Badge>
                )}
                <Badge variant="outline">
                  {toPersianDigits(visibleQuestions.length)} سؤال
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                این پرسشنامه به شما کمک می‌کند وضعیت خود را بهتر درک کنید. نتیجه آن{' '}
                <strong>تشخیص پزشکی نیست</strong> و صرفاً برای آگاهی‌بخشی و تصمیم‌گیری آگاهانه
                طراحی شده است.
              </p>
              <Button className="w-full" onClick={() => setPhase('disclaimer')}>
                ادامه
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === 'disclaimer' && (
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-warning-foreground" />
                سلب مسئولیت پزشکی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-warning/10 px-4 py-3 text-sm">
                {screening.disclaimer ??
                  'این ابزار جایگزین معاینه، تشخیص یا درمان پزشکی نیست. در صورت بروز علائم شدید یا نگران‌کننده، فوراً با اورژانس ۱۱۵ تماس بگیرید یا به مرکز درمانی مراجعه کنید.'}
              </div>
              {screening.slug === 'mental-health' && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertTriangle className="mb-1 inline h-4 w-4" /> در صورت افکار خودآسیب، فوراً با{' '}
                  {toPersianDigits('1480')} (خط ملی پیشگیری از خودکشی) یا اورژانس تماس بگیرید.
                </div>
              )}
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-input"
                  onChange={(e) => {
                    if (e.target.checked) setPhase('questions')
                  }}
                />
                <span className="text-sm">
                  متن سلب مسئولیت را خواندم و می‌دانم که نتیجه این ارزیابی تشخیص پزشکی نیست.
                </span>
              </label>
            </CardContent>
          </Card>
        )}

        {phase === 'questions' && currentQuestion && (
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    سؤال {toPersianDigits(questionIndex + 1)} از{' '}
                    {toPersianDigits(visibleQuestions.length)}
                  </span>
                </div>
                <Progress value={questionProgress} />
              </div>
              <CardTitle className="mt-2">{currentQuestion.text}</CardTitle>
              {currentQuestion.helpText && (
                <CardDescription>{currentQuestion.helpText}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <QuestionField
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(val) => setAnswer(currentQuestion.id, val)}
              />
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={goPrevQuestion}>
                  <ChevronRight className="h-4 w-4" />
                  قبلی
                </Button>
                <Button onClick={goNextQuestion} disabled={!canProceedQuestion()}>
                  {questionIndex < visibleQuestions.length - 1 ? 'بعدی' : 'مشاهده نتیجه'}
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'result' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>خلاصه نتیجه</CardTitle>
              <CardDescription>
                این نتیجه صرفاً برای آگاهی‌بخشی است و تشخیص پزشکی محسوب نمی‌شود
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 px-6 py-8">
                <Badge variant={RISK_BADGE_VARIANT[riskLevel]} className="text-base px-4 py-1">
                  {SCREENING_RISK_LABELS[riskLevel]}
                </Badge>
                <p className="text-center text-sm text-muted-foreground">
                  بر اساس پاسخ‌های شما، سطح {SCREENING_RISK_LABELS[riskLevel]} گزارش می‌شود.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-navy">پیشنهادها</h4>
                <ul className="space-y-2">
                  {recommendations.map((rec) => (
                    <li
                      key={rec}
                      className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-muted-foreground">
                <strong>تذکر:</strong> از نمایش یا تفسیر این نتیجه به عنوان «تشخیص» خودداری کنید.
                برای ارزیابی دقیق با پزشک یا تیم مراقبت خود مشورت کنید.
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={saved}
                  onClick={() => setSaved(true)}
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      ذخیره شد
                    </>
                  ) : (
                    'ذخیره نتیجه'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={shared}
                  onClick={() => setShared(true)}
                >
                  {shared ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      ارسال شد
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      اشتراک با تیم سلامت
                    </>
                  )}
                </Button>
              </div>

              {(saved || shared) && (
                <p className="text-center text-sm text-success">
                  {saved && shared
                    ? 'نتیجه ذخیره و برای تیم مراقبت ارسال شد.'
                    : saved
                      ? 'نتیجه در پرونده خودمراقبتی ذخیره شد.'
                      : 'نتیجه برای بررسی تیم مراقبت ارسال شد.'}
                </p>
              )}

              <Button variant="ghost" className="w-full" onClick={() => navigate('/screenings')}>
                بازگشت به لیست ابزارها
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ScreeningFlow
