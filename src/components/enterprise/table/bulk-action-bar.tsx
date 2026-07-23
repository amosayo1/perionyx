"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { BulkAction } from "./types";

interface BulkActionBarProps<T> {
  selectedCount: number;
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClear: () => void;
}

export function BulkActionBar<T>({ selectedCount, actions, selectedRows, onClear }: BulkActionBarProps<T>) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2.5">
      <button
        onClick={onClear}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10"
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5 text-zinc-400" />
      </button>
      <span className="text-sm text-white">
        {selectedCount} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        {actions.map((action, i) => (
          <Button
            key={i}
            size="sm"
            variant={action.variant ?? "outline"}
            disabled={action.disabled}
            onClick={() => action.onClick(selectedRows)}
            className="gap-1.5 text-xs"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
