"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseKeyboardNavOptions {
  enabled?: boolean;
  rowCount: number;
  onRowActivate: (index: number) => void;
  onRowSelect?: (index: number) => void;
  onEscape?: () => void;
}

export function useKeyboardNav({
  enabled = false,
  rowCount,
  onRowActivate,
  onRowSelect,
  onEscape,
}: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev === null ? 0 : Math.min(prev + 1, rowCount - 1);
            return next;
          });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev === null ? 0 : Math.max(prev - 1, 0);
            return next;
          });
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusedIndex !== null) {
            onRowActivate(focusedIndex);
          }
          break;
        }
        case " ": {
          e.preventDefault();
          if (focusedIndex !== null && onRowSelect) {
            onRowSelect(focusedIndex);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          setFocusedIndex(null);
          onEscape?.();
          break;
        }
        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          setFocusedIndex(rowCount - 1);
          break;
        }
      }
    },
    [enabled, rowCount, focusedIndex, onRowActivate, onRowSelect, onEscape],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;
    el.addEventListener("keydown", handleKeyDown);
    el.setAttribute("tabindex", "0");
    el.focus();
    return () => {
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  const focusNextRow = useCallback(() => {
    setFocusedIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, rowCount - 1)));
  }, [rowCount]);

  const focusPrevRow = useCallback(() => {
    setFocusedIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
  }, [rowCount]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    focusNextRow,
    focusPrevRow,
  };
}
