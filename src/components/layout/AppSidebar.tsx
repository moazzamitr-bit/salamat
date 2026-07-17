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
    // citizen: home points to dashboard experience via public home + dashboard links
    return true
  }).map((item) =>
    user?.role === 'citizen' && item.id === 'home'
      ? { ...item, path: '/dashboard', label: 'خانه' }
      : item
  )

  return (
    <aside className="flex h-full flex-col border-l border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white" aria-hidden>
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">خدمات دیجیتال سلامت</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="منوی اصلی">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? Home
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-navy'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        {user?.role === 'care_team' && (
          <NavLink
            to="/care-team"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted hover:text-navy'
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
                isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-muted hover:text-navy'
              )
            }
          >
            <Shield className="h-4 w-4" />
            پنل مدیریت
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
