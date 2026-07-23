"use client";

import { useCallback, useRef, useState } from "react";

interface UseColumnResizeOptions {
  initialWidths?: Record<string, number>;
  onWidthsChange?: (widths: Record<string, number>) => void;
  defaultWidth?: number;
}

export function useColumnResize({ initialWidths, onWidthsChange, defaultWidth = 150 }: UseColumnResizeOptions) {
  const [widths, setWidths] = useState<Record<string, number>>(initialWidths ?? {});
  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const getWidth = useCallback(
    (columnId: string, minWidth?: number): number => {
      const w = widths[columnId] ?? defaultWidth;
      return minWidth ? Math.max(w, minWidth) : w;
    },
    [widths, defaultWidth],
  );

  const handleResizeStart = useCallback(
    (columnId: string, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      resizingRef.current = {
        columnId,
        startX: clientX,
        startWidth: widths[columnId] ?? defaultWidth,
      };

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!resizingRef.current) return;
        const currentX = "touches" in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const diff = currentX - resizingRef.current.startX;
        const newWidth = Math.max(resizingRef.current.startWidth + diff, 48);
        setWidths((prev) => {
          const next = { ...prev, [resizingRef.current!.columnId]: newWidth };
          onWidthsChange?.(next);
          return next;
        });
      };

      const handleUp = () => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [widths, defaultWidth, onWidthsChange],
  );

  const resetWidths = useCallback(() => {
    setWidths({});
    onWidthsChange?.({});
  }, [onWidthsChange]);

  return { widths, getWidth, handleResizeStart, resetWidths };
}
