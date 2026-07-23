"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "./tokens";
import { useMotion } from "./provider";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnimatedMetricProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: "currency" | "number" | "percent";
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

function formatValue(value: number, format?: string, decimals?: number): string {
  const d = decimals ?? (format === "currency" ? 2 : format === "percent" ? 1 : 0);
  return value.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function AnimatedMetric({
  label, value, previousValue, format, prefix, suffix, decimals, trend, className,
}: AnimatedMetricProps) {
  const { enabled } = useMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    if (value === displayValue || !enabled) {
      setDisplayValue(value);
      return;
    }
    fromRef.current = displayValue;
    startRef.current = null;
    const duration = 600;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(fromRef.current + (value - fromRef.current) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, enabled]);

  const formatted = `${prefix ?? ""}${formatValue(displayValue, format, decimals)}${suffix ?? ""}${format === "percent" ? "%" : ""}`;
  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <motion.div
      variants={enabled ? fadeInUp : undefined}
      initial={enabled ? "hidden" : undefined}
      animate={enabled ? "visible" : undefined}
      className={cn("space-y-1", className)}
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white tabular-nums tracking-tight">
          {formatted}
        </span>
        {trend && (
          <TrendIcon className={cn(
            "h-4 w-4",
            trend === "up" && "text-emerald-400",
            trend === "down" && "text-red-400",
            trend === "neutral" && "text-zinc-500",
          )} />
        )}
      </div>
      {previousValue !== undefined && value !== previousValue && (
        <p className={cn(
          "text-xs tabular-nums",
          value > previousValue ? "text-emerald-400" : value < previousValue ? "text-red-400" : "text-zinc-500",
        )}>
          {value > previousValue ? "+" : ""}{((value - previousValue) / previousValue * 100).toFixed(1)}% vs previous
        </p>
      )}
    </motion.div>
  );
}
