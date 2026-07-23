"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "interactive" | "gold" | "danger" | "success";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-[var(--surface-secondary)] border border-[var(--border-default)]",
  elevated: "bg-[var(--surface-tertiary)] border border-[var(--border-default)] shadow-[var(--shadow-medium)]",
  interactive: "bg-[var(--surface-secondary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-medium)] cursor-pointer",
  gold: "bg-[var(--surface-secondary)] border border-[var(--border-gold)] shadow-[var(--shadow-glow-gold)]",
  danger: "bg-[var(--surface-secondary)] border border-[var(--color-danger)]/20 shadow-[var(--shadow-glow-danger)]",
  success: "bg-[var(--surface-secondary)] border border-[var(--color-success)]/20 shadow-[var(--shadow-glow-success)]",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hover, interactive, className, children, ...props }, ref) => {
    const isInteractive = interactive || hover;
    const Component = isInteractive ? motion.div : "div";
    const motionProps = isInteractive
      ? { whileHover: { y: -2, transition: { duration: 0.15 } } }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-[var(--radius-lg)]",
          variantStyles[variant],
          paddingStyles[padding],
          isInteractive && "transition-all duration-200",
          className
        )}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </Component>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-[14px] font-semibold text-[var(--text-primary)]", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-[12px] text-[var(--text-tertiary)]", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-3 border-t border-[var(--border-subtle)]", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
