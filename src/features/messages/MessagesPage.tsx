import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, MessageSquare, Send } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { healthMessages } from '@/mock-data/messages'
import { formatPersianDate, toPersianDigits } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { HealthMessage } from '@/types'

const PRIORITY_LABELS: Record<string, string> = {
  normal: 'عادی',
  urgent: 'فوری',
  emergency: 'اورژانسی',
}

export default function MessagesPage() {
  const { user, activePatientId } = useAuth()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState('')
  const [sentLocal, setSentLocal] = useState<HealthMessage[]>([])

  const messages = useMemo(() => {
    if (!user) return []
    const patientId = user.role === 'citizen' ? activePatientId : user.profile.id
    const base = healthMessages.filter(
      (m) => m.recipientId === patientId || m.senderId === patientId || m.recipientId === user.profile.id || m.senderId === user.profile.id
    )
    return [...sentLocal, ...base].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [user, activePatientId, sentLocal])

  const selected = messages.find((m) => m.id === selectedId) ?? messages[0] ?? null

  const markRead = (id: string) => {
    setSelectedId(id)
    setReadIds((prev) => new Set(prev).add(id))
  }

  const handleSend = () => {
    if (!user || !selected || !draft.trim()) return
    const reply: HealthMessage = {
      id: `msg-local-${Date.now()}`,
      senderId: user.profile.id,
      senderName: user.profile.fullName,
      senderRole: user.role,
      recipientId: selected.senderId === user.profile.id ? selected.recipientId : selected.senderId,
      recipientName:
        selected.senderId === user.profile.id ? selected.recipientName : selected.senderName,
      subject: selected.subject.startsWith('Re:') ? selected.subject : `Re: ${selected.subject}`,
      body: draft.trim(),
      priority: 'normal',
      isRead: true,
      threadId: selected.threadId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSentLocal((prev) => [reply, ...prev])
    setDraft('')
    setSelectedId(reply.id)
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <EmptyState
          title="ورود لازم است"
          description="برای مشاهده پیام‌های تیم سلامت وارد حساب خود شوید."
          action={
            <Button asChild>
              <Link to="/login">ورود</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="پیام‌های سلامت"
        subtitle="ارتباط با تیم مراقبت و پیگیری درخواست‌ها"
        breadcrumb={[{ label: 'خانه', href: '/dashboard' }, { label: 'پیام‌ها' }]}
      />

      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title="پیامی وجود ندارد"
          description="هنوز پیامی از تیم سلامت دریافت نکرده‌اید."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border py-3">
              <CardTitle className="text-base">صندوق پیام</CardTitle>
            </CardHeader>
            <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {messages.map((msg) => {
                const isActive = (selected?.id ?? '') === msg.id
                const unread = !msg.isRead && !readIds.has(msg.id) && msg.recipientId === user.profile.id
                return (
                  <li key={msg.id}>
                    <button
                      type="button"
                      onClick={() => markRead(msg.id)}
                      className={`w-full px-4 py-3 text-right transition-colors ${
                        isActive ? 'bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${unread ? 'font-semibold text-navy' : 'font-medium text-navy'}`}>
                          {msg.subject}
                        </p>
                        {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="خوانده‌نشده" />}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {msg.senderName} · {formatPersianDate(msg.createdAt, 'datetime')}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {selected && (
            <Card>
              <CardHeader className="border-b border-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {selected.subject}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      از {selected.senderName} به {selected.recipientName} ·{' '}
                      {formatPersianDate(selected.createdAt, 'datetime')}
                    </p>
                  </div>
                  <Badge variant={selected.priority === 'urgent' ? 'warning' : 'secondary'}>
                    {PRIORITY_LABELS[selected.priority] ?? selected.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm leading-7 text-navy">
                  {selected.body}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-navy">پاسخ</p>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    placeholder="پیام خود را بنویسید. از این بخش برای تشخیص یا تجویز دارو استفاده نکنید."
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {toPersianDigits(draft.length)} نویسه
                    </p>
                    <Button onClick={handleSend} disabled={!draft.trim()}>
                      <Send className="h-4 w-4" />
                      ارسال پاسخ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
