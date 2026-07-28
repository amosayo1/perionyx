"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SearchToolbar({ value, onChange, placeholder = "Search...", filters, actions, className }: SearchToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="relative min-w-[240px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] pl-10 pr-4 text-sm text-white shadow-sm placeholder:text-zinc-500 transition-all duration-200 ease-out focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>
      {filters && <div className="flex items-center gap-2">{filters}</div>}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
