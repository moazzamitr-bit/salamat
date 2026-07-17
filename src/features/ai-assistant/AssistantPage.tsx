import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bot, MapPin, MessageSquare, Send, Stethoscope } from 'lucide-react'
import { EMERGENCY_PHRASES, EMERGENCY_RESPONSE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { EmergencyBanner } from '@/components/EmergencyBanner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const EXTRA_EMERGENCY_PHRASES = [
  'بیهوشی',
  'علائم سکته',
  'افکار خودکشی',
  'قطع ناگهانی دارو',
]

const ALL_EMERGENCY_PHRASES = [...EMERGENCY_PHRASES, ...EXTRA_EMERGENCY_PHRASES]

const QUICK_SUGGESTIONS = [
  'نزدیک‌ترین داروخانه کجاست؟',
  'برای ویزیت پزشک چه چیزهایی آماده کنم؟',
  'این سامانه چه کارهایی انجام می‌دهد؟',
  'چطور با تیم سلامت تماس بگیرم؟',
  'مطلب آموزشی درباره فشار خون',
]

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'emergency'
  content: string
  timestamp: Date
}

function detectEmergency(text: string): boolean {
  const normalized = text.trim().toLowerCase()
  return ALL_EMERGENCY_PHRASES.some((phrase) => normalized.includes(phrase.toLowerCase()))
}

function generateMockResponse(input: string): string {
  const text = input.trim()

  if (/داروخانه|کلینیک|بیمارستان|مرکز|نزدیک|پیدا|جستجو|کجا/.test(text)) {
    return `می‌توانید از بخش «مراکز نزدیک» مراکز درمانی، داروخانه و کلینیک‌های اطراف را روی نقشه ببینید و فیلتر کنید.

[مشاهده مراکز نزدیک](/centers)

برای اورژانس فوری با ۱۱۵ تماس بگیرید.`
  }

  if (/ویزیت|آماده|قبل از|نوبت|مراجعه/.test(text)) {
    return `برای آمادگی ویزیت پیشنهاد می‌کنم:
• لیست داروهای فعلی را همراه داشته باشید
• نتایج آزمایش و تصویربرداری اخیر را ببرید
• سوالات خود را یادداشت کنید
• ۱۵ دقیقه زودتر حاضر شوید

می‌توانید از بخش «نوبت‌ها» وضعیت نوبت‌های خود را ببینید.`
  }

  if (/سامانه|پلتفرم|چطور|چگونه|کاربرد|امکانات/.test(text)) {
    return `سامانه خودمراقبتی به شما کمک می‌کند:
• پرونده سلامت شخصی و خانواده را مدیریت کنید
• نوبت بگیرید و یادآوری دریافت کنید
• خودارزیابی سلامت انجام دهید
• مراکز درمانی نزدیک را پیدا کنید
• مطالب آموزشی معتبر بخوانید

من دستیار راهنما هستم — جایگزین پزشک نیستم.`
  }

  if (/تیم سلامت|پزشک|تماس|پیام|مشاوره/.test(text)) {
    return `برای ارتباط با تیم مراقبت سلامت:
• از بخش «پرونده سلامت» اعضای تیم درمان را ببینید
• در صورت نیاز از بخش «نوبت‌ها» درخواست مشاوره ثبت کنید
• برای اورژانس با ۱۱۵ تماس بگیرید

من نمی‌توانم تشخیص پزشکی بدهم.`
  }

  if (/آموزش|مطلب|فشار خون|دیابت|تغذیه|مقاله|بخوان/.test(text)) {
    return `در بخش «آموزش سلامت» مطالب بازبینی‌شده درباره تغذیه، فعالیت بدنی، بیماری‌های مزمن و موارد دیگر وجود دارد.

[مشاهده کتابخانه آموزش](/education)

اگر علائم خاصی دارید، با پزشک معالج مشورت کنید.`
  }

  return `متوجه شدم. من دستیار راهنمای سامانه هستم و می‌توانم در یافتن خدمات، آمادگی ویزیت، آموزش سلامت و معرفی امکانات سامانه کمک کنم.

برای تشخیص یا درمان پزشکی لطفاً با پزشک یا اورژانس ۱۱۵ تماس بگیرید.

چطور می‌توانم کمکتان کنم؟`
}

function renderAssistantContent(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      if (href.startsWith('/')) {
        return (
          <Link key={i} to={href} className="font-medium text-primary underline">
            {label}
          </Link>
        )
      }
      return (
        <a key={i} href={href} className="font-medium text-primary underline">
          {label}
        </a>
      )
    }
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ))
  })
}

export function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'سلام! من دستیار سلامت سامانه خودمراقبتی هستم. می‌توانم در یافتن مراکز درمانی، آمادگی ویزیت، آموزش سلامت و استفاده از امکانات سامانه راهنمایی‌تان کنم.\n\nتوجه: من جایگزین پزشک یا خدمات اورژانسی نیستم.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      if (detectEmergency(trimmed)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `emergency-${Date.now()}`,
            role: 'emergency',
            content: EMERGENCY_RESPONSE,
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: generateMockResponse(trimmed),
            timestamp: new Date(),
          },
        ])
      }
      setIsTyping(false)
    }, 600)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="page-container flex min-h-[calc(100vh-12rem)] flex-col">
      <PageHeader
        title="دستیار سلامت"
        subtitle="راهنمای استفاده از سامانه — نه جایگزین پزشک"
      />

      <div
        className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
        role="alert"
      >
        <p className="flex items-start gap-2 font-medium text-navy">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
          دستیار سلامت جایگزین پزشک یا خدمات اورژانسی نیست.
        </p>
      </div>

      <div className="mb-4">
        <EmergencyBanner compact />
      </div>

      <Card className="mb-4 flex flex-1 flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
          style={{ minHeight: '320px', maxHeight: '480px' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : msg.role === 'emergency'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-secondary/15 text-secondary'
                )}
              >
                {msg.role === 'user' ? (
                  <MessageSquare className="h-4 w-4" />
                ) : msg.role === 'emergency' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : msg.role === 'emergency'
                      ? 'border border-destructive/40 bg-destructive/10 text-navy'
                      : 'bg-muted text-foreground'
                )}
              >
                {msg.role === 'emergency' ? (
                  <div className="space-y-3">
                    <p className="font-medium">{msg.content}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="destructive">
                        <a href="tel:115">تماس با ۱۱۵</a>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/centers?category=emergency">
                          <MapPin className="h-4 w-4" />
                          مراکز اورژانس
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/health-record">
                          <Stethoscope className="h-4 w-4" />
                          تماس با تیم سلامت
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  renderAssistantContent(msg.content)
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/15">
                <Bot className="h-4 w-4 text-secondary" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                در حال نوشتن...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => sendMessage(suggestion)}
                disabled={isTyping}
              >
                {suggestion}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="سؤال خود را بنویسید..."
              rows={2}
              className="min-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
            />
            <Button type="submit" size="icon" className="h-auto shrink-0" disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">ارسال</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default AssistantPage
