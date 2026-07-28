"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UndoEntry {
  id: string;
  label: string;
  timestamp: number;
  undo: () => void | Promise<void>;
}

interface UndoContextValue {
  push: (entry: Omit<UndoEntry, "timestamp">) => void;
  canUndo: boolean;
}

const UndoContext = createContext<UndoContextValue | null>(null);

const TOAST_DURATION = 8000;

export function UndoProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<UndoEntry | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback((entry: Omit<UndoEntry, "timestamp">) => {
    const full: UndoEntry = { ...entry, timestamp: Date.now() };
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(full);
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleUndo = useCallback(async () => {
    if (toast) {
      void toast.undo();
      dismiss();
    }
  }, [toast, dismiss]);

  return (
    <UndoContext.Provider value={{ push, canUndo: toast !== null }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-toast -translate-x-1/2 md:bottom-6"
        >
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#1a1a24] px-4 py-3 shadow-2xl backdrop-blur-xl">
            <span className="text-[13px] text-zinc-300">{toast.label}</span>
            <button
              onClick={handleUndo}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors",
                "bg-gold/15 text-gold hover:bg-gold/25",
              )}
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
            <button
              onClick={dismiss}
              className="rounded-md p-1 text-zinc-600 transition-colors hover:text-zinc-400"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </UndoContext.Provider>
  );
}

export function useUndoActions() {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error("useUndoActions must be used within UndoProvider");
  return ctx;
}
