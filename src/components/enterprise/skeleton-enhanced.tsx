"use client";

import { cn } from "@/lib/utils";

interface SkeletonEnhancedProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect" | "chart";
  width?: string | number;
  height?: string | number;
}

export function SkeletonEnhanced({ className, variant = "text", width, height }: SkeletonEnhancedProps) {
  const base = "relative overflow-hidden rounded-lg bg-zinc-900/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent";

  const variants: Record<string, string> = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-2xl",
    circle: "h-10 w-10 rounded-full",
    rect: "h-20 w-full rounded-xl",
    chart: "h-24 w-full rounded-xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

interface SkeletonGroupProps {
  count: number;
  variant?: SkeletonEnhancedProps["variant"];
  className?: string;
  layout?: "column" | "row" | "grid";
}

export function SkeletonGroup({ count, variant = "text", className, layout = "column" }: SkeletonGroupProps) {
  const layoutClass = layout === "row" ? "flex gap-3 items-center" : layout === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-3" : "space-y-3";

  return (
    <div className={cn(layoutClass, className)} aria-label="Loading" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEnhanced key={i} variant={variant} />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
