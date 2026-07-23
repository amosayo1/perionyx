"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { scaleInDown, fadeIn } from "./tokens";
import { useMotion } from "./provider";
import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface AnimatedDialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export function AnimatedDialog({
  open, onClose, children, title, className, size = "md",
}: AnimatedDialogProps) {
  const { enabled } = useMotion();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="dialog-backdrop"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClose(); }}
            aria-label="Close dialog"
          />
          <motion.div
            key="dialog-content"
            variants={enabled ? scaleInDown : undefined}
            initial={enabled ? "hidden" : undefined}
            animate={enabled ? "visible" : undefined}
            exit={enabled ? "exit" : undefined}
            className={cn(
              "relative w-full rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-2xl",
              sizeStyles[size],
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
