"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const COLUMN_MAP: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div className={cn("grid gap-3", COLUMN_MAP[columns] ?? COLUMN_MAP[4], className)}>
      {children}
    </div>
  );
}
