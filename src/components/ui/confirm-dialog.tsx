"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  className,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  return (
    <AnimatedDialog open={open} onClose={onCancel} size="sm" className={className}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            destructive ? "bg-red-500/10" : "bg-gold/10",
          )}>
            <AlertTriangle className={cn("h-5 w-5", destructive ? "text-red-400" : "text-gold")} />
          </div>
          <div className="flex-1">
            <h2 id="confirm-title" className="text-base font-semibold text-zinc-200">{title}</h2>
            <p id="confirm-message" className="mt-1 text-sm text-zinc-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/[0.06] px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 active:bg-zinc-700"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium",
              destructive
                ? "bg-red-600 text-white hover:bg-red-500 active:bg-red-400"
                : "bg-gold text-black hover:bg-gold/90 active:bg-gold/80",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </AnimatedDialog>
  );
}
