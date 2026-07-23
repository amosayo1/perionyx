"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "subtle" | "gold";
  blur?: "sm" | "md" | "xl" | "2xl";
  noBorder?: boolean;
  interactive?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  default: "bg-zinc-900/60 backdrop-blur-sm border border-white/[0.06]",
  elevated: "bg-zinc-900/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl",
  subtle: "bg-white/[0.02] backdrop-blur-sm border border-white/[0.04]",
  gold: "bg-[#d4af37]/[0.03] backdrop-blur-sm border border-[#d4af37]/15",
};

const BLUR_MAP: Record<string, string> = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
};

export function GlassPanel({
  children, variant = "default", blur, noBorder, interactive, className, ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        VARIANT_STYLES[variant],
        blur && BLUR_MAP[blur],
        noBorder && "border-transparent",
        interactive && "hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GlassCardProps extends GlassPanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  headerClassName?: string;
}

export function GlassCard({
  children, title, description, action, variant = "default", className, headerClassName, ...props
}: GlassCardProps) {
  return (
    <GlassPanel variant={variant} className={cn("", className)} {...props}>
      {(title || action) && (
        <div className={cn("flex items-center justify-between px-5 pt-4", headerClassName)}>
          <div className="min-w-0">
            {title && <p className="text-sm font-semibold text-white truncate">{title}</p>}
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0 ml-2">{action}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </GlassPanel>
  );
}
