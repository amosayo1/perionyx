"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionToolbarProps {
  children: ReactNode;
  className?: string;
}

export function ActionToolbar({ children, className }: ActionToolbarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {children}
    </div>
  );
}
