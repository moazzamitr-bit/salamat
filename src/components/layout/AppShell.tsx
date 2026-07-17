import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'
import { Phone, ShieldCheck } from 'lucide-react'
import { EMERGENCY_NUMBERS } from '@/lib/constants'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-dvh bg-background">
      <div className="trust-strip hidden sm:block">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-1.5 text-xs sm:px-6">
          <p className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            درگاه خدمات دیجیتال سلامت — اطلاعات شما محرمانه است
          </p>
          <a
            href={`tel:${EMERGENCY_NUMBERS.ambulance}`}
            className="inline-flex items-center gap-1.5 font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            اورژانس ۱۱۵
          </a>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[90rem]">
        <div className="sticky top-0 hidden h-[calc(100dvh)] w-[17rem] shrink-0 lg:block">
          <AppSidebar />
        </div>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-navy/45 backdrop-blur-[2px]"
              aria-label="بستن منو"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-y-0 end-0 w-80 max-w-[88vw] shadow-panel animate-fade-in">
              <AppSidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
          <main
            className={cn(
              'flex-1 bg-surface-2/60 pb-28 lg:pb-10',
              !isAuthenticated && 'pb-10'
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>
      {isAuthenticated && <MobileBottomNav />}
    </div>
  )
}
