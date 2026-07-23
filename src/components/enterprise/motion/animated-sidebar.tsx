"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { slideInLeft, slideInRight, fadeIn } from "./tokens";
import { useMotion } from "./provider";
import type { ReactNode } from "react";

interface AnimatedSidebarProps {
  children: ReactNode;
  open: boolean;
  onClose?: () => void;
  side?: "left" | "right";
  width?: string;
  className?: string;
}

export function AnimatedSidebar({
  children, open, onClose, side = "left", width = "w-72", className,
}: AnimatedSidebarProps) {
  const { enabled } = useMotion();
  const slideVariant = side === "left" ? slideInLeft : slideInRight;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sidebar-backdrop"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="sidebar-panel"
            variants={enabled ? slideVariant : undefined}
            initial={enabled ? "hidden" : undefined}
            animate={enabled ? "visible" : undefined}
            exit={enabled ? "exit" : undefined}
            className={cn(
              "fixed top-0 bottom-0 z-50 bg-zinc-950 border-r border-white/[0.06] overflow-y-auto",
              side === "left" ? "left-0" : "right-0 border-l border-r-0",
              width,
              className,
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
