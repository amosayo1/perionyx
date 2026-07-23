"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotion } from "./provider";
import { staggerContainer, listItem } from "./tokens";
import type { ReactNode } from "react";

interface AnimatedTableProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedTable({ children, className }: AnimatedTableProps) {
  const { enabled } = useMotion();

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedTableRowProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedTableRow({ children, className, index = 0 }: AnimatedTableRowProps) {
  const { enabled } = useMotion();

  return (
    <AnimatePresence>
      <motion.div
        key={index}
        variants={enabled ? listItem : undefined}
        initial={enabled ? "hidden" : undefined}
        animate={enabled ? "visible" : undefined}
        exit={enabled ? "exit" : undefined}
        transition={{ delay: enabled ? index * 0.03 : 0 }}
        className={cn(
          "transition-colors hover:bg-white/[0.02]",
          className,
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
