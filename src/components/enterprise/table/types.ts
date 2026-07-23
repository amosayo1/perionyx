import type { ReactNode } from "react";
import type {
  Column as BaseColumn,
  SortDirection,
  Density as BaseDensity,
  FilterDef,
} from "@/components/data-table/types";

export type { SortDirection, FilterDef };

export type Density = BaseDensity | "default" | "ultra-compact";

export interface SortState {
  key: string;
  dir: SortDirection;
  priority: number;
}

export interface CellConfig {
  type?: "text" | "number" | "currency" | "date" | "status" | "trend" | "tags";
  currency?: string;
  locale?: string;
  fractionDigits?: number;
  align?: "left" | "right" | "center";
  negativeRed?: boolean;
  abbreviate?: boolean;
  relative?: boolean;
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "short" | "long" | "full";
  truncate?: number;
}

export interface InlineEditConfig<T> {
  type: "text" | "number" | "currency" | "date" | "select" | "tags";
  options?: { value: string; label: string }[];
  validate?: (value: string, row: T) => string | undefined;
  onSave: (value: string, row: T) => Promise<void> | void;
  placeholder?: string;
}

export interface Column<T> extends BaseColumn<T> {
  resizable?: boolean;
  width?: number;
  minWidth?: number;
  groupable?: boolean;
  cellConfig?: CellConfig;
  inlineEdit?: InlineEditConfig<T>;
  pin?: "left" | "right";
}

export interface SavedView {
  id: string;
  name: string;
  sortKey?: string;
  sortDir?: SortDirection;
  multiSort?: SortState[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  density: Density;
  filters: FilterValue[];
  groupBy?: string;
  columnOrder?: string[];
  pageSize?: number;
  createdAt: number;
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline";
}

export interface TableInstance {
  scrollToTop: () => void;
  focusedRow: number | null;
  focusNextRow: () => void;
  focusPrevRow: () => void;
}

export interface FilterValue {
  id: string;
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte" | "between";
  value: string;
  value2?: string;
  logic?: "AND" | "OR";
}

export interface RelativeDatePreset {
  label: string;
  getValue: () => { start: string; end: string };
}

export const RELATIVE_DATE_PRESETS: RelativeDatePreset[] = [
  {
    label: "Today",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
  {
    label: "This Week",
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
  {
    label: "Last 30 Days",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
  {
    label: "Last Quarter",
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
  {
    label: "This Year",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: start.toISOString(), end: now.toISOString() };
    },
  },
];

export interface EnterpriseTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;

  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  sortKey?: string;
  sortDir?: SortDirection;
  multiSort?: SortState[];
  onSort?: (key: string, dir: SortDirection) => void;
  onMultiSort?: (sorts: SortState[]) => void;

  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;

  density?: Density;
  onDensityChange?: (d: Density) => void;

  hiddenColumns?: Set<string>;
  onHiddenColumnsChange?: (ids: Set<string>) => void;

  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;

  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;

  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  renderExpanded?: (row: T) => ReactNode;
  contextMenuItems?: (row: T) => { label: string; icon?: ReactNode; onClick: () => void; disabled?: boolean }[];

  stickyHeader?: boolean;
  maxHeight?: string;

  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  pageSizeOptions?: number[];

  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  filterDefs?: FilterDef[];
  filterValues?: FilterValue[];
  onFilterChange?: (values: FilterValue[]) => void;

  groupBy?: string;
  onGroupByChange?: (columnId: string | undefined) => void;

  bulkActions?: BulkAction<T>[];

  savedViews?: SavedView[];
  onSaveView?: (view: Omit<SavedView, "id" | "createdAt">) => void;
  onLoadView?: (view: SavedView) => void;
  onDeleteView?: (viewId: string) => void;

  enableKeyboardNav?: boolean;

  exportable?: boolean;
  exportFilename?: string;
  onExport?: (rows: T[]) => void;
  exportFormats?: ("csv" | "xls")[];

  tableRef?: React.RefObject<TableInstance | null>;

  locale?: string;
}
