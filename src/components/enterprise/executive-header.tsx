"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ExecutiveHeaderProps {
  badge: string;
  title: string;
  description: string;
  lastUpdated?: Date;
  company?: string;
  environment?: "production" | "sandbox" | "development";
  health?: "healthy" | "degraded" | "down";
  actions?: ReactNode;
  className?: string;
}

const healthConfig = {
  healthy: { label: "All Systems Normal", dot: "bg-emerald-500", text: "text-emerald-400" },
  degraded: { label: "Degraded Performance", dot: "bg-amber-500", text: "text-amber-400" },
  down: { label: "Service Disruption", dot: "bg-red-500", text: "text-red-400" },
};

const environmentConfig = {
  production: { label: "Production", ring: "ring-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  sandbox: { label: "Sandbox", ring: "ring-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10" },
  development: { label: "Development", ring: "ring-blue-500/30", text: "text-blue-400", bg: "bg-blue-500/10" },
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ExecutiveHeader({
  badge,
  title,
  description,
  lastUpdated,
  company,
  environment,
  health,
  actions,
  className,
}: ExecutiveHeaderProps) {
  const hc = health ? healthConfig[health] : null;
  const ec = environment ? environmentConfig[environment] : null;

  return (
    <div className={cn("flex flex-col gap-4 pb-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-md border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#c9a84c] uppercase">
              {badge}
            </span>
            {ec && (
              <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", ec.ring, ec.bg, ec.text)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {ec.label}
              </span>
            )}
            {hc && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
                <span className={cn("h-1.5 w-1.5 rounded-full", hc.dot)} />
                {hc.label}
              </span>
            )}
          </div>
          <h1 className="text-[28px] font-semibold leading-[36px] tracking-[-0.015em] text-white">
            {title}
          </h1>
          <p className="max-w-2xl text-[14px] leading-[22px] text-zinc-400">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3 pt-8">
            {actions}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-[12px] text-zinc-500">
        {lastUpdated && (
          <span>Last updated {formatTimestamp(lastUpdated)}</span>
        )}
        {company && (
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            {company}
          </span>
        )}
      </div>
    </div>
  );
}
