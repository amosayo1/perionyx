"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fadeInUp } from "@/components/enterprise/motion/tokens";

interface AgentMetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: ReactNode;
  active?: boolean;
  className?: string;
}

const TREND_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: "text-emerald-400" },
  down: { icon: TrendingDown, color: "text-red-400" },
  neutral: { icon: Minus, color: "text-zinc-400" },
};

export function AgentMetricCard({ label, value, trend, icon, active, className }: AgentMetricCardProps) {
  const trendConfig = trend ? TREND_CONFIG[trend.direction] ?? TREND_CONFIG.neutral : null;
  const TrendIcon = trendConfig?.icon ?? Minus;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        active
          ? "border-[#d4af37]/30 bg-[#d4af37]/5"
          : "border-white/[0.09] bg-[#101010]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border",
              active
                ? "border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/[0.06] bg-white/[0.03] text-zinc-400",
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-zinc-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={cn("text-2xl font-bold", active ? "text-[#d4af37]" : "text-white")}>
              {value}
            </p>
            {trend && trendConfig && (
              <span className={cn("flex items-center gap-0.5 text-xs", trendConfig.color)}>
                <TrendIcon className="h-3 w-3" />
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
