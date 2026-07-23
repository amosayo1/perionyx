"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TouchToolbarAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

interface TouchToolbarProps {
  actions: TouchToolbarAction[];
  className?: string;
  swipeEnabled?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD = 50;

export function TouchToolbar({ actions, className, swipeEnabled, onSwipeLeft, onSwipeRight }: TouchToolbarProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  }, [swipeEnabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping || !swipeEnabled) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipeOffset(dx);
    }
  }, [swiping, swipeEnabled]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeEnabled) return;
    if (swipeOffset > SWIPE_THRESHOLD) onSwipeRight?.();
    else if (swipeOffset < -SWIPE_THRESHOLD) onSwipeLeft?.();
    setSwiping(false);
    setSwipeOffset(0);
  }, [swipeOffset, swipeEnabled, onSwipeLeft, onSwipeRight]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto px-2 py-2 scrollbar-none",
        swipeEnabled && "touch-pan-y",
        className,
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={swiping ? { transform: `translateX(${swipeOffset}px)`, transition: "none" } : undefined}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium active:scale-95 transition-transform min-h-[36px] min-w-[36px]",
            action.destructive
              ? "bg-red-500/10 text-red-400 active:bg-red-500/20"
              : action.disabled
                ? "bg-zinc-900/30 text-zinc-700"
                : "bg-zinc-900/60 text-zinc-300 active:bg-zinc-800 active:text-zinc-100",
          )}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
