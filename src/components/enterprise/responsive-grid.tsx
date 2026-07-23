"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 3 | 4 | 6 | 8;
  className?: string;
}

const COLUMN_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

const GAP_MAP: Record<number, string> = {
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
};

export function ResponsiveGrid({ children, columns = 2, gap = 6, className }: ResponsiveGridProps) {
  return (
    <div className={cn(COLUMN_MAP[columns] ?? COLUMN_MAP[2], GAP_MAP[gap] ?? GAP_MAP[6], className)}>
      {children}
    </div>
  );
}
