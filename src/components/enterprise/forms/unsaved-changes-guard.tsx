"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesGuardProps {
  hasUnsaved: boolean;
  onLeave?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  message?: string;
  className?: string;
}

export function UnsavedChangesGuard({
  hasUnsaved,
  onSave,
  onDiscard,
  onLeave,
  message = "You have unsaved changes. Do you want to save before leaving?",
  className,
}: UnsavedChangesGuardProps) {
  const hasUnsavedRef = useRef(hasUnsaved);
  hasUnsavedRef.current = hasUnsaved;

  useEffect(() => {
    if (!hasUnsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);

  const handleLeave = useCallback(() => {
    if (!hasUnsaved || !onLeave) return;
    onLeave();
  }, [hasUnsaved, onLeave]);

  if (!hasUnsaved) return null;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3", className)} role="alert">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <p className="flex-1 text-xs text-amber-300">{message}</p>
      <div className="flex items-center gap-2">
        {onSave && (
          <button
            onClick={onSave}
            className="rounded-md bg-amber-500/20 px-3 py-1.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            Save
          </button>
        )}
        {onDiscard && (
          <button
            onClick={onDiscard}
            className="rounded-md px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
}
