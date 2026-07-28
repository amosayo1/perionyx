"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MobileMetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  color?: "gold" | "red" | "green" | "blue" | "amber";
  className?: string;
}

const colorMap = {
  gold: { accent: "text-gold", bg: "bg-gold/5", border: "border-gold/15" },
  red: { accent: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/15" },
  green: { accent: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/15" },
  blue: { accent: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/15" },
  amber: { accent: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" },
};

const trendIcons = {
  up: <TrendingUp className="h-3 w-3 text-emerald-400" />,
  down: <TrendingDown className="h-3 w-3 text-red-400" />,
  neutral: <Minus className="h-3 w-3 text-zinc-500" />,
};

export function MobileMetricCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  onClick,
  color = "gold",
  className,
}: MobileMetricCardProps) {
  const colors = colorMap[color];

  return (
    <motion.button
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 rounded-xl border p-4 text-left active:opacity-80",
        colors.bg,
        colors.border,
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-2xl font-semibold tracking-tight", colors.accent)}>{value}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-[11px] text-zinc-500">
            {trendIcons[trend]}
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-zinc-600">{subtitle}</p>}
    </motion.button>
  );
}
