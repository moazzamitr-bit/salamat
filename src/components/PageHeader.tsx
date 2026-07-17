import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumb?: BreadcrumbItem[]
  className?: string
}

export function PageHeader({ title, subtitle, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="مسیر صفحه" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground/60" aria-hidden />
                  )}
                  {item.href && !isLast ? (
                    <Link to={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={cn(isLast && 'font-medium text-navy')}>{item.label}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="section-title">{title}</h1>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export default PageHeader
