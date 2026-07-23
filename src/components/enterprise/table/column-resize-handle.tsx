"use client";

import { cn } from "@/lib/utils";

interface ColumnResizeHandleProps {
  onResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
}

export function ColumnResizeHandle({ onResizeStart, className }: ColumnResizeHandleProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 z-20 h-full w-1 cursor-col-resize",
        "hover:w-1.5 hover:bg-[#d4af37]/40",
        "active:w-1.5 active:bg-[#d4af37]/60",
        "transition-all duration-150",
        className,
      )}
      onMouseDown={onResizeStart}
      onTouchStart={onResizeStart}
      role="separator"
      aria-label="Resize column"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          onResizeStart(e as unknown as React.MouseEvent);
        }
      }}
    />
  );
}
