import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface DashboardLayoutProps extends HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  kpis?: React.ReactNode;
  alerts?: React.ReactNode;
  recommendations?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  activity?: React.ReactNode;
}

export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ header, kpis, alerts, recommendations, children, sidebar, activity, className, ...props }, ref) => (
    <div ref={ref} className={cn("mx-auto max-w-7xl space-y-6", className)} {...props}>
      {header}
      {kpis && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">{kpis}</div>}
      {alerts}
      {recommendations}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">{children}</div>
        {sidebar && <div className="space-y-6">{sidebar}</div>}
      </div>
      {activity}
    </div>
  )
);
DashboardLayout.displayName = "DashboardLayout";

export const DashboardSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { title: string; action?: React.ReactNode }>(
  ({ title, action, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4", className)} {...props}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
);
DashboardSection.displayName = "DashboardSection";
