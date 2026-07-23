"use client";

import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pin, Maximize2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type CardVariant = "standard" | "executive-kpi" | "analytics" | "treasury" | "timeline" | "recommendation" | "ai" | "metric" | "compact" | "expandable" | "interactive" | "pinned";

export interface EnterpriseCardProps {
  variant?: CardVariant;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  defaultExpanded?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  standard: "border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40",
  "executive-kpi": "border-gold-500/20 bg-gradient-to-b from-gold-500/5 to-zinc-900/40",
  analytics: "border-zinc-800/60 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20",
  treasury: "border-emerald-500/15 bg-gradient-to-b from-emerald-500/5 to-zinc-900/40",
  timeline: "border-zinc-800/40 bg-zinc-900/30",
  recommendation: "border-zinc-800/60 bg-gradient-to-r from-zinc-900/80 to-zinc-900/40",
  ai: "border-violet-500/15 bg-gradient-to-b from-violet-500/5 to-zinc-900/40",
  metric: "border-zinc-800/60 bg-zinc-900/40",
  compact: "border-zinc-800/40 bg-zinc-900/20 p-3",
  expandable: "border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40",
  interactive: "border-zinc-800/60 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 cursor-pointer hover:border-zinc-700/60",
  pinned: "border-[#d4a800]/30 bg-gradient-to-b from-gold-500/5 to-zinc-900/40",
};

export const EnterpriseCard = memo(function EnterpriseCard({
  variant = "standard",
  title,
  description,
  className,
  children,
  action,
  onClick,
  defaultExpanded = true,
}: EnterpriseCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [pinned, setPinned] = useState(variant === "pinned");

  const handleToggleExpand = useCallback(() => setExpanded((v) => !v), []);

  return (
    <motion.div
      className={cn(
        "group/card relative rounded-xl border p-4 shadow-lg transition-colors",
        variantStyles[variant],
        variant === "interactive" && "cursor-pointer",
        className,
      )}
      whileHover={variant === "interactive" ? { scale: 1.01, y: -1 } : undefined}
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-[13px] font-semibold text-zinc-200">{title}</h3>}
            {description && <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>}
          </div>
          <div className="flex items-center gap-1">
            {variant === "expandable" && (
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleExpand(); }}
                className="flex h-6 w-6 items-center justify-center rounded text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <motion.span animate={{ rotate: expanded ? 0 : -90 }} transition={{ duration: 0.15 }}>
                  ▼
                </motion.span>
              </button>
            )}
            {variant !== "pinned" && (
              <button
                onClick={(e) => { e.stopPropagation(); setPinned((v) => !v); }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded opacity-0 transition-all hover:bg-zinc-800 group-hover/card:opacity-100",
                  pinned ? "text-[#d4a800] opacity-100" : "text-zinc-600",
                )}
                aria-label={pinned ? "Unpin" : "Pin"}
              >
                <Pin className={cn("h-3 w-3", pinned && "fill-[#d4a800]")} />
              </button>
            )}
            {action}
          </div>
        </div>
      )}
      {variant === "expandable" ? (
        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
});
