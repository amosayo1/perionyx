"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Columns, Eye, EyeOff } from "lucide-react";
import type { Column } from "./types";

interface Props<T> {
  columns: Column<T>[];
  hidden: Set<string>;
  onChange: (hidden: Set<string>) => void;
}

export function ColumnVisibility<T>({ columns, hidden, onChange }: Props<T>) {
  const toggle = (colId: string) => {
    const next = new Set(hidden);
    if (next.has(colId)) next.delete(colId);
    else next.add(colId);
    onChange(next);
  };

  const visibleCount = columns.length - hidden.size;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-400 hover:text-white">
          <Columns className="h-3.5 w-3.5" />
          Columns ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Column Visibility
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns
          .filter((c) => c.hideable !== false)
          .map((col) => (
            <DropdownMenuItem key={col.id} onClick={() => toggle(col.id)} className="text-sm">
              {hidden.has(col.id) ? (
                <EyeOff className="mr-2 h-3.5 w-3.5 text-zinc-600" />
              ) : (
                <Eye className="mr-2 h-3.5 w-3.5 text-[#d4af37]" />
              )}
              {col.header}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
