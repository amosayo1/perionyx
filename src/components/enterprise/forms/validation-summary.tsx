"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle, Info } from "lucide-react";
import type { FieldError } from "./types";

interface ValidationSummaryProps {
  errors: FieldError[];
  warnings?: FieldError[];
  className?: string;
  onFieldFocus?: (field: string) => void;
}

const summaryVariants = {
  initial: { opacity: 0, scale: 0.96, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -4 },
};

export function ValidationSummary({ errors, warnings, className, onFieldFocus }: ValidationSummaryProps) {
  const hasContent = errors.length > 0 || (warnings && warnings.length > 0);

  return (
    <AnimatePresence>
      {hasContent && (
        <motion.div
          variants={summaryVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className={cn("rounded-lg border p-4", errors.length ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5", className)}
          role="alert"
        >
      <div className="flex items-start gap-3">
        {errors.length > 0 ? (
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        )}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-zinc-200">
            {errors.length > 0
              ? `${errors.length} field${errors.length > 1 ? "s" : ""} need${errors.length > 1 ? "" : "s"} attention`
              : `${warnings!.length} field${warnings!.length > 1 ? "s" : ""} with recommendations`}
          </p>
          <ul className="space-y-1">
            {errors.map((err) => (
              <li key={`${err.field}-${err.message}`}>
                <button
                  type="button"
                  onClick={() => onFieldFocus?.(err.field)}
                  className="flex items-start gap-2 text-[11px] text-red-300 hover:text-red-200 transition-colors text-left"
                >
                  <span className="font-mono text-[10px] opacity-60 mt-0.5">{err.field}</span>
                  <span>{err.message}</span>
                </button>
              </li>
            ))}
            {warnings?.map((warn) => (
              <li key={`warn-${warn.field}-${warn.message}`}>
                <button
                  type="button"
                  onClick={() => onFieldFocus?.(warn.field)}
                  className="flex items-start gap-2 text-[11px] text-amber-300 hover:text-amber-200 transition-colors text-left"
                >
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{warn.message}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
