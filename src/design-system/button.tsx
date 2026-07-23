"use client";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "warning";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-gold)] text-[var(--text-inverse)] hover:bg-[var(--color-gold-hover)] focus-visible:ring-[var(--color-gold)]/50 shadow-[var(--shadow-soft)]",
  secondary: "bg-[var(--surface-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--text-secondary)]/30",
  ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] focus-visible:ring-[var(--text-secondary)]/20",
  outline: "border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] focus-visible:ring-[var(--text-secondary)]/30",
  danger: "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 focus-visible:ring-[var(--color-danger)]/50",
  success: "bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 focus-visible:ring-[var(--color-success)]/50",
  warning: "bg-[var(--color-warning)] text-[var(--text-inverse)] hover:bg-[var(--color-warning)]/90 focus-visible:ring-[var(--color-warning)]/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 px-2 text-[11px] gap-1 rounded-[var(--radius-sm)]",
  sm: "h-8 px-3 text-[12px] gap-1.5 rounded-[var(--radius-md)]",
  md: "h-10 px-4 text-[13px] gap-2 rounded-[var(--radius-md)]",
  lg: "h-11 px-5 text-[14px] gap-2 rounded-[var(--radius-lg)]",
  xl: "h-12 px-6 text-[15px] gap-2.5 rounded-[var(--radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, iconPosition = "left", className, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-primary)]",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === "right" && !loading ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export const ToolbarButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant" | "size">>(
  (props, ref) => <Button ref={ref} variant="ghost" size="sm" {...props} />
);
ToolbarButton.displayName = "ToolbarButton";

export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "children"> & { "aria-label": string }>(
  ({ size = "sm", ...props }, ref) => <Button ref={ref} variant="ghost" size={size} {...props} />
);
IconButton.displayName = "IconButton";
