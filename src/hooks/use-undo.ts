"use client";

import { useCallback, useRef, useState } from "react";

export interface UndoEntry {
  id: string;
  label: string;
  timestamp: number;
  undo: () => void | Promise<void>;
  redo?: () => void | Promise<void>;
}

interface UseUndoOptions {
  /** Maximum entries to keep in history. Default: 20 */
  maxHistory?: number;
  /** Auto-dismiss timeout in ms for undo toasts. Default: 8000 */
  toastTimeout?: number;
}

export function useUndo({ maxHistory = 20, toastTimeout = 8000 }: UseUndoOptions = {}) {
  const [entries, setEntries] = useState<UndoEntry[]>([]);
  const [activeToast, setActiveToast] = useState<UndoEntry | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback(
    (entry: Omit<UndoEntry, "timestamp">) => {
      const full: UndoEntry = { ...entry, timestamp: Date.now() };
      setEntries((prev) => [full, ...prev].slice(0, maxHistory));

      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveToast(full);
      timerRef.current = setTimeout(() => setActiveToast(null), toastTimeout);
    },
    [maxHistory, toastTimeout],
  );

  const undo = useCallback(
    async (id?: string) => {
      setEntries((prev) => {
        const target = id ? prev.find((e) => e.id === id) : prev[0];
        if (target) {
          void target.undo();
          return prev.filter((e) => e.id !== target.id);
        }
        return prev;
      });
      setActiveToast(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const redo = useCallback(
    async (id: string) => {
      setEntries((prev) => {
        const target = prev.find((e) => e.id === id);
        if (target?.redo) {
          void target.redo();
        }
        return prev;
      });
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { entries, activeToast, push, undo, redo, dismissToast };
}
