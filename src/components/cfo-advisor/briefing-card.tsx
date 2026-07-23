"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fadeInUp, expandCollapse } from "@/components/enterprise/motion/tokens";
import { useState } from "react";
import { Card, Button } from "@/design-system";

interface BriefingCardProps {
  title: string;
  icon: ReactNode;
  data: Record<string, any>;
  className?: string;
}

const TREND_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: "text-[var(--color-success)]" },
  down: { icon: TrendingDown, color: "text-[var(--color-danger)]" },
  neutral: { icon: Minus, color: "text-[var(--text-disabled)]" },
};

export function BriefingCard({ title, icon, data, className }: BriefingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const entries = Object.entries(data);
  const primaryKeys = entries.filter(([, v]) => typeof v !== "object" || v === null).slice(0, 4);
  const detailKeys = entries.filter(([, v]) => typeof v === "object" && v !== null);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-2xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 transition-colors",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-gold-muted)] text-[var(--color-gold)]">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>

      {primaryKeys.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          {primaryKeys.map(([key, value]) => {
            const trend = typeof value === "object" && value !== null && "trend" in value;
            const displayValue = trend ? value.value : String(value);
            const trendData = trend ? value.trend : null;
            const trendConfig = trendData ? TREND_CONFIG[trendData.direction] ?? TREND_CONFIG.neutral : null;
            const TrendIcon = trendConfig?.icon ?? Minus;

            return (
              <div key={key} className="min-w-0">
                <p className="truncate text-xs text-[var(--text-tertiary)]">{formatKey(key)}</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="truncate text-lg font-bold text-[var(--text-primary)]">{displayValue}</p>
                  {trendConfig && (
                    <span className={cn("flex items-center gap-0.5 text-xs", trendConfig.color)}>
                      <TrendIcon className="h-3 w-3" />
                      {trendData.value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailKeys.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-start gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            />
            {expanded ? "Hide details" : "Show details"}
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={expandCollapse}
                className="mt-3 space-y-2 border-t border-[var(--border-subtle)] pt-3"
              >
                {detailKeys.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">{formatKey(key)}</span>
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
