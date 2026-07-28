"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";
import type { Column, DataTableProps, Density, SortDirection } from "./types";
import { DensityToggle } from "./density-toggle";
import { ColumnVisibility } from "./column-visibility";
import { ContextMenu } from "./context-menu";

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40" />;
  return direction === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3 shrink-0 text-gold" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 shrink-0 text-gold" />
  );
}

function exportToCsv<T>(data: T[], columns: Column<T>[], filename: string) {
  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = col.accessor(row);
        const s = val?.toString() ?? "";
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  emptyAction,
  sortKey: externalSortKey,
  sortDir: externalSortDir,
  onSort,
  onRowClick,
  selectedIds,
  onSelectedIdsChange,
  density = "comfortable",
  onDensityChange,
  hiddenColumns: externalHidden,
  onHiddenColumnsChange,
  renderExpanded,
  contextMenuItems,
  onCopyId,
  stickyHeader = true,
  pageSize = 50,
  page,
  onPageChange,
  totalItems,
  exportFilename,
}: DataTableProps<T>) {
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>();
  const [internalSortDir, setInternalSortDir] = useState<SortDirection>("desc");
  const [internalHidden, setInternalHidden] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: T } | null>(null);
  const [internalPage, setInternalPage] = useState(0);

  const currentSortKey = externalSortKey ?? internalSortKey;
  const currentSortDir = externalSortDir ?? internalSortDir;
  const currentHidden = externalHidden ?? internalHidden;
  const currentPage = page ?? internalPage;
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);

  const handleSort = useCallback(
    (col: Column<T>) => {
      const key = col.sortKey ?? col.id;
      if (onSort) {
        onSort(key);
      } else {
        if (internalSortKey === key) {
          setInternalSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setInternalSortKey(key);
          setInternalSortDir("desc");
        }
      }
    },
    [onSort, internalSortKey],
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !currentHidden.has(c.id)),
    [columns, currentHidden],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const displayData = totalItems ? paginatedData : data;

  const handleCopy = useCallback(
    (id: string) => {
      navigator.clipboard.writeText(id).catch(() => {});
      onCopyId?.(id);
    },
    [onCopyId],
  );

  const toggleAllSelected = useCallback(() => {
    if (!onSelectedIdsChange) return;
    if (selectedIds && selectedIds.size === displayData.length) {
      onSelectedIdsChange(new Set());
    } else {
      onSelectedIdsChange(new Set(displayData.map((r) => keyExtractor(r))));
    }
  }, [onSelectedIdsChange, selectedIds, displayData, keyExtractor]);

  const toggleSelected = useCallback(
    (id: string) => {
      if (!onSelectedIdsChange) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectedIdsChange(next);
    },
    [onSelectedIdsChange, selectedIds],
  );

  const rowDensityClass = density === "compact" ? "py-1.5 text-sm" : "py-2.5";
  const hasRenderExpanded = !!renderExpanded;
  const hasSelection = !!onSelectedIdsChange;
  const hasContextMenu = !!(contextMenuItems || onCopyId);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-400" role="alert">{error}</p>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? "No data"}
        description={emptyDescription ?? "There are no records to display."}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(onDensityChange || onHiddenColumnsChange || exportFilename) && (
        <div className="flex items-center justify-between">
          {selectedIds && selectedIds.size > 0 && (
            <span className="text-xs text-zinc-400">
              {selectedIds.size} selected
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {exportFilename && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportToCsv(data, columns, exportFilename)}
                className="gap-1.5 text-xs text-zinc-400 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
            )}
            {onDensityChange && <DensityToggle density={density} onChange={onDensityChange} />}
            {onHiddenColumnsChange && (
              <ColumnVisibility
                columns={columns}
                hidden={currentHidden}
                onChange={onHiddenColumnsChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "relative w-full overflow-auto rounded-[28px] border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(120deg,#111118_80%,rgba(212,175,55,0.03)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.22)]",
          stickyHeader && "max-h-[70vh]",
        )}
      >
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 z-10")}>
            <TableRow>
              {hasRenderExpanded && <TableHead className="w-8" />}
              {onSelectedIdsChange && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds ? selectedIds.size === displayData.length && displayData.length > 0 : false}
                    onCheckedChange={toggleAllSelected}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isActiveSort = currentSortKey === (col.sortKey ?? col.id);
                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "group cursor-pointer select-none",
                      col.headerClassName,
                      col.sticky === "left" && "sticky left-0 z-[11] bg-[#111118]",
                      col.sticky === "right" && "sticky right-0 z-[11] bg-[#111118]",
                    )}
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      <SortIcon active={isActiveSort} direction={currentSortDir} />
                    </div>
                  </TableHead>
                );
              })}
              {hasContextMenu && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {hasRenderExpanded && <TableCell className="w-8" />}
                    {onSelectedIdsChange && <TableCell className="w-10"><Skeleton className="h-4 w-4" /></TableCell>}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.id} className={cn(rowDensityClass)}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                    {hasContextMenu && <TableCell className="w-12"><Skeleton className="h-4 w-4" /></TableCell>}
                  </TableRow>
                ))
              : displayData.map((row) => {
                  const id = keyExtractor(row);
                  const isExpanded = expandedIds.has(id);
                  const isSelected = selectedIds?.has(id);
                  return (
                    <React.Fragment key={id}>
                      <TableRow
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-gold/5",
                        )}
                        onClick={() => onRowClick?.(row)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, row });
                        }}
                      >
                        {hasRenderExpanded && (
                           <TableCell className="w-8" onClick={(e) => { e.stopPropagation(); toggleExpand(id); }}>
                            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Toggle row details">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                        {onSelectedIdsChange && (
                          <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={!!isSelected}
                              onCheckedChange={() => toggleSelected(id)}
                              aria-label={`Select row ${id}`}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.map((col) => (
                          <TableCell
                            key={col.id}
                            className={cn(
                              rowDensityClass,
                              col.className,
                              col.sticky === "left" && "sticky left-0 z-[11] bg-[#111118]",
                              col.sticky === "right" && "sticky right-0 z-[11] bg-[#111118]",
                            )}
                          >
                            {col.accessor(row)}
                          </TableCell>
                        ))}
                        {hasContextMenu && (
                          <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" aria-label="Row actions">
                                  <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[160px]">
                                {onCopyId && (
                                  <DropdownMenuItem onClick={() => handleCopy(id)}>
                                    <Copy className="mr-2 h-3.5 w-3.5" />
                                    Copy ID
                                  </DropdownMenuItem>
                                )}
                                {contextMenuItems?.(row).map((item, idx) => (
                                  <DropdownMenuItem key={idx} onClick={item.onClick} disabled={item.disabled}>
                                    {item.icon && <span className="mr-2 h-3.5 w-3.5">{item.icon}</span>}
                                    {item.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                      {renderExpanded && isExpanded && (
                        <TableRow>
                          <TableCell
                            colSpan={
                              (hasRenderExpanded ? 1 : 0) +
                              (hasSelection ? 1 : 0) +
                              visibleColumns.length +
                              (hasContextMenu ? 1 : 0)
                            }
                            className="border-b border-white/[0.06] bg-zinc-900/30 p-0"
                          >
                            <div className="px-6 py-4">{renderExpanded(row)}</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalItems ?? data.length)} of{" "}
            {totalItems ?? data.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => (onPageChange ?? setInternalPage)(currentPage - 1)}
              className="text-xs text-zinc-400"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => (onPageChange ?? setInternalPage)(pageNum)}
                  className={cn(
                    "h-7 min-w-[28px] text-xs",
                    pageNum === currentPage && "bg-gold/10 text-gold",
                  )}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => (onPageChange ?? setInternalPage)(currentPage + 1)}
              className="text-xs text-zinc-400"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
