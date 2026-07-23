import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, badge, actions, breadcrumbs, className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6", className)} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)] mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-[var(--text-disabled)]">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-[var(--text-secondary)] transition-colors">{crumb.label}</a>
              ) : (
                <span className="text-[var(--text-secondary)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-[13px] text-[var(--text-tertiary)] mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
);
PageHeader.displayName = "PageHeader";
