import { NavLink } from 'react-router-dom'
import {
  Home,
  FileHeart,
  Calendar,
  ClipboardCheck,
  Bell,
  MapPin,
  BookOpen,
  Bot,
  Users,
  Settings,
  Stethoscope,
  Shield,
} from 'lucide-react'
import { NAV_ITEMS, APP_NAME } from '@/lib/constants'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  FileHeart,
  Calendar,
  ClipboardCheck,
  Bell,
  MapPin,
  BookOpen,
  Bot,
  Users,
  Settings,
}

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { user } = useAuth()

  const items = NAV_ITEMS.filter((item) => {
    if (!user) return ['home', 'centers', 'education', 'assistant'].includes(item.id)
    if (user.role === 'care_team') {
      return ['home', 'education', 'assistant', 'profile'].includes(item.id)
    }
    if (user.role === 'admin') {
      return ['home', 'education', 'profile'].includes(item.id)
    }
    return true
  }).map((item) =>
    user?.role === 'citizen' && item.id === 'home'
      ? { ...item, path: '/dashboard', label: 'خانه' }
      : item
  )

  const primaryIds = new Set([
    'home',
    'health-record',
    'appointments',
    'screenings',
    'reminders',
    'centers',
  ])
  const secondaryIds = new Set(['education', 'assistant'])
  const accountIds = new Set(['family', 'profile'])

  const groups = [
    {
      title: 'خدمات شهروند',
      items: items.filter((i) => primaryIds.has(i.id) || (!user && ['home', 'centers'].includes(i.id))),
    },
    {
      title: 'اطلاع‌رسانی',
      items: items.filter((i) => secondaryIds.has(i.id) || (!user && ['education', 'assistant'].includes(i.id))),
    },
    {
      title: 'حساب کاربری',
      items: items.filter((i) => accountIds.has(i.id)),
    },
  ].filter((g) => g.items.length > 0)

  return (
    <aside className="flex h-full flex-col border-l border-border/80 bg-white">
      <div className="border-b border-border/80 px-5 py-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-soft"
            aria-hidden
          >
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">درگاه ملی خدمات سلامت</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="منوی اصلی">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-muted-foreground">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = iconMap[item.icon] ?? Home
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.path === '/' || item.path === '/dashboard'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'nav-active-rail bg-accent text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-navy'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}

        {user?.role === 'care_team' && (
          <NavLink
            to="/care-team"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'nav-active-rail bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-navy'
              )
            }
          >
            <Stethoscope className="h-4 w-4" />
            پنل تیم سلامت
          </NavLink>
        )}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'nav-active-rail bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-navy'
              )
            }
          >
            <Shield className="h-4 w-4" />
            پنل مدیریت
          </NavLink>
        )}
      </nav>

      <div className="border-t border-border/80 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-navy">امنیت و حریم خصوصی</p>
        <p className="mt-1">دسترسی به پرونده بر اساس رضایت و نقش کاربری کنترل می‌شود.</p>
      </div>
    </aside>
  )
}
