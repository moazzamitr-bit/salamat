import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmergencyBanner } from '@/components/EmergencyBanner'
import { useAuth } from '@/features/auth/AuthContext'
import { notifications } from '@/mock-data/notifications'
import { toPersianDigits, cn } from '@/lib/utils'

interface AppHeaderProps {
  onMenuToggle: () => void
  menuOpen: boolean
}

export function AppHeader({ onMenuToggle, menuOpen }: AppHeaderProps) {
  const { user, isAuthenticated, logout, activePatientId, activePatientName, familyMembers, setActivePatient } =
    useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [familyOpen, setFamilyOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const unread = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setNotifOpen(false)
        setFamilyOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="relative hidden min-w-0 flex-1 md:block md:max-w-lg">
          <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجوی خدمات، مراکز یا مطالب آموزشی..."
            className="h-11 rounded-xl border-border/70 bg-muted/40 pe-9 shadow-inset"
            aria-label="جستجو"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSearchOpen((v) => !v)}
          aria-label="جستجو"
        >
          <Search className="h-5 w-5" />
        </Button>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <EmergencyBanner compact />

          {isAuthenticated && user?.role === 'citizen' && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-11 gap-1.5 rounded-xl border-border/70 bg-white"
                onClick={() => {
                  setFamilyOpen((v) => !v)
                  setNotifOpen(false)
                }}
                aria-expanded={familyOpen}
                aria-haspopup="listbox"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">{activePatientName}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
              {familyOpen && (
                <div
                  className="absolute start-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border bg-white p-1.5 shadow-panel animate-fade-in"
                  role="listbox"
                  aria-label="انتخاب عضو خانواده"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={activePatientId === user.profile.id}
                    className={cn(
                      'flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-right hover:bg-muted',
                      activePatientId === user.profile.id && 'bg-accent text-primary'
                    )}
                    onClick={() => {
                      setActivePatient(user.profile.id)
                      setFamilyOpen(false)
                    }}
                  >
                    {user.profile.fullName}
                    <span className="ms-auto text-xs text-muted-foreground">خودم</span>
                  </button>
                  {familyMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={activePatientId === m.patientId}
                      className={cn(
                        'flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-right hover:bg-muted',
                        activePatientId === m.patientId && 'bg-accent text-primary'
                      )}
                      onClick={() => {
                        setActivePatient(m.patientId)
                        setFamilyOpen(false)
                      }}
                    >
                      {m.profile.fullName}
                      <span className="ms-auto text-xs text-muted-foreground">{m.relationshipLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotifOpen((v) => !v)
                  setFamilyOpen(false)
                }}
                aria-label="اعلان‌ها"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute start-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
                    {toPersianDigits(unread)}
                  </span>
                )}
              </Button>
              {notifOpen && (
                <div className="absolute start-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white shadow-panel animate-fade-in">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-navy">اعلان‌ها</p>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 6).map((n) => (
                      <li
                        key={n.id}
                        className={cn('border-b border-border px-4 py-3', !n.isRead && 'bg-accent/40')}
                      >
                        <p className="text-sm font-medium text-navy">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={logout} aria-label="خروج">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/login">ورود</Link>
            </Button>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-border/70 px-4 py-3 md:hidden animate-fade-in">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="جستجوی خدمات و مراکز..."
              className="h-11 rounded-xl bg-muted/40 pe-9"
              aria-label="جستجو"
            />
          </div>
        </div>
      )}
    </header>
  )
}
