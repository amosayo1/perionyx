"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 200],
}: TablePaginationProps) {
  const pages = useMemo(() => {
    const items: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) items.push(i);
    } else {
      items.push(0);
      if (currentPage > 2) items.push("...");
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
        items.push(i);
      }
      if (currentPage < totalPages - 3) items.push("...");
      items.push(totalPages - 1);
    }
    return items;
  }, [currentPage, totalPages]);

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">
          {start}–{end} of {totalItems}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-600">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-white/[0.06] bg-zinc-900/60 px-1.5 text-xs text-zinc-400 outline-none focus:border-[#d4af37]/40"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:text-zinc-700"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-700">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-7 min-w-[28px] text-xs",
                page === currentPage
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {page + 1}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:text-zinc-700"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
