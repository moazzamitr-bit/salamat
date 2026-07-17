import { NavLink } from 'react-router-dom'
import { Home, FileHeart, Calendar, Bot, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
  { to: '/dashboard', label: 'خانه', icon: Home, end: true },
  { to: '/health-record', label: 'پرونده', icon: FileHeart },
  { to: '/appointments', label: 'نوبت', icon: Calendar },
  { to: '/assistant', label: 'دستیار', icon: Bot },
  { to: '/profile', label: 'بیشتر', icon: MoreHorizontal },
]

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <ul className="grid grid-cols-5 px-1 pt-1">
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:bg-muted/60'
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
