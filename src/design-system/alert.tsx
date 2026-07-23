"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const variantConfig = {
  info: { icon: Info, bg: "bg-[var(--color-info-muted)]", border: "border-[var(--color-info)]/20", text: "text-[var(--color-info)]", iconColor: "text-[var(--color-info)]" },
  success: { icon: CheckCircle, bg: "bg-[var(--color-success-muted)]", border: "border-[var(--color-success)]/20", text: "text-[var(--color-success)]", iconColor: "text-[var(--color-success)]" },
  warning: { icon: AlertTriangle, bg: "bg-[var(--color-warning-muted)]", border: "border-[var(--color-warning)]/20", text: "text-[var(--color-warning)]", iconColor: "text-[var(--color-warning)]" },
  danger: { icon: XCircle, bg: "bg-[var(--color-danger-muted)]", border: "border-[var(--color-danger)]/20", text: "text-[var(--color-danger)]", iconColor: "text-[var(--color-danger)]" },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", title, dismissible, onDismiss, action, className, children, ...props }, ref) => {
    const config = variantConfig[variant];
    const Icon = config.icon;
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border",
          config.bg, config.border,
          className
        )}
        {...props}
      >
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && <h4 className={cn("text-[13px] font-semibold mb-0.5", config.text)}>{title}</h4>}
          <div className="text-[13px] text-[var(--text-secondary)]">{children}</div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
        {dismissible && (
          <button onClick={onDismiss} className="shrink-0 p-1 rounded-[var(--radius-sm)] hover:bg-white/5 text-[var(--text-tertiary)]" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";
