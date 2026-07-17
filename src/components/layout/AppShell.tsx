import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Desktop right sidebar */}
        <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <AppSidebar />
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-navy/40"
              aria-label="بستن منو"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-y-0 end-0 w-72 max-w-[85vw] shadow-panel">
              <AppSidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
          <main className={cn('flex-1 pb-24 lg:pb-8', !isAuthenticated && 'pb-8')}>
            <Outlet />
          </main>
        </div>
      </div>
      {isAuthenticated && <MobileBottomNav />}
    </div>
  )
}
