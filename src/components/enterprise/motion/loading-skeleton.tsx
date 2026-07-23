"use client";

import { cn } from "@/lib/utils";
import { staggerContainer } from "./tokens";
import { useMotion } from "./provider";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "rect" | "chart" | "metric" | "table-row";
  width?: string | number;
  height?: string | number;
}

const variantStyles: Record<string, string> = {
  text: "h-4 w-full",
  card: "h-32 w-full rounded-2xl",
  circle: "h-10 w-10 rounded-full",
  rect: "h-20 w-full rounded-xl",
  chart: "h-24 w-full rounded-xl",
  metric: "h-16 w-48 rounded-xl",
  "table-row": "h-10 w-full rounded-lg",
};

const shimmerStyle = "relative overflow-hidden bg-zinc-900/60 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent";

export function LoadingSkeleton({ className, variant = "text", width, height }: LoadingSkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(shimmerStyle, variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  );
}

interface SkeletonGroupProps {
  count: number;
  variant?: LoadingSkeletonProps["variant"];
  className?: string;
  layout?: "column" | "row" | "grid";
}

export function SkeletonGroup({ count, variant = "text", className, layout = "column" }: SkeletonGroupProps) {
  const { enabled } = useMotion();
  const layoutClass = layout === "row" ? "flex gap-3 items-center" : layout === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-3" : "space-y-3";

  const items = Array.from({ length: count }).map((_, i) => (
    <LoadingSkeleton key={i} variant={variant} />
  ));

  if (!enabled) {
    return <div className={cn(layoutClass, className)} aria-label="Loading" role="status">
      {items}
      <span className="sr-only">Loading...</span>
    </div>;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn(layoutClass, className)}
      aria-label="Loading"
      role="status"
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {item}
        </motion.div>
      ))}
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4", className)} aria-label="Loading" role="status">
      <LoadingSkeleton variant="text" width="60%" />
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton key={i} variant="text" />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn("space-y-2", className)} aria-label="Loading" role="status">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} variant="text" width={`${100 / columns}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <LoadingSkeleton key={j} variant="text" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
