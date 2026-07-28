"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { hoverElevate, hoverScale, tapScale } from "./tokens";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "elevate" | "scale" | "none";
  selected?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children, className, hoverEffect = "elevate", selected, onClick,
}: AnimatedCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  const cardRole = onClick ? ("button" as const) : undefined;
  const cardTabIndex = onClick ? 0 : undefined;

  return (
    <motion.div
      whileHover={hoverEffect !== "none" ? (hoverEffect === "elevate" ? hoverElevate : hoverScale) : undefined}
      whileTap={hoverEffect !== "none" ? tapScale : undefined}
      animate={selected ? { borderColor: "rgba(212,175,55,0.5)", boxShadow: "0 0 20px rgba(212,175,55,0.1)" } : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={cardRole}
      tabIndex={cardTabIndex}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-zinc-900/40 transition-colors",
        onClick && "cursor-pointer",
        selected && "border-gold/50 shadow-lg shadow-black/30",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
