"use client";

import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./tokens";
import { useMotion } from "./provider";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function SectionTransition({ children, className, stagger }: SectionTransitionProps) {
  const { enabled } = useMotion();

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={stagger ? staggerContainer : fadeIn}
      initial="hidden"
      animate="visible"
      className={cn("", className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionItem({ children, className }: { children: ReactNode; className?: string }) {
  const { enabled } = useMotion();

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
