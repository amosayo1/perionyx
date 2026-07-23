"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const COL_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function DashboardGrid({ children, columns = 2, className }: DashboardGridProps) {
  return (
    <div className={cn("grid gap-4", COL_MAP[columns], className)}>
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, description, action, children, className }: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface DashboardSidebarProps {
  children: ReactNode;
  className?: string;
}

export function DashboardSidebar({ children, className }: DashboardSidebarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

interface DashboardMainProps {
  children: ReactNode;
  className?: string;
}

export function DashboardMain({ children, className }: DashboardMainProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}

interface DashboardLayoutProps {
  main: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: "narrow" | "wide";
  className?: string;
}

export function DashboardLayout({ main, sidebar, sidebarWidth = "narrow", className }: DashboardLayoutProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-6",
      sidebar && (sidebarWidth === "narrow" ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[1fr_400px]"),
      className,
    )}>
      <DashboardMain>{main}</DashboardMain>
      {sidebar && <DashboardSidebar>{sidebar}</DashboardSidebar>}
    </div>
  );
}
