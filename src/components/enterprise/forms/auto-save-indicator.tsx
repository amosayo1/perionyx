"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle, CheckCircle2, Clock, Save } from "lucide-react";
import type { FormStatus } from "./types";

interface AutoSaveIndicatorProps {
  status: FormStatus;
  lastSaved?: Date;
  errorMessage?: string;
  className?: string;
  onRetry?: () => void;
}

export const AutoSaveIndicator = memo(function AutoSaveIndicator({
  status,
  lastSaved,
  errorMessage,
  className,
  onRetry,
}: AutoSaveIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all",
        status === "saving" && "bg-blue-500/10 text-blue-400",
        status === "saved" && "bg-emerald-500/10 text-emerald-400",
        status === "error" && "bg-red-500/10 text-red-400",
        status === "unsaved" && "bg-amber-500/10 text-amber-400",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Clock className="h-3 w-3 animate-pulse" />
          Saving...
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Saved{lastSaved && ` at ${lastSaved.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3" />
          {errorMessage || "Save failed"}
          {onRetry && (
            <button onClick={onRetry} className="ml-1 underline hover:no-underline">
              Retry
            </button>
          )}
        </>
      )}
      {status === "unsaved" && (
        <>
          <Save className="h-3 w-3" />
          Unsaved changes
        </>
      )}
    </div>
  );
});
