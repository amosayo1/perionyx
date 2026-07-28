"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Pin,
  PinOff,
} from "lucide-react";
import { EmptyState } from "@/components/enterprise/empty-state";
import { Toolbar } from "./toolbar";
import { BulkActionBar } from "./bulk-action-bar";
import { ColumnResizeHandle } from "./column-resize-handle";
import { GroupHeader } from "./group-header";
import { TableSearch } from "./table-search";
import { TablePagination } from "./table-pagination";
import { useGrouping } from "./hooks/use-grouping";
import { useKeyboardNav } from "./hooks/use-keyboard-nav";
import { useTableViews } from "./hooks/use-table-views";
import { useColumnResize } from "./hooks/use-column-resize";
import { highlightMatches } from "./table-search";
import { CurrencyCell, NumberCell, DateCell, StatusCell, TrendCell } from "./cell-formatters";
import { InlineEdit } from "./inline-edit";
import { exportTable } from "./export-utils";
import type {
  Column,
  Density,
  SortDirection,
  SortState,
  EnterpriseTableProps,
  SavedView,
  FilterValue,
  FilterDef,
  TableInstance,
} from "./types";

function SortIcon({ active, direction, priority }: { active: boolean; direction: SortDirection; priority?: number }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40" />;
  return direction === "asc" ? (
    <ArrowUp className="ml-1 h-3 w-3 shrink-0 text-gold" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 shrink-0 text-gold" />
  );
}

function applyFilters<T>(data: T[], filterValues: FilterValue[], filterDefs: FilterDef[], columns: Column<T>[]): T[] {
  if (!filterValues.length) return data;
  const active = filterValues.filter((v) => v.value.trim() !== "");
  if (!active.length) return data;

  return data.filter((row) =>
    active.every((fv) => {
      const def = filterDefs.find((d) => d.id === fv.id);
      if (!def) return true;
      const col = columns.find((c) => c.id === fv.id);
      if (!col) return true;
      const cellVal = col.accessor(row)?.toString().toLowerCase() ?? "";
      const filterVal = fv.value.toLowerCase();

      switch (fv.operator) {
        case "eq": return cellVal === filterVal;
        case "neq": return cellVal !== filterVal;
        case "contains": return cellVal.includes(filterVal);
        case "gt": return Number(cellVal) > Number(filterVal);
        case "gte": return Number(cellVal) >= Number(filterVal);
        case "lt": return Number(cellVal) < Number(filterVal);
        case "lte": return Number(cellVal) <= Number(filterVal);
        default: return true;
      }
    }),
  );
}

function applySearch<T>(data: T[], searchValue: string, columns: Column<T>[]): T[] {
  if (!searchValue.trim()) return data;
  const q = searchValue.toLowerCase();
  return data.filter((row) =>
    columns.some((col) => {
      const val = col.accessor(row);
      return val?.toString().toLowerCase().includes(q) ?? false;
    }),
  );
}

