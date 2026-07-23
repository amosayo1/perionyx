"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { slideInRight, fadeIn } from "./tokens";
import { useMotion } from "./provider";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  description?: string;
}

interface AnimatedToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  className?: string;
}

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
};

const variantBorders: Record<ToastVariant, string> = {
  success: "border-emerald-500/20",
  error: "border-red-500/20",
  info: "border-blue-500/20",
  warning: "border-amber-500/20",
};

export function AnimatedToast({ toasts, onDismiss, className }: AnimatedToastProps) {
  const { enabled } = useMotion();

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm", className)}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={enabled ? slideInRight : undefined}
            initial={enabled ? "hidden" : undefined}
            animate={enabled ? "visible" : undefined}
            exit={enabled ? "exit" : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-zinc-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl",
              variantBorders[toast.variant],
            )}
          >
            <span className="mt-0.5 shrink-0">{variantIcons[toast.variant]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">{toast.message}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-zinc-500">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
