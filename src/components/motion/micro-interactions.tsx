"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── PulseDot ──────────────────────────────────── */
interface PulseDotProps {
  color?: "gold" | "emerald" | "red" | "amber" | "blue" | "zinc";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const dotColors = {
  gold: "bg-[#d4a800] shadow-[0_0_8px_rgba(212,168,0,0.4)]",
  emerald: "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]",
  red: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  zinc: "bg-zinc-500",
};

const dotSizes = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };

export function PulseDot({ color = "zinc", size = "md", pulse = true, className }: PulseDotProps) {
  return (
    <motion.span
      className={cn("inline-block shrink-0 rounded-full", dotSizes[size], dotColors[color], className)}
      animate={pulse ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] } : undefined}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

/* ─── LoadingDots ────────────────────────────────── */
interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-zinc-500"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─── ThinkingIndicator ──────────────────────────── */
interface ThinkingIndicatorProps {
  label?: string;
  className?: string;
}

export function ThinkingIndicator({ label = "Thinking", className }: ThinkingIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] text-zinc-500", className)}>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#d4a800]/60"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </span>
      {label}
    </span>
  );
}

/* ─── SuccessCheck ──────────────────────────────── */
interface SuccessCheckProps {
  size?: number;
  className?: string;
}

export function SuccessCheck({ size = 24, className }: SuccessCheckProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-emerald-500", className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.6 }}
    >
      <motion.circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      />
      <motion.path
        d="M7 12l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: [0, 0, 0.2, 1] }}
      />
    </motion.svg>
  );
}

/* ─── FailureX ──────────────────────────────────── */
interface FailureXProps {
  size?: number;
  className?: string;
}

export function FailureX({ size = 24, className }: FailureXProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-red-500", className)}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.6 }}
    >
      <motion.circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      />
      <motion.path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, delay: 0.15, ease: [0, 0, 0.2, 1] }}
      />
    </motion.svg>
  );
}

/* ─── NotificationBadge ─────────────────────────── */
interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  return (
    <motion.span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#d4a800] px-1 text-[9px] font-bold text-black min-w-[16px] h-4",
        className,
      )}
      key={count}
      initial={{ scale: 1.3 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, mass: 0.4 }}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

/* ─── ProgressBar (animated) ────────────────────── */
interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: "gold" | "emerald" | "amber" | "red" | "blue";
  className?: string;
}

const progressColors = {
  gold: "bg-[#d4a800]",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

export function AnimatedProgress({ value, max = 100, color = "gold", className }: AnimatedProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-zinc-800", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <motion.div
        className={cn("h-full rounded-full", progressColors[color])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      />
    </div>
  );
}

/* ─── ShimmerBlock ──────────────────────────────── */
interface ShimmerBlockProps {
  className?: string;
}

export function ShimmerBlock({ className }: ShimmerBlockProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-zinc-800/50 bg-[length:200%_100%]",
        className,
      )}
      style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
      aria-hidden="true"
    />
  );
}
