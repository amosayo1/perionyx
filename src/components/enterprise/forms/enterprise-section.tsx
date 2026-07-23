"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Info, AlertCircle } from "lucide-react";
import type { FormSectionConfig } from "./types";
import { expandCollapse } from "@/components/enterprise/motion/tokens";

interface EnterpriseSectionProps {
  config: FormSectionConfig;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
  errors?: number;
}

export const EnterpriseSection = memo(function EnterpriseSection({
  config,
  defaultExpanded,
  children,
  className,
  errors,
}: EnterpriseSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? config.initiallyExpanded ?? !config.collapsible);

  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.06]",
        config.advanced && "bg-zinc-900/20",
        errors && errors > 0 && "border-red-500/20",
        className,
      )}
      role="region"
      aria-label={config.title}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          config.collapsible && "cursor-pointer select-none hover:bg-white/[0.02]",
        )}
        onClick={() => config.collapsible && setExpanded(!expanded)}
        role={config.collapsible ? "button" : undefined}
        tabIndex={config.collapsible ? 0 : undefined}
        onKeyDown={config.collapsible ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } } : undefined}
      >
        {config.icon && <span className="text-zinc-500">{config.icon}</span>}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">{config.title}</span>
            {config.optional && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">Optional</span>
            )}
            {config.advanced && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">Advanced</span>
            )}
          </div>
          {config.description && (
            <p className="text-[11px] text-zinc-500 mt-0.5">{config.description}</p>
          )}
        </div>
        {errors && errors > 0 ? (
          <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">
            <AlertCircle className="h-3 w-3" />
            {errors}
          </span>
        ) : null}
        {config.collapsible && (
          <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform duration-300", expanded && "rotate-180")} />
        )}
      </div>
      <AnimatePresence initial={false}>
        {(expanded || !config.collapsible) && (
          <motion.div
            key="section-content"
            variants={expandCollapse}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className="border-t border-white/[0.06] px-4 py-3 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
