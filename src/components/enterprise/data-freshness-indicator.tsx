"use client";

import { memo } from "react";
import { Database, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataFreshnessIndicatorProps {
  /** When the data was last seeded or loaded */
  lastSeededAt?: Date | string | null;
  /** Whether this data source is backed by a database (true) or in-memory (false) */
  isPersisted?: boolean;
  /** Optional label override */
  label?: string;
  className?: string;
}

export const DataFreshnessIndicator = memo(function DataFreshnessIndicator({
  lastSeededAt,
  isPersisted = false,
  label,
  className,
}: DataFreshnessIndicatorProps) {
  const seeded = lastSeededAt ? new Date(lastSeededAt) : null;
  const age = seeded ? formatAge(seeded) : null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isPersisted
          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
          : "border-amber-500/20 bg-amber-500/5 text-amber-400",
        className,
      )}
    >
      {isPersisted ? (
        <Database className="h-3 w-3" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
      <span>
        {label ?? (isPersisted ? "Persisted" : "In-memory")}
      </span>
      {age && (
        <span className="opacity-60">· {age}</span>
      )}
    </div>
  );
});

function formatAge(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
