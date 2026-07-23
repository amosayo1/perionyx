"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnterpriseButton } from "../buttons";

export interface EnterpriseDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[90vw] max-h-[90vh]",
};

export function EnterpriseDialog({ open, onClose, title, description, children, footer, size = "md", className }: EnterpriseDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className={cn(
              "relative w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl",
              sizeMap[size],
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800/60 px-6 py-4">
                <div>
                  {title && <h2 className="text-[15px] font-semibold text-white">{title}</h2>}
                  {description && <p className="mt-0.5 text-[12px] text-zinc-500">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-6 py-4 max-h-[60vh]">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-zinc-800/60 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  destructive = false,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  destructive?: boolean;
  isLoading?: boolean;
}) {
  return (
    <EnterpriseDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <EnterpriseButton variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </EnterpriseButton>
          <EnterpriseButton
            variant={destructive ? "danger" : confirmVariant}
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </EnterpriseButton>
        </>
      }
    />
  );
}
