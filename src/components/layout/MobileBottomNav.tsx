import { NavLink } from 'react-router-dom'
import { Home, FileHeart, Calendar, ClipboardCheck, Bot, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
  { to: '/dashboard', label: 'خانه', icon: Home, end: true },
  { to: '/health-record', label: 'پرونده', icon: FileHeart },
  { to: '/appointments', label: 'نوبت', icon: Calendar },
  { to: '/screenings', label: 'ارزیابی', icon: ClipboardCheck },
  { to: '/assistant', label: 'دستیار', icon: Bot },
  { to: '/profile', label: 'بیشتر', icon: MoreHorizontal },
]

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="ناوبری موبایل"
    >
      <ul className="grid grid-cols-6">
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium',
                    isActive ? 'text-primary' : 'text-muted-foreground'
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
