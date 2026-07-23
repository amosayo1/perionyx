"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "metric" | "chart" | "table-row" | "avatar";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = "text", width, height }: SkeletonProps) {
  const base = "animate-pulse rounded bg-zinc-800/50";
  const variants: Record<string, string> = {
    text: "h-3 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "h-32 w-full rounded-xl",
    metric: "h-24 w-full rounded-xl",
    chart: "h-48 w-full rounded-xl",
    "table-row": "h-10 w-full",
    avatar: "rounded-full h-8 w-8",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonGroup({ count = 3, variant = "text", className }: { count?: number; variant?: string; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant as any} />
      ))}
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="mt-2 h-7 w-1/2" />
      <Skeleton variant="text" className="mt-2 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
      <Skeleton variant="chart" height={height} />
    </div>
  );
}

export function LoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-8 w-8 border-3" };
  return (
    <div className={cn("flex items-center justify-center", className)} role="status">
      <div
        className={cn(
          "animate-spin rounded-full border-zinc-700 border-t-[#d4a800]",
          sizes[size],
        )}
        aria-label="Loading"
      />
    </div>
  );
}
