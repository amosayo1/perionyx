"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ page, pageSize, totalItems, onPageChange }: PaginationBarProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalItems);
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);
  let startPage = Math.max(0, page - half);
  let endPage = Math.min(totalPages - 1, page + half);
  if (endPage - startPage + 1 < maxVisible) {
    if (startPage === 0) endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    else startPage = Math.max(0, endPage - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
      <span className="text-xs text-zinc-500">
        {startItem}–{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-[2rem] px-2 text-xs ${
              p === page ? "bg-gold/10 text-gold" : "text-zinc-400"
            }`}
          >
            {p + 1}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
