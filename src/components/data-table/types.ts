import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortKey?: string;
  comparator?: (a: T, b: T) => number;
  hideable?: boolean;
  initiallyVisible?: boolean;
  className?: string;
  headerClassName?: string;
  sticky?: "left" | "right";
}

export type Density = "compact" | "comfortable";

export interface FilterDef {
  id: string;
  label: string;
  type: "select" | "text" | "number" | "date" | "date-range";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  id: string;
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte" | "between";
  value: string;
  value2?: string;
}

export interface DataTableProps<T> {
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
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  density?: Density;
  onDensityChange?: (d: Density) => void;
  hiddenColumns?: Set<string>;
  onHiddenColumnsChange?: (ids: Set<string>) => void;
  renderExpanded?: (row: T) => ReactNode;
  contextMenuItems?: (row: T) => { label: string; icon?: ReactNode; onClick: () => void; disabled?: boolean }[];
  onCopyId?: (id: string) => void;
  stickyHeader?: boolean;
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  exportFilename?: string;
}
