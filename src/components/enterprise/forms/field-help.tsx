"use client";

import { cn } from "@/lib/utils";

interface FieldHelpProps {
  children: string;
  className?: string;
}

export function FieldHelp({ children, className }: FieldHelpProps) {
  return (
    <p className={cn("text-[11px] text-zinc-500 leading-relaxed", className)}>
      {children}
    </p>
  );
}
