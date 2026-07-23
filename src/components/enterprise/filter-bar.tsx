"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function FilterBar({ children, label, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {label && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
}
