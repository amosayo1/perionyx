"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "./tokens";
import { useMotion } from "./provider";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const { enabled } = useMotion();

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
