import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect" | "card" | "metric" | "chart" | "table-row";
  lines?: number;
  width?: string | number;
  height?: string | number;
}

const variantStyles: Record<string, string> = {
  text: "h-4 rounded-[var(--radius-sm)]",
  circle: "rounded-full",
  rect: "rounded-[var(--radius-md)]",
  card: "rounded-[var(--radius-lg)]",
  metric: "rounded-[var(--radius-lg)]",
  chart: "rounded-[var(--radius-lg)]",
  "table-row": "rounded-[var(--radius-sm)]",
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", lines = 1, width, height, className, ...props }, ref) => {
    if (lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "bg-[var(--surface-tertiary)] animate-pulse",
                variantStyles[variant],
                i === lines - 1 && "w-3/4"
              )}
              style={{ width: width, height: height }}
            />
          ))}
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--surface-tertiary)] animate-pulse",
          variantStyles[variant],
          className
        )}
        style={{ width: width, height: height }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export const SkeletonGroup = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3", className)} {...props}>{children}</div>
);

export const SkeletonCard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] border border-[var(--border-subtle)] p-4 space-y-3", className)} {...props}>
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="metric" height={32} />
    <Skeleton variant="chart" height={120} />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }: HTMLAttributes<HTMLDivElement> & { rows?: number; cols?: number }) => (
  <div className={cn("space-y-2", className)} {...props}>
    <div className={cn("grid gap-4 pb-2 border-b border-[var(--border-subtle)]", `grid-cols-${cols}`)}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" height={16} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={cn("grid gap-4 py-2", `grid-cols-${cols}`)}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} variant="text" height={14} />
        ))}
      </div>
    ))}
  </div>
);
