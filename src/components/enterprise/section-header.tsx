"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-zinc-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