function applyMultiSort<T>(data: T[], sorts: SortState[], columns: Column<T>[]): T[] {
  if (!sorts.length) return data;
  const sorted = [...data];
  for (const sort of [...sorts].reverse()) {
    const col = columns.find((c) => (c.sortKey ?? c.id) === sort.key);
    if (!col) continue;
    sorted.sort((a, b) => {
      if (col.comparator) {
        return sort.dir === "asc" ? col.comparator(a, b) : -col.comparator(a, b);
      }
      const aVal = col.accessor(a)?.toString() ?? "";
      const bVal = col.accessor(b)?.toString() ?? "";
      const cmp = aVal.localeCompare(bVal);
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }
  return sorted;
}

function applySort<T>(data: T[], sortKey: string | undefined, sortDir: SortDirection, columns: Column<T>[]): T[] {
  if (!sortKey) return data;
  const col = columns.find((c) => (c.sortKey ?? c.id) === sortKey);
  if (!col) return data;
  return [...data].sort((a, b) => {
    if (col.comparator) {
      return sortDir === "asc" ? col.comparator(a, b) : -col.comparator(a, b);
    }
    const aVal = col.accessor(a)?.toString() ?? "";
    const bVal = col.accessor(b)?.toString() ?? "";
    const cmp = aVal.localeCompare(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });
}

function useFilteredData<T>(
  data: T[],
  searchValue: string,
  columns: Column<T>[],
  filterValues: FilterValue[],
  filterDefs: FilterDef[],
  multiSort: SortState[],
  sortKey: string | undefined,
  sortDir: SortDirection,
): T[] {
  return useMemo(() => {
    let result = data;
    result = applySearch(result, searchValue, columns);
    result = applyFilters(result, filterValues, filterDefs, columns);
    if (multiSort.length > 0) {
      result = applyMultiSort(result, multiSort, columns);
    } else {
      result = applySort(result, sortKey, sortDir, columns);
    }
    return result;
  }, [data, searchValue, columns, filterValues, filterDefs, multiSort, sortKey, sortDir]);
}

function renderCell<T>(col: Column<T>, row: T, searchValue: string) {
  const cellConfig = col.cellConfig;
  const raw = col.accessor(row);
  const rawStr = raw?.toString() ?? "";

  if (cellConfig?.type === "currency") {
    const n = Number(rawStr);
    if (Number.isFinite(n)) {
      return <CurrencyCell value={n} currency={cellConfig.currency ?? "USD"} config={cellConfig} />;
    }
  }
  if (cellConfig?.type === "number") {
    const n = Number(rawStr);
    if (Number.isFinite(n)) return <NumberCell value={n} config={cellConfig} />;
  }
  if (cellConfig?.type === "date") {
    return <DateCell value={rawStr} config={cellConfig} />;
  }
  if (cellConfig?.type === "status") {
    return <StatusCell value={rawStr} />;
  }
  if (cellConfig?.type === "trend") {
    const n = Number(rawStr);
    if (Number.isFinite(n)) return <TrendCell value={n} />;
  }

  if (searchValue && typeof raw === "string") {
    return highlightMatches(raw, searchValue);
  }
  if (cellConfig?.type === "text" && typeof raw === "string" && cellConfig.truncate) {
    return (
      <span className="block truncate" style={{ maxWidth: cellConfig.truncate }} title={raw}>
        {raw}
      </span>
    );
  }

  return raw;
}

function renderRow<T>(
  row: T,
  id: string,
  visibleColumns: Column<T>[],
  hasRenderExpanded: boolean,
  hasSelection: boolean,
  hasContextMenu: boolean,
  isExpanded: boolean,
  isSelected: boolean,
  isFocused: boolean,
  rowDensityClass: string,
  searchValue: string,
  onRowClick: ((row: T) => void) | undefined,
  onRowDoubleClick: ((row: T) => void) | undefined,
  toggleExpand: (id: string) => void,
  toggleSelected: (id: string) => void,
  enableKeyboardNav: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  handleContextMenu: (e: React.MouseEvent, row: T) => void,
  index?: number,
) {
  return (
    <motion.tr
      key={id}
      variants={{
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2, delay: (index ?? 0) * 0.02 }}
      className={cn(
        "border-b border-white/[0.05] transition-colors hover:bg-white/[0.03] data-[state=selected]:bg-white/[0.05] cursor-pointer",
        isSelected && "bg-gold/5",
        isFocused && "ring-2 ring-inset ring-gold/40",
      )}
      onClick={() => {
        onRowClick?.(row);
        if (enableKeyboardNav) containerRef.current?.focus();
      }}
      onDoubleClick={() => onRowDoubleClick?.(row)}
      onContextMenu={(e) => handleContextMenu(e, row)}
      aria-selected={isSelected}
      aria-current={isFocused ? "true" : undefined}
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
      {hasSelection && (
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
            col.cellConfig?.type === "number" || col.cellConfig?.type === "currency" ? "text-right" : col.cellConfig?.align === "center" ? "text-center" : undefined,
            col.pin === "left" && "sticky left-0 z-[10] bg-surface-raised",
            col.pin === "right" && "sticky right-0 z-[10] bg-surface-raised",
          )}
        >
          {col.inlineEdit ? (
            <InlineEdit
              value={(renderCell(col, row, searchValue) ?? "")?.toString() ?? ""}
              row={row}
              config={col.inlineEdit}
              onSave={col.inlineEdit.onSave}
            />
          ) : (
            renderCell(col, row, searchValue)
          )}
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
            <DropdownMenuContent align="end" className="min-w-[160px]" />
          </DropdownMenu>
        </TableCell>
      )}
    </motion.tr>
  );
}

export function EnterpriseTable<T>({
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
  multiSort: externalMultiSort,
  onSort,
  onMultiSort,
  selectedIds,
  onSelectedIdsChange,
  density = "default",
  onDensityChange,
  hiddenColumns: externalHidden,
  onHiddenColumnsChange,
  columnWidths: externalWidths,
  onColumnWidthsChange,
  columnOrder: _externalColumnOrder,
  onColumnOrderChange: _onColumnOrderChange,
  onRowClick,
  onRowDoubleClick,
  renderExpanded,
  contextMenuItems,
  stickyHeader = true,
  maxHeight,
  pageSize = 50,
  page,
  onPageChange,
  totalItems,
  pageSizeOptions,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filterDefs = [],
  filterValues = [],
  onFilterChange,
  groupBy,
  onGroupByChange,
  bulkActions,
  savedViews: _externalViews,
  onSaveView: _externalSaveView,
  onLoadView: _externalLoadView,
  onDeleteView: _externalDeleteView,
  enableKeyboardNav = false,
  exportable = false,
  exportFilename,
  exportFormats,
  tableRef,
  locale: _locale,
}: EnterpriseTableProps<T>) {
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>();
  const [internalSortDir, setInternalSortDir] = useState<SortDirection>("desc");
  const [internalMultiSort, setInternalMultiSort] = useState<SortState[]>([]);
  const [internalHidden, setInternalHidden] = useState<Set<string>>(new Set());
  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [groupCollapsed, setGroupCollapsed] = useState<Set<string>>(new Set());
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; row: T } | null>(null);

  const currentSortKey = externalSortKey ?? internalSortKey;
  const currentSortDir = externalSortDir ?? internalSortDir;
  const currentMultiSort = externalMultiSort ?? internalMultiSort;
  const currentHidden = externalHidden ?? internalHidden;
  const currentPage = page ?? internalPage;
  const currentPageSize = pageSize ?? internalPageSize;
  const isMultiSortMode = currentMultiSort.length > 0;

  const { savedViews, saveView, deleteView, loadView } = useTableViews("enterprise-table");
  const { widths, getWidth, handleResizeStart, resetWidths } = useColumnResize({
    initialWidths: externalWidths,
    onWidthsChange: onColumnWidthsChange,
  });

  const filteredData = useFilteredData(data, searchValue, columns, filterValues, filterDefs, currentMultiSort, currentSortKey, currentSortDir);

  const groupedFiltered = useMemo(() => {
    if (!groupBy) return { groups: [], flatData: filteredData };
    const col = columns.find((c) => c.id === groupBy);
    if (!col || !col.groupable) return { groups: [], flatData: filteredData };
    const groupsMap = new Map<string, T[]>();
    for (const row of filteredData) {
      const val = col.accessor(row);
      const key = val?.toString() ?? "(empty)";
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(row);
    }
    const resultGroups = Array.from(groupsMap.entries()).map(([key, rows]) => ({ key, label: key, rows, count: rows.length }));
    const resultFlat = resultGroups.flatMap((g) => (groupCollapsed.has(g.key) ? [] : g.rows));
    return { groups: resultGroups, flatData: resultFlat };
  }, [filteredData, groupBy, columns, groupCollapsed]);

  const totalPages = totalItems ? Math.ceil(totalItems / currentPageSize) : Math.ceil(filteredData.length / currentPageSize);

  const displayData = useMemo(() => {
    const source = groupBy ? groupedFiltered.flatData : filteredData;
    if (totalItems) return source.slice(currentPage * currentPageSize, (currentPage + 1) * currentPageSize);
    return source;
  }, [groupBy, groupedFiltered.flatData, filteredData, totalItems, currentPage, currentPageSize]);

  const visibleColumns = useMemo(() => columns.filter((c) => !currentHidden.has(c.id)), [columns, currentHidden]);
  const rowCount = useMemo(() => displayData.length, [displayData]);
  const focusedIndexRef = useRef<number | null>(null);

  const handleSort = useCallback(
    (col: Column<T>) => {
      const key = col.sortKey ?? col.id;
      if (onMultiSort) {
        const existing = currentMultiSort.find((s) => s.key === key);
        if (existing) {
          if (existing.dir === "desc") {
            onMultiSort(currentMultiSort.filter((s) => s.key !== key));
          } else {
            onMultiSort(currentMultiSort.map((s) => (s.key === key ? { ...s, dir: "desc" as SortDirection } : s)));
          }
        } else {
          onMultiSort([...currentMultiSort, { key, dir: "desc" as SortDirection, priority: currentMultiSort.length }]);
        }
        return;
      }
      if (onSort) {
        onSort(key, currentSortKey === key && currentSortDir === "asc" ? "desc" : "asc");
      } else {
        if (internalSortKey === key) {
          setInternalSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setInternalSortKey(key);
          setInternalSortDir("desc");
        }
      }
    },
    [onSort, onMultiSort, currentMultiSort, internalSortKey, currentSortKey, currentSortDir],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const toggleGroupCollapse = useCallback((key: string) => {
    setGroupCollapsed((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }, []);

  const toggleAllSelected = useCallback(() => {
    if (!onSelectedIdsChange) return;
    if (selectedIds && selectedIds.size === displayData.length && displayData.length > 0) {
      onSelectedIdsChange(new Set());
    } else {
      onSelectedIdsChange(new Set(displayData.map((r) => keyExtractor(r))));
    }
  }, [onSelectedIdsChange, selectedIds, displayData, keyExtractor]);

  const toggleSelected = useCallback(
    (id: string) => {
      if (!onSelectedIdsChange) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      onSelectedIdsChange(next);
    },
    [onSelectedIdsChange, selectedIds],
  );

  const rowDensityClass =
    density === "ultra-compact" ? "py-1 text-[13px]" :
    density === "compact" ? "py-1.5 text-sm" :
    density === "default" ? "py-2 text-sm" :
    "py-2.5";

  const hasRenderExpanded = !!renderExpanded;
  const hasSelection = !!onSelectedIdsChange;
  const hasContextMenu = !!(contextMenuItems);

  const handleExport = useCallback(
    (format: "csv" | "xls") => {
      if (exportFilename) {
        exportTable(filteredData, columns, currentHidden, format, exportFilename);
      }
    },
    [filteredData, columns, currentHidden, exportFilename],
  );

  const handleSaveView = useCallback(
    (name: string) => {
      saveView(name, {
        sortKey: currentSortKey,
        sortDir: currentSortDir,
        hiddenColumns: Array.from(currentHidden),
        columnWidths: widths,
        density,
        filters: filterValues,
        groupBy,
      });
    },
    [saveView, currentSortKey, currentSortDir, currentHidden, widths, density, filterValues, groupBy],
  );

  const handleLoadView = useCallback(
    (view: SavedView) => {
      const state = loadView(view.id);
      if (!state) return;
      if (state.sortKey !== undefined && state.sortDir !== undefined) {
        (onSort ?? setInternalSortKey as any)(state.sortKey, state.sortDir);
      }
      (onHiddenColumnsChange ?? setInternalHidden as any)(new Set(state.hiddenColumns));
      (onColumnWidthsChange ?? resetWidths as any)(state.columnWidths);
      (onDensityChange ?? (() => {}) as any)(state.density);
      (onFilterChange ?? (() => {}) as any)(state.filters);
      if (state.groupBy !== undefined) onGroupByChange?.(state.groupBy);
    },
    [loadView, onSort, onHiddenColumnsChange, onColumnWidthsChange, resetWidths, onDensityChange, onFilterChange, onGroupByChange],
  );

  const handleDeleteView = useCallback((viewId: string) => deleteView(viewId), [deleteView]);

  const { containerRef, focusedIndex } = useKeyboardNav({
    enabled: enableKeyboardNav,
    rowCount,
    onRowActivate: (index) => { const row = displayData[index]; if (row) onRowClick?.(row); },
    onRowSelect: (index) => { const row = displayData[index]; if (row) toggleSelected(keyExtractor(row)); },
  });
  focusedIndexRef.current = focusedIndex;

  React.useImperativeHandle(
    tableRef,
    () => ({
      scrollToTop: () => containerRef.current?.scrollTo?.({ top: 0, behavior: "smooth" }),
      focusedRow: focusedIndex,
      focusNextRow: () => {},
      focusPrevRow: () => {},
    } as TableInstance),
    [containerRef, focusedIndex],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, row: T) => {
    e.preventDefault();
    setContextMenuState({ x: e.clientX, y: e.clientY, row });
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-400" role="alert">{error}</p>
      </div>
    );
  }

  if (!loading && filteredData.length === 0) {
    return (
      <div className="space-y-4">
        <Toolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange ?? (() => {})}
          searchPlaceholder={searchPlaceholder}
          columns={columns}
          hiddenColumns={currentHidden}
          onHiddenColumnsChange={onHiddenColumnsChange ?? setInternalHidden}
          density={density}
          onDensityChange={onDensityChange ?? (() => {})}
          exportable={exportable}
          exportFormats={exportFormats}
          onExport={handleExport}
          savedViews={savedViews}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onDeleteView={handleDeleteView}
          filterDefs={filterDefs}
          filterValues={filterValues}
          onFilterChange={onFilterChange ?? (() => {})}
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
        />
        <EmptyState title={emptyTitle ?? "No data"} description={emptyDescription ?? "There are no records to display."} action={emptyAction} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3" role={enableKeyboardNav ? "grid" : undefined} aria-label="Data table">
      {bulkActions && selectedIds && selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          actions={bulkActions}
          selectedRows={displayData.filter((r) => selectedIds.has(keyExtractor(r)))}
          onClear={() => onSelectedIdsChange?.(new Set())}
        />
      )}

      <Toolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange ?? (() => {})}
        searchPlaceholder={searchPlaceholder}
        columns={columns}
        hiddenColumns={currentHidden}
        onHiddenColumnsChange={onHiddenColumnsChange ?? setInternalHidden}
        density={density}
        onDensityChange={onDensityChange ?? (() => {})}
        exportable={exportable}
        exportFormats={exportFormats}
        onExport={handleExport}
        savedViews={savedViews}
        onSaveView={handleSaveView}
        onLoadView={handleLoadView}
        onDeleteView={handleDeleteView}
        filterDefs={filterDefs}
        filterValues={filterValues}
        onFilterChange={onFilterChange ?? (() => {})}
        groupBy={groupBy}
        onGroupByChange={onGroupByChange}
      />

      <div
        className={cn(
          "relative w-full overflow-auto rounded-[28px] border border-[rgba(255,255,255,0.09)] bg-[linear-gradient(120deg,#111118_80%,rgba(212,175,55,0.03)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.22)]",
          stickyHeader && (maxHeight ?? "max-h-[70vh]"),
        )}
        style={maxHeight && !stickyHeader ? { maxHeight } : undefined}
      >
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 z-10")}>
            <TableRow>
              {hasRenderExpanded && <TableHead className="w-8" />}
              {hasSelection && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds ? selectedIds.size === displayData.length && displayData.length > 0 : false}
                    onCheckedChange={toggleAllSelected}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isActiveSort = isMultiSortMode
                  ? currentMultiSort.some((s) => s.key === (col.sortKey ?? col.id))
                  : currentSortKey === (col.sortKey ?? col.id);
                const sortPriority = isMultiSortMode
                  ? currentMultiSort.find((s) => s.key === (col.sortKey ?? col.id))?.priority
                  : undefined;
                const colWidth = getWidth(col.id, col.minWidth);
                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "group cursor-pointer select-none relative",
                      col.headerClassName,
                      col.cellConfig?.type === "number" || col.cellConfig?.type === "currency" ? "text-right" : col.cellConfig?.align === "center" ? "text-center" : undefined,
                      col.pin === "left" && "sticky left-0 z-[10] bg-surface-raised",
                      col.pin === "right" && "sticky right-0 z-[10] bg-surface-raised",
                    )}
                    style={col.width || colWidth ? { width: col.width ?? colWidth, minWidth: col.minWidth } : undefined}
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      <SortIcon active={!!isActiveSort} direction={currentSortDir} priority={sortPriority} />
                    </div>
                    {col.resizable !== false && (
                      <ColumnResizeHandle onResizeStart={(e) => handleResizeStart(col.id, e)} />
                    )}
                  </TableHead>
                );
              })}
              {hasContextMenu && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {hasRenderExpanded && <TableCell className="w-8" />}
                  {hasSelection && <TableCell className="w-10"><Skeleton className="h-4 w-4" /></TableCell>}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} className={cn(rowDensityClass)}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                  {hasContextMenu && <TableCell className="w-12"><Skeleton className="h-4 w-4" /></TableCell>}
                </TableRow>
              ))
            ) : (
              <>
                {groupBy && groupedFiltered.groups.length > 0 && (
                  groupedFiltered.groups.map((group) => (
                    <React.Fragment key={group.key}>
                      <GroupHeader
                        label={group.label}
                        count={group.count}
                        expanded={!groupCollapsed.has(group.key)}
                        onToggle={() => toggleGroupCollapse(group.key)}
                      />
                      {!groupCollapsed.has(group.key) &&
                        group.rows.slice(currentPage * currentPageSize, (currentPage + 1) * currentPageSize).map((row, ri) => {
                          const id = keyExtractor(row);
                          return renderRow(
                            row, id, visibleColumns,
                            hasRenderExpanded, hasSelection, hasContextMenu,
                            expandedIds.has(id), selectedIds?.has(id) ?? false,
                            enableKeyboardNav && focusedIndex === displayData.indexOf(row),
                            rowDensityClass, searchValue,
                            onRowClick, onRowDoubleClick, toggleExpand, toggleSelected,
                            enableKeyboardNav, containerRef, handleContextMenu, ri,
                          );
                        })}
                    </React.Fragment>
                  ))
                )}

                {!groupBy && displayData.map((row, ri) => {
                  const id = keyExtractor(row);
                  return renderRow(
                    row, id, visibleColumns,
                    hasRenderExpanded, hasSelection, hasContextMenu,
                    expandedIds.has(id), selectedIds?.has(id) ?? false,
                    enableKeyboardNav && focusedIndex === displayData.indexOf(row),
                    rowDensityClass, searchValue,
                    onRowClick, onRowDoubleClick, toggleExpand, toggleSelected,
                    enableKeyboardNav, containerRef, handleContextMenu, ri,
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={currentPageSize}
          totalItems={totalItems ?? filteredData.length}
          onPageChange={onPageChange ?? setInternalPage}
          onPageSizeChange={pageSizeOptions ? setInternalPageSize : undefined}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
