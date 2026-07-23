import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "gold" | "success" | "warning" | "danger" | "info" | "muted";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-tertiary)] text-[var(--text-secondary)] border-[var(--border-default)]",
  gold: "bg-[var(--color-gold-muted)] text-[var(--color-gold)] border-[var(--color-gold)]/20",
  success: "bg-[var(--color-success-muted)] text-[var(--color-success)] border-[var(--color-success)]/20",
  warning: "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  danger: "bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/20",
  info: "bg-[var(--color-info-muted)] text-[var(--color-info)] border-[var(--color-info)]/20",
  muted: "bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] border-[var(--border-subtle)]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-[11px]",
  lg: "px-2.5 py-1 text-[12px]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", icon, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 font-medium border rounded-[var(--radius-sm)]",
        "uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
);
Badge.displayName = "Badge";

export interface PriorityBadgeProps extends Omit<BadgeProps, "variant"> {
  priority: "critical" | "high" | "medium" | "low";
}

const priorityVariant: Record<string, BadgeVariant> = {
  critical: "danger",
  high: "warning",
  medium: "gold",
  low: "muted",
};

export const PriorityBadge = ({ priority, ...props }: PriorityBadgeProps) => (
  <Badge variant={priorityVariant[priority]} {...props} />
);

export interface StatusDotProps extends HTMLAttributes<HTMLDivElement> {
  status: "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md" | "lg";
}

const statusColors = {
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
  info: "bg-[var(--color-info)]",
  muted: "bg-[var(--text-disabled)]",
};

const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };

export const StatusDot = ({ status, size = "md", className, ...props }: StatusDotProps) => (
  <div
    className={cn("rounded-full shrink-0", statusColors[status], dotSizes[size], className)}
    {...props}
  />
);
