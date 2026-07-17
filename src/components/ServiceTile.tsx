import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceTileProps {
  to: string
  label: string
  description?: string
  icon?: LucideIcon
  className?: string
}

export function ServiceTile({ to, label, description, icon: Icon, className }: ServiceTileProps) {
  return (
    <Link to={to} className={cn('service-tile group', className)}>
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span className="icon-well transition-colors group-hover:bg-primary group-hover:text-white">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : (
          <span className="status-dot mt-2 bg-secondary" aria-hidden />
        )}
        <ArrowLeft
          className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      </div>
      <div>
        <p className="font-semibold text-navy">{label}</p>
        {description && <p className="mt-1 text-caption">{description}</p>}
      </div>
    </Link>
  )
}

export default ServiceTile
